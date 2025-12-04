-- Create map_universities table
CREATE TABLE IF NOT EXISTS public.map_universities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region VARCHAR(50) NOT NULL, -- 'north', 'northeast', 'central', 'south'
  name_th VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  region_th VARCHAR(100) NOT NULL,
  year VARCHAR(100) NOT NULL,
  degree_level VARCHAR(100) NOT NULL, -- 'Ph.D.', 'M.Ed.', 'B.A.', 'B.Sc.', etc.
  faculty VARCHAR(255),
  major VARCHAR(255),
  logo_url TEXT,
  color VARCHAR(7) DEFAULT '#A29BFE',
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(region)
);

-- Enable RLS
ALTER TABLE public.map_universities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.map_universities;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.map_universities;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON public.map_universities;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON public.map_universities;

-- Create policies
CREATE POLICY "Allow public read access" ON public.map_universities
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert" ON public.map_universities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON public.map_universities
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete" ON public.map_universities
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert initial data
INSERT INTO public.map_universities (region, name_th, name_en, region_th, year, degree_level, faculty, major, logo_url, color, order_index, is_visible)
VALUES 
  (
    'north',
    'มหาวิทยาลัยเชียงใหม่',
    'Chiang Mai University',
    'ภาคเหนือ',
    'เตรียมเข้าศึกษา',
    'ปริญญาเอก (Ph.D.)',
    NULL,
    NULL,
    '/University_Logo/CMU_LOGO.svg.png',
    '#A29BFE',
    1,
    true
  ),
  (
    'northeast',
    'มหาวิทยาลัยขอนแก่น',
    'Khon Kaen University',
    'ภาคอีสาน',
    '2025 - ปัจจุบัน',
    'ปริญญาโท (M.Ed.)',
    'คณะศึกษาศาสตร์',
    'นวัตกรรม เทคโนโลยีและสื่อสารการศึกษา',
    '/University_Logo/KKU_LOGO.png',
    '#FAB1A0',
    2,
    true
  ),
  (
    'central',
    'มหาวิทยาลัยรามคำแหง',
    'Ramkhamhaeng University',
    'ภาคกลาง',
    '2025 - ปัจจุบัน',
    'ปริญญาตรีใบที่สอง (B.A.)',
    'คณะมนุษยศาสตร์',
    'ภาษาอังกฤษ',
    '/University_Logo/RU_LOGO.svg.png',
    '#B2BEC3',
    3,
    true
  ),
  (
    'south',
    'มหาวิทยาลัยสงขลานครินทร์',
    'Prince of Songkla University',
    'ภาคใต้',
    '2021 - 2024',
    'ปริญญาตรี (B.Sc.)',
    'คณะวิทยาศาสตร์',
    'เทคโนโลยีสารสนเทศและการสื่อสาร',
    '/University_Logo/PSU_LOGO.png',
    '#74B9FF',
    4,
    true
  )
ON CONFLICT (region) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  name_en = EXCLUDED.name_en,
  region_th = EXCLUDED.region_th,
  year = EXCLUDED.year,
  degree_level = EXCLUDED.degree_level,
  faculty = EXCLUDED.faculty,
  major = EXCLUDED.major,
  logo_url = EXCLUDED.logo_url,
  color = EXCLUDED.color,
  order_index = EXCLUDED.order_index,
  is_visible = EXCLUDED.is_visible;

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_updated_at ON public.map_universities;

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.map_universities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_map_universities_region ON public.map_universities(region);
CREATE INDEX IF NOT EXISTS idx_map_universities_visible ON public.map_universities(is_visible);
CREATE INDEX IF NOT EXISTS idx_map_universities_order ON public.map_universities(order_index);
