-- ========================================
-- 📊 ANALYTICS SYSTEM SETUP
-- ========================================

-- 1. สร้างตารางเก็บข้อมูลการเข้าชม
CREATE TABLE IF NOT EXISTS website_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  language TEXT,
  country TEXT -- จะเก็บถ้าหาได้
);

-- 2. เปิด RLS Policies
ALTER TABLE website_visits ENABLE ROW LEVEL SECURITY;

-- อนุญาตให้ทุกคน (Public) บันทึกข้อมูลได้ (INSERT)
CREATE POLICY "Allow public insert access" ON website_visits
  FOR INSERT WITH CHECK (true);

-- อนุญาตให้ทุกคนอ่านข้อมูลได้ (SELECT) - สำหรับแสดงใน Dashboard
CREATE POLICY "Allow public read access" ON website_visits
  FOR SELECT USING (true);

-- 3. เปิด Realtime (เผื่ออยากดูคนเข้าเว็บแบบสดๆ)
ALTER PUBLICATION supabase_realtime ADD TABLE website_visits;
