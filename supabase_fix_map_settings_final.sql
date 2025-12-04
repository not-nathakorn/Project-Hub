-- 1. Fix Table Structure & Types
CREATE TABLE IF NOT EXISTS public.map_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  is_visible BOOLEAN DEFAULT true,
  enabled_universities JSONB DEFAULT '["north", "northeast", "central", "south"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure enabled_universities is JSONB (Fix for previous type error)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'map_settings' 
    AND column_name = 'enabled_universities' 
    AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE public.map_settings 
    ALTER COLUMN enabled_universities TYPE JSONB USING to_jsonb(enabled_universities);
  END IF;
END $$;

-- 2. Fix RLS Policies (The main culprit for "Update result: Array(0)")
ALTER TABLE public.map_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.map_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.map_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.map_settings;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.map_settings;

-- Create permissive policies for development/admin usage
CREATE POLICY "Enable read access for all users" 
ON public.map_settings FOR SELECT 
USING (true);

CREATE POLICY "Enable all access for authenticated users" 
ON public.map_settings FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for anon" 
ON public.map_settings FOR UPDATE 
USING (true);

CREATE POLICY "Enable insert for anon" 
ON public.map_settings FOR INSERT 
WITH CHECK (true);

-- Grant permissions to roles
GRANT ALL ON public.map_settings TO authenticated;
GRANT ALL ON public.map_settings TO anon;
GRANT ALL ON public.map_settings TO service_role;

-- 3. Insert Default Row if not exists
INSERT INTO public.map_settings (is_visible, enabled_universities)
SELECT true, '["north", "northeast", "central", "south"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.map_settings);

-- 4. Create Helper Function (Optional but recommended)
CREATE OR REPLACE FUNCTION public.update_map_settings_secure(
  p_is_visible BOOLEAN,
  p_enabled_universities JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update the single row (we assume there's only one settings row)
  UPDATE public.map_settings
  SET 
    is_visible = p_is_visible,
    enabled_universities = p_enabled_universities,
    updated_at = NOW()
  WHERE id = (SELECT id FROM public.map_settings LIMIT 1)
  RETURNING to_jsonb(map_settings.*) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_map_settings_secure TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_map_settings_secure TO anon;
