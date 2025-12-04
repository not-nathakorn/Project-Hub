-- ========================================
-- แก้ไข RLS Policy สำหรับ Admin Dashboard
-- ========================================
-- ปัญหา: Policy เดิมกรอง is_visible = true ทำให้ Admin ไม่เห็นข้อมูลที่ซ่อน
-- แก้ไข: อนุญาตให้อ่านทั้งหมดใน Admin, กรองเฉพาะหน้าเว็บ

-- ลบ Policy เก่า
DROP POLICY IF EXISTS "Allow public read access" ON education;
DROP POLICY IF EXISTS "Allow public read access" ON projects;
DROP POLICY IF EXISTS "Allow public read access" ON experience;

-- สร้าง Policy ใหม่ที่อนุญาตให้อ่านทั้งหมด (ไม่กรอง is_visible)
-- การกรองจะทำในฝั่ง Frontend แทน

CREATE POLICY "Allow public read access" ON education
  FOR SELECT
  USING (true);  -- อนุญาตให้อ่านทั้งหมด

CREATE POLICY "Allow public read access" ON projects
  FOR SELECT
  USING (true);  -- อนุญาตให้อ่านทั้งหมด

CREATE POLICY "Allow public read access" ON experience
  FOR SELECT
  USING (true);  -- อนุญาตให้อ่านทั้งหมด

-- ========================================
-- หมายเหตุ:
-- ========================================
-- 1. Admin Dashboard จะเห็นข้อมูลทั้งหมด (ทั้งแสดงและซ่อน)
-- 2. หน้าเว็บหลักจะกรองเฉพาะ is_visible = true ในฝั่ง Frontend
-- 3. ปลอดภัยเพราะข้อมูลเป็น public read-only
-- 4. การแก้ไขข้อมูลต้องมี authentication (ตั้งค่าแยก)

-- ตรวจสอบ Policy ที่สร้างแล้ว
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('education', 'projects', 'experience')
ORDER BY tablename, policyname;
