# ClickUp Lead Handoff

Leads submitted through `/api/leads` are now mirrored to the ClickUp Sales pipeline immediately after the Supabase insert succeeds. The request to ClickUp is best-effort (it logs issues but never blocks the visitor), so make sure the integration is configured correctly to avoid silent skips.

## Required environment variables

Add these to `.env.local`, Vercel env vars, or wherever the API route runs:

| Variable | Purpose |
| --- | --- |
| `CLICKUP_API_TOKEN` | Personal token generated in ClickUp (`Settings → Apps → API Tokens`). |
| `CLICKUP_LEAD_LIST_ID` | ID of the Sales pipeline List that should receive new leads. (`CLICKUP_LIST_ID` is also accepted for backwards compatibility.) |

## Optional tuning

Set any of the following (all optional) if you want to fine-tune how the ClickUp task is created:

| Variable | Notes |
| --- | --- |
| `CLICKUP_LEAD_STATUS` | Sets the status column when creating the task (e.g. `lead` for the Pipeline board). Leave unset to use the List default. |
| `CLICKUP_LEAD_PRIORITY` | ClickUp priority 1–4. If omitted the default priority is used. |
| `CLICKUP_LEAD_ASSIGNEE_IDS` | Comma separated ClickUp user IDs to auto-assign. |
| `CLICKUP_LEAD_PHONE_FIELD_ID` | Custom field ID for storing the phone number (text field). |
| `CLICKUP_LEAD_EMAIL_FIELD_ID` | Custom field ID for storing the email address. |
| `CLICKUP_LEAD_SOURCE_FIELD_ID` | Custom field ID for tagging the originating page. |

Custom field IDs are available inside ClickUp under `List → ... → More → Custom Fields → ... → API ID`.

## Testing

1. Configure the required env vars and redeploy/restart the Next.js server.
2. Submit any lead form (or `curl` POST `/api/leads`) and monitor the server logs:
   - `ClickUp task created: <taskId>` confirms success.
   - `ClickUp integration skipped: Missing ClickUp configuration` means a required env var is absent.
   - Any other logged error should be copied when troubleshooting.
