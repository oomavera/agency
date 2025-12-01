const OPENPHONE_API_BASE = 'https://api.openphone.com/v1';

export interface OpenPhoneContactPayload {
  name: string;
  phone: string;
  email?: string | null;
  page?: string;
  source?: string;
  externalId?: string | null;
}

export interface OpenPhoneContactResult {
  success: boolean;
  skipped: boolean;
  contactId?: string | null;
  error?: string;
}

const splitName = (fullName: string) => {
  const cleaned = fullName.trim();
  if (!cleaned) {
    return { firstName: 'Lead', lastName: undefined as string | undefined };
  }
  const parts = cleaned.split(/\s+/);
  const firstName = parts.shift() || 'Lead';
  const lastName = parts.length ? parts.join(' ') : undefined;
  return { firstName, lastName };
};

const formatPhoneToE164 = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (value.trim().startsWith('+')) return `+${digits}`;
  return `+${digits}`;
};

export async function createOpenPhoneContact(lead: OpenPhoneContactPayload): Promise<OpenPhoneContactResult> {
  const apiKey = process.env.OPENPHONE_API_KEY;
  if (!apiKey) {
    console.warn('OpenPhone integration skipped: missing OPENPHONE_API_KEY');
    return { success: false, skipped: true, error: 'Missing OpenPhone API key' };
  }

  const phoneNumber = formatPhoneToE164(lead.phone);
  if (!phoneNumber) {
    console.warn('OpenPhone integration skipped: phone number missing or invalid');
    return { success: false, skipped: true, error: 'Invalid phone' };
  }

  const { firstName, lastName } = splitName(lead.name);
  const phoneLabel = process.env.OPENPHONE_PHONE_LABEL || 'mobile';
  const emailLabel = process.env.OPENPHONE_EMAIL_LABEL || 'work';

  const defaultFields: Record<string, unknown> = {
    firstName,
  };

  if (lastName) defaultFields.lastName = lastName;
  defaultFields.phoneNumbers = [{ name: phoneLabel, value: phoneNumber }];

  if (lead.email) {
    defaultFields.emails = [{ name: emailLabel, value: lead.email }];
  }

  const payload: Record<string, unknown> = { defaultFields };
  if (lead.externalId) payload.externalId = lead.externalId;

  const response = await fetch(`${OPENPHONE_API_BASE}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('OpenPhone API error', response.status, responseText);
    return {
      success: false,
      skipped: false,
      error: `OpenPhone request failed with ${response.status}`,
    };
  }

  try {
    const json = responseText ? JSON.parse(responseText) : null;
    return {
      success: true,
      skipped: false,
      contactId: json?.data?.id ?? null,
    };
  } catch (err) {
    console.warn('Unable to parse OpenPhone response JSON', err);
    return { success: true, skipped: false, contactId: null };
  }
}
