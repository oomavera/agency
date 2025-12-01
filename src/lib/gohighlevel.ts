type GHLResult =
  | { success: true; skipped: false; contactId?: string; opportunityId?: string | null }
  | { success: false; skipped: true; error: string }
  | { success: false; skipped: false; error: string };

const API_BASE = process.env.GHL_API_BASE?.trim() || 'https://rest.gohighlevel.com/v1';

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

export async function addLeadToGoHighLevel({
  name,
  phone,
  email,
  page,
  source,
}: {
  name: string;
  phone: string;
  email?: string | null;
  page?: string;
  source?: string;
}): Promise<GHLResult> {
  const apiKey = process.env.GHL_API_KEY;
  const pipelineId = process.env.GHL_PIPELINE_ID;
  const stageId = process.env.GHL_STAGE_ID;

  if (!apiKey) {
    console.warn('GoHighLevel integration skipped: missing GHL_API_KEY');
    return { success: false, skipped: true, error: 'Missing GHL_API_KEY' };
  }

  const { firstName, lastName } = splitName(name || 'Lead');
  const contactPayload: Record<string, unknown> = {
    firstName,
    lastName,
    name,
    phone,
    email: email || undefined,
    source: source || page || 'website',
    tags: [page || 'website', source || 'lead'].filter(Boolean),
  };

  let contactId: string | null = null;

  try {
    const contactResp = await fetch(`${API_BASE}/contacts/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactPayload),
      cache: 'no-store',
    });

    const contactText = await contactResp.text();
    if (!contactResp.ok) {
      console.error('GoHighLevel contact error', contactResp.status, contactText);
      return { success: false, skipped: false, error: `Contact create failed (${contactResp.status})` };
    }

    try {
      const contactJson = contactText ? JSON.parse(contactText) : null;
      if (contactJson?.contact?.id) {
        contactId = contactJson.contact.id as string;
      } else if (contactJson?.id) {
        contactId = contactJson.id as string;
      }
    } catch (err) {
      console.warn('Unable to parse GoHighLevel contact response', err);
    }
  } catch (err) {
    console.error('GoHighLevel contact request failed', err);
    return { success: false, skipped: false, error: 'Contact request failed' };
  }

  let opportunityId: string | null = null;
  if (contactId && pipelineId && stageId) {
    const opportunityPayload = {
      name,
      contactId,
      pipelineId,
      stageId,
      status: 'open',
      source: source || page || 'website',
    };
    try {
      const oppResp = await fetch(`${API_BASE}/opportunities/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(opportunityPayload),
        cache: 'no-store',
      });
      const oppText = await oppResp.text();
      if (!oppResp.ok) {
        console.error('GoHighLevel opportunity error', oppResp.status, oppText);
      } else {
        try {
          const oppJson = oppText ? JSON.parse(oppText) : null;
          if (oppJson?.id) opportunityId = oppJson.id as string;
          if (oppJson?.opportunity?.id) opportunityId = oppJson.opportunity.id as string;
        } catch (err) {
          console.warn('Unable to parse GoHighLevel opportunity response', err);
        }
      }
    } catch (err) {
      console.error('GoHighLevel opportunity request failed', err);
    }
  } else if (!pipelineId || !stageId) {
    console.warn('Skipping GoHighLevel opportunity: missing GHL_PIPELINE_ID or GHL_STAGE_ID');
  }

  return { success: true, skipped: false, contactId: contactId || undefined, opportunityId };
}
