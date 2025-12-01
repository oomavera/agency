const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

export interface ClickUpLeadPayload {
  name: string;
  phone: string;
  email?: string | null;
  page?: string;
  source?: string;
}

export interface ClickUpLeadResult {
  success: boolean;
  skipped: boolean;
  taskId?: string | null;
  error?: string;
}

const sanitizePhone = (value: string) => value.replace(/\D/g, '');

const parseAssigneeIds = (value?: string | null) => {
  if (!value) return [];
  return value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
    .map(Number)
    .filter(id => Number.isInteger(id));
};

const buildDescription = (lead: ClickUpLeadPayload) => {
  const segments = [
    lead.source ? `Source: ${lead.source}` : null,
    lead.page ? `Page: ${lead.page}` : null,
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : null,
  ].filter(Boolean);

  return segments.join('\n');
};

export async function addLeadToClickUp(lead: ClickUpLeadPayload): Promise<ClickUpLeadResult> {
  const apiToken = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LEAD_LIST_ID || process.env.CLICKUP_LIST_ID;

  if (!apiToken || !listId) {
    console.warn('ClickUp integration skipped: missing CLICKUP_API_TOKEN or CLICKUP_LEAD_LIST_ID');
    return { success: false, skipped: true, error: 'Missing ClickUp configuration' };
  }

  const tags = new Set<string>(['lead']);
  if (lead.page) tags.add(lead.page);
  if (lead.source) tags.add(lead.source.toLowerCase().replace(/\s+/g, '-'));

  const payload: Record<string, unknown> = {
    name: lead.page ? `${lead.name} (${lead.page})` : lead.name,
    description: buildDescription(lead),
    tags: Array.from(tags),
    notify_all: false,
  };

  const status = process.env.CLICKUP_LEAD_STATUS;
  if (status) payload.status = status;

  const priorityEnv = process.env.CLICKUP_LEAD_PRIORITY;
  if (priorityEnv) {
    const priority = Number(priorityEnv);
    if (Number.isInteger(priority) && priority >= 1 && priority <= 4) {
      payload.priority = priority;
    }
  }

  const assigneeIds = parseAssigneeIds(
    process.env.CLICKUP_LEAD_ASSIGNEE_IDS || process.env.CLICKUP_LEAD_ASSIGNEE_ID
  );
  if (assigneeIds.length) {
    payload.assignees = assigneeIds;
  }

  const customFields: Array<{ id: string; value: string }> = [];
  const phoneFieldId = process.env.CLICKUP_LEAD_PHONE_FIELD_ID;
  if (phoneFieldId) {
    const cleanPhone = sanitizePhone(lead.phone);
    customFields.push({ id: phoneFieldId, value: cleanPhone || lead.phone });
  }

  const emailFieldId = process.env.CLICKUP_LEAD_EMAIL_FIELD_ID;
  if (emailFieldId && lead.email) {
    customFields.push({ id: emailFieldId, value: lead.email });
  }

  const sourceFieldId = process.env.CLICKUP_LEAD_SOURCE_FIELD_ID;
  if (sourceFieldId && lead.page) {
    customFields.push({ id: sourceFieldId, value: lead.page });
  }

  if (customFields.length) {
    payload.custom_fields = customFields;
  }

  const response = await fetch(`${CLICKUP_API_BASE}/list/${listId}/task`, {
    method: 'POST',
    headers: {
      Authorization: apiToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('ClickUp API error', response.status, responseText);
    return {
      success: false,
      skipped: false,
      error: `ClickUp API request failed with ${response.status}`,
    };
  }

  let taskId: string | null = null;
  try {
    const json = responseText ? JSON.parse(responseText) : null;
    if (json && typeof json.id === 'string') {
      taskId = json.id;
    }
  } catch (err) {
    console.warn('Unable to parse ClickUp response JSON', err);
  }

  return { success: true, skipped: false, taskId };
}
