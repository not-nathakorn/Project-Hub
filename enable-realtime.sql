-- ========================================
-- เปิด Realtime สำหรับ Tables
-- ========================================
-- ทำให้หน้าเว็บอัพเดทอัตโนมัติเมื่อข้อมูลเปลี่ยน

-- เปิด Realtime สำหรับ projects
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- เปิด Realtime สำหรับ education
ALTER PUBLICATION supabase_realtime ADD TABLE education;

-- เปิด Realtime สำหรับ experience
ALTER PUBLICATION supabase_realtime ADD TABLE experience;

-- ========================================
-- ตรวจสอบว่าเปิดแล้ว
-- ========================================
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- ========================================
-- ผลลัพธ์ที่คาดหวัง:
-- ========================================
-- schemaname | tablename
-- -----------|------------
-- public     | projects
-- public     | education
-- public     | experience
