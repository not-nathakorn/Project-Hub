-- Create map_settings table
CREATE TABLE IF NOT EXISTS public.map_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  is_visible BOOLEAN DEFAULT true,
  enabled_universities JSONB DEFAULT '["north", "northeast", "central", "south"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.map_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON public.map_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to update" ON public.map_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert" ON public.map_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert default settings (only if table is empty)
INSERT INTO public.map_settings (is_visible, enabled_universities)
SELECT true, '["north", "northeast", "central", "south"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.map_settings);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.map_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
