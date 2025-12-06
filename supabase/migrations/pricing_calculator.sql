-- Pricing Calculator multi-tenant schema
-- - Stores per-user profiles and uploaded pricing spreadsheets
-- - Buckets files in storage/pricing-calculator/<user_id>/<file>
-- - RLS ensures users only see their own rows/files

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Datasets uploaded by authenticated users
CREATE TABLE IF NOT EXISTS public.pricing_calculator_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  row_count INTEGER,
  model JSONB, -- trained model metadata saved client-side
  sample_preview JSONB, -- small preview of parsed rows for quick UI display
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS pricing_calculator_datasets_user_id_idx
  ON public.pricing_calculator_datasets(user_id, created_at DESC);

-- Profile for each pricing calculator user
CREATE TABLE IF NOT EXISTS public.pricing_calculator_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  active_dataset_id UUID REFERENCES public.pricing_calculator_datasets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS pricing_calculator_profiles_active_dataset_idx
  ON public.pricing_calculator_profiles(active_dataset_id);

-- Row Level Security
ALTER TABLE public.pricing_calculator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_calculator_datasets ENABLE ROW LEVEL SECURITY;

-- Profiles: only the owner can read/insert/update their row
CREATE POLICY pricing_profiles_select ON public.pricing_calculator_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY pricing_profiles_insert ON public.pricing_calculator_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY pricing_profiles_update ON public.pricing_calculator_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Datasets: restricted to owning user
CREATE POLICY pricing_datasets_select ON public.pricing_calculator_datasets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY pricing_datasets_insert ON public.pricing_calculator_datasets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY pricing_datasets_update ON public.pricing_calculator_datasets
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY pricing_datasets_delete ON public.pricing_calculator_datasets
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Storage bucket for uploaded spreadsheets
INSERT INTO storage.buckets (id, name, public)
VALUES ('pricing-calculator', 'pricing-calculator', false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage objects inside their own folder: <user_id>/filename.csv
CREATE POLICY pricing_storage_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'pricing-calculator'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY pricing_storage_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pricing-calculator'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY pricing_storage_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'pricing-calculator'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

CREATE POLICY pricing_storage_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'pricing-calculator'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
