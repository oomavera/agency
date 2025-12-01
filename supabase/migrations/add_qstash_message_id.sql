-- Add qstash_message_id column to leads table to track scheduled SMS messages
-- This allows cancellation of SMS if lead is called before message is sent

ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS qstash_message_id TEXT;

-- Add index for faster lookups when canceling messages
CREATE INDEX IF NOT EXISTS idx_leads_qstash_message_id
ON public.leads(qstash_message_id)
WHERE qstash_message_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.leads.qstash_message_id IS 'QStash message ID for scheduled SMS - used to cancel message if lead is called first';
