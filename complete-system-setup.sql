-- ========================================
-- 🚀 Complete System Setup
-- ========================================
-- รันไฟล์นี้เพื่อให้ระบบทำงานสมบูรณ์
-- - RLS Policies ที่ถูกต้อง
-- - Realtime enabled
-- - ข้อมูลปริญญาโท

-- ========================================
-- STEP 1: แก้ไข RLS Policies
-- ========================================
-- ให้ Admin เห็นข้อมูลทั้งหมด (ทั้งแสดงและซ่อน)
-- หน้าเว็บกรองเฉพาะ is_visible = true ในฝั่ง Frontend

-- ลบ Policy เก่า
DROP POLICY IF EXISTS "Allow public read access" ON education;
DROP POLICY IF EXISTS "Allow public read access" ON projects;
DROP POLICY IF EXISTS "Allow public read access" ON experience;
DROP POLICY IF EXISTS "Allow public read access" ON personal_info;

-- สร้าง Policy ใหม่ที่อนุญาตให้อ่านทั้งหมด
CREATE POLICY "Allow public read access" ON education
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access" ON projects
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access" ON experience
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access" ON personal_info
  FOR SELECT
  USING (true);

-- ========================================
-- STEP 2: เปิด Realtime
-- ========================================
-- ให้หน้าเว็บอัพเดทอัตโนมัติเมื่อมีการเปลี่ยนแปลง

ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE education;
ALTER PUBLICATION supabase_realtime ADD TABLE experience;
ALTER PUBLICATION supabase_realtime ADD TABLE personal_info;

-- ========================================
-- STEP 3: ตรวจสอบข้อมูลปริญญาโท
-- ========================================

-- ดูข้อมูลปัจจุบัน
SELECT 
  id,
  year,
  title_th,
  title_en,
  is_visible,
  order_index
FROM education
ORDER BY order_index;

-- ถ้ายังไม่มีปริญญาโท ให้เพิ่ม
INSERT INTO education (
  year, 
  title_th, 
  title_en, 
  subtitle_th, 
  subtitle_en, 
  description_th, 
  description_en, 
  badge, 
  order_index, 
  is_visible
) 
SELECT
  '2025–Present',
  'ปริญญาโท การศึกษา',
  'Master of Education',
  'นวัตกรรม เทคโนโลยีและสื่อสารการศึกษา, มหาวิทยาลัยขอนแก่น',
  'Innovation, Technology & Learning Sciences, Khon Kaen University',
  'ทุน PSMT (สควค.) รุ่น 23 - เน้นการวิจัยและพัฒนานวัตกรรมทางการศึกษา',
  'PSMT Scholar (สควค.) Cohort 23 - Focus on educational innovation research and development',
  'In Progress',
  0,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM education WHERE title_en = 'Master of Education'
);

-- ========================================
-- STEP 4: ตรวจสอบว่าทุกอย่างพร้อม
-- ========================================

-- ตรวจสอบ RLS Policies
SELECT 
  schemaname,
  tablename,
  policyname,
  qual::text as condition
FROM pg_policies 
WHERE tablename IN ('education', 'projects', 'experience', 'personal_info')
ORDER BY tablename, policyname;

-- ตรวจสอบ Realtime
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- ตรวจสอบข้อมูล Education
SELECT 
  title_th,
  is_visible,
  order_index
FROM education
ORDER BY order_index;

-- ========================================
-- ✅ ผลลัพธ์ที่คาดหวัง:
-- ========================================
-- 
-- RLS Policies:
-- - ทุก table มี policy "Allow public read access" with condition "true"
--
-- Realtime:
-- - education, projects, experience, personal_info ถูกเพิ่มใน publication
--
-- Education Data:
-- - ปริญญาโท (order_index = 0, is_visible = false)
-- - ปริญญาตรี (order_index = 1, is_visible = true)
--
-- ========================================
-- 🎯 การทดสอบ:
-- ========================================
--
-- 1. Admin Dashboard:
--    - เห็นข้อมูลทั้งหมด (ทั้งแสดงและซ่อน)
--    - กดปุ่ม 👁️ เพื่อ toggle visibility
--    - ดู toast notification
--
-- 2. หน้าเว็บหลัก:
--    - แสดงเฉพาะ is_visible = true
--    - อัพเดทอัตโนมัติเมื่อ toggle ใน Admin
--    - ไม่ต้อง refresh เอง
--
-- 3. Console Log:
--    - Admin: "📚 Education data fetched: Array(2)"
--    - Website: "🌐 Website data loaded: 🎓 Education: 1 (หรือ 2)"
--    - Toggle: "🔄 Education updated, refreshing..."
--
-- ========================================

-- เสร็จสิ้น! 🎉
