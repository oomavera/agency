# OpenPhone Contact Sync

Every successful submission to `/api/leads` now attempts to create (or rather, append) a contact inside OpenPhone so the sales team can call or text the lead from the Pipeline view without retyping the number. The API call is best-effort, so lead capture never fails if OpenPhone is unavailable.

## Required configuration

| Env var | Purpose |
| --- | --- |
| `OPENPHONE_API_KEY` | Your OpenPhone personal API token (already used for SMS). |

## Optional tweaks

| Env var | Notes |
| --- | --- |
| `OPENPHONE_PHONE_LABEL` | Overrides the label stored next to the phone number (default `mobile`). |
| `OPENPHONE_EMAIL_LABEL` | Overrides the label stored next to the email address (default `work`). |

## How it works

1. After Supabase saves the lead and ClickUp sync completes, the API route calls `createOpenPhoneContact` (`src/lib/openphone.ts`).
2. The helper:
   - Splits the lead name into first/last names (falls back to the full name if needed).
   - Normalizes the phone into E.164 (`+1407…`) so OpenPhone accepts it.
   - Attaches the visitor’s email when available.
   - Sets `externalId` to the Supabase lead ID for easier cross-referencing later.
3. Failures are logged to the server console but never bubble up to the user.

## Testing

1. Ensure `OPENPHONE_API_KEY` is set locally (`.env.local`) and inside Vercel.
2. Restart `next dev` (or redeploy) so the environment variable is loaded.
3. Submit a lead on any page. In the server/log output you should see either:
   - `OpenPhone contact created: <contactId>` ✅
   - or `OpenPhone contact skipped: Missing OpenPhone API key` if misconfigured.
4. In OpenPhone → Contacts, the new entry will appear with the lead’s name/number/email. You can delete the test contact afterward if needed.
