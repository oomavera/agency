-- Estimate Calculator Database Migration
-- Run this script in your Supabase SQL Editor to add estimate calculator support

-- 1. Add new columns to leads table if they don't exist
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS quote_payload JSONB,
ADD COLUMN IF NOT EXISTS service TEXT DEFAULT 'standard';

-- 2. Update the service column to have better default and constraint
ALTER TABLE public.leads 
ALTER COLUMN service SET DEFAULT 'contact_form';

-- Add check constraint for service types
ALTER TABLE public.leads
DROP CONSTRAINT IF EXISTS leads_service_check;

ALTER TABLE public.leads
ADD CONSTRAINT leads_service_check 
CHECK (service IN ('standard', 'deep', 'contact_form', 'estimate_request'));

-- 3. Create index on service column for better performance
CREATE INDEX IF NOT EXISTS leads_service_idx ON public.leads(service);

-- 4. Create index on quote_payload for JSON queries
CREATE INDEX IF NOT EXISTS leads_quote_payload_idx ON public.leads USING gin(quote_payload);

-- 5. Update existing records to have proper service type
UPDATE public.leads 
SET service = 'contact_form' 
WHERE service IS NULL OR service = 'standard';

-- 6. Add comment to document the schema
COMMENT ON COLUMN public.leads.quote_payload IS 'JSON payload containing quote details from estimate calculator';
COMMENT ON COLUMN public.leads.service IS 'Type of service request: contact_form, estimate_request, standard, deep';

-- 7. Create a view for estimate requests specifically
CREATE OR REPLACE VIEW public.estimate_requests AS
SELECT 
  id,
  name,
  email,
  phone,
  address,
  quote_payload,
  created_at
FROM public.leads 
WHERE service = 'estimate_request'
ORDER BY created_at DESC;

-- 8. Grant permissions on the new view
GRANT SELECT ON public.estimate_requests TO anon;
GRANT SELECT ON public.estimate_requests TO authenticated;

-- Migration completed successfully! 