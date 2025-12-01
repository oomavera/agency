-- Agency Database Setup
-- Run this script in your Supabase SQL Editor

-- 1. Create the leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    service TEXT NOT NULL CHECK (service IN ('standard', 'deep')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 3. Create policy to allow anonymous users to insert leads
-- This allows the contact form to work without user authentication
CREATE POLICY "Allow anonymous inserts" ON public.leads
    FOR INSERT 
    WITH CHECK (true);

-- 4. Create policy to allow reading leads (for admin purposes)
-- You can restrict this later by adding authentication
CREATE POLICY "Allow read access" ON public.leads
    FOR SELECT 
    USING (true);

-- 5. Grant necessary permissions to the anon role
GRANT INSERT ON public.leads TO anon;
GRANT SELECT ON public.leads TO anon;

-- 6. Grant all permissions to authenticated users (for future admin features)
GRANT ALL ON public.leads TO authenticated;

-- 7. Create an index on created_at for better performance
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads(created_at DESC);

-- 8. Create an index on email for uniqueness checks (optional)
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads(email);

-- Success message
-- You can now test your contact form! 