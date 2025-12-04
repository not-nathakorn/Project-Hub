-- ========================================
-- 🚀 FIX UPDATE PERMISSIONS (CRITICAL)
-- ========================================
-- ปัญหา: Admin แก้ไขข้อมูลไม่ได้ เพราะไม่มี Policy อนุญาตให้ UPDATE
-- แก้ไข: เพิ่ม Policy ให้ UPDATE ได้

-- 1. Education
DROP POLICY IF EXISTS "Allow public update access" ON education;
CREATE POLICY "Allow public update access" ON education
  FOR UPDATE
  USING (true)  -- อนุญาตให้แก้ไขแถวไหนก็ได้
  WITH CHECK (true); -- อนุญาตให้ใส่ข้อมูลอะไรก็ได้

-- 2. Projects
DROP POLICY IF EXISTS "Allow public update access" ON projects;
CREATE POLICY "Allow public update access" ON projects
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 3. Experience
DROP POLICY IF EXISTS "Allow public update access" ON experience;
CREATE POLICY "Allow public update access" ON experience
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 4. INSERT Permissions (เผื่อเพิ่มข้อมูลใหม่)
DROP POLICY IF EXISTS "Allow public insert access" ON education;
CREATE POLICY "Allow public insert access" ON education FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert access" ON projects;
CREATE POLICY "Allow public insert access" ON projects FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert access" ON experience;
CREATE POLICY "Allow public insert access" ON experience FOR INSERT WITH CHECK (true);

-- 5. DELETE Permissions (เผื่อลบข้อมูล)
DROP POLICY IF EXISTS "Allow public delete access" ON education;
CREATE POLICY "Allow public delete access" ON education FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON projects;
CREATE POLICY "Allow public delete access" ON projects FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON experience;
CREATE POLICY "Allow public delete access" ON experience FOR DELETE USING (true);

-- ========================================
-- หมายเหตุความปลอดภัย:
-- ========================================
-- ตอนนี้เราเปิด Public Access เต็มรูปแบบเพื่อให้ระบบทำงานได้ก่อน
-- ในอนาคตเมื่อทำระบบ Login เสร็จ ควรเปลี่ยนเป็น:
-- USING (auth.role() = 'authenticated')
