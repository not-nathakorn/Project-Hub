-- ========================================
-- 🚀 FINAL SYSTEM SETUP (Safe & Complete)
-- ========================================
-- สคริปต์นี้จะ:
-- 1. แก้ไข RLS Policy (ให้ Admin เห็นทั้งหมด)
-- 2. เปิด Realtime (แบบปลอดภัย ไม่ Error)
-- 3. เพิ่มข้อมูล Projects และ Experience ลง DB (ถ้ายังไม่มี)

-- ========================================
-- 1. RLS Policies (Idempotent)
-- ========================================
DO $$
BEGIN
    -- Education
    DROP POLICY IF EXISTS "Allow public read access" ON education;
    CREATE POLICY "Allow public read access" ON education FOR SELECT USING (true);
    
    -- Projects
    DROP POLICY IF EXISTS "Allow public read access" ON projects;
    CREATE POLICY "Allow public read access" ON projects FOR SELECT USING (true);
    
    -- Experience
    DROP POLICY IF EXISTS "Allow public read access" ON experience;
    CREATE POLICY "Allow public read access" ON experience FOR SELECT USING (true);
END $$;

-- ========================================
-- 2. Realtime Setup (Safe Mode)
-- ========================================
DO $$
BEGIN
    -- Education
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'education') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE education;
    END IF;

    -- Projects
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'projects') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE projects;
    END IF;

    -- Experience
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'experience') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE experience;
    END IF;
END $$;

-- ========================================
-- 3. Seed Data: Projects (ลงข้อมูลโครงการ)
-- ========================================
INSERT INTO projects (title, description_th, description_en, url, icon, tags, order_index, is_visible)
SELECT 'Payment Form System', 'ระบบแบบฟอร์มการชำระเงิน - จัดการและติดตามการชำระเงินออนไลน์', 'Payment form system - Manage and track online payments', 'https://psf.codex-th.com/', '💳', ARRAY['Payment', 'Forms', 'Analytics'], 1, true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Payment Form System');

INSERT INTO projects (title, description_th, description_en, url, icon, tags, order_index, is_visible)
SELECT 'Teaching Observation Log', 'ระบบบันทึกการสังเกตการสอน - ติดตามและประเมินการสอนแบบเรียลไทม์', 'Teaching observation log system - Track and assess teaching in real-time', 'https://tol.codex-th.com/', '📚', ARRAY['Education', 'Tracking', 'Assessment'], 2, true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Teaching Observation Log');

INSERT INTO projects (title, description_th, description_en, url, icon, tags, order_index, is_visible)
SELECT 'Product Price Comparison', 'ระบบเปรียบเทียบราคาสินค้า - เปรียบเทียบราคาจากหลายแหล่ง', 'Product price comparison system - Compare prices from multiple sources', 'https://cpn.codex-th.com/', '💰', ARRAY['E-commerce', 'Comparison', 'Analytics'], 3, true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Product Price Comparison');

INSERT INTO projects (title, description_th, description_en, url, icon, tags, order_index, is_visible)
SELECT 'Tutorial Management System', 'ระบบจัดการบทเรียน - สร้างและจัดการเนื้อหาการสอน', 'Tutorial management system - Create and manage teaching content', 'https://tms.codex-th.com/', '🎓', ARRAY['LMS', 'Content', 'Education'], 4, true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Tutorial Management System');

INSERT INTO projects (title, description_th, description_en, url, icon, tags, order_index, is_visible)
SELECT 'User Management & Identity', 'ระบบจัดการผู้ใช้และยืนยันตัวตน - ยืนยันและจัดการข้อมูลผู้ใช้', 'User management & identity verification system', 'https://bbh.codex-th.com/', '🔐', ARRAY['Auth', 'Security', 'Identity'], 5, true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'User Management & Identity');

INSERT INTO projects (title, description_th, description_en, url, icon, tags, order_index, is_visible)
SELECT 'Satun-SOS Flood Assistance', 'ระบบช่วยเหลือผู้ประสบภัยน้ำท่วมสตูล - ประสานงานและติดตามสถานการณ์', 'Satun flood relief system - Coordinate and track emergency situations', 'https://satun-sos.codex-th.com/', '🆘', ARRAY['Emergency', 'Relief', 'Coordination'], 6, true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Satun-SOS Flood Assistance');

-- ========================================
-- 4. Seed Data: Experience (ลงข้อมูลประสบการณ์)
-- ========================================
INSERT INTO experience (year, title_th, title_en, subtitle_th, subtitle_en, description_th, description_en, badge, order_index, is_visible)
SELECT '2025', 'นักศึกษาแลกเปลี่ยนวัฒนธรรม', 'Cultural Exchange Student', 'Guangdong University of Technology, ประเทศจีน', 'Guangdong University of Technology, China', 'แลกเปลี่ยนวัฒนธรรมและเทคโนโลยีในประเทศจีน', 'Cultural and technology exchange program in China', 'International', 1, true
WHERE NOT EXISTS (SELECT 1 FROM experience WHERE title_en = 'Cultural Exchange Student');

INSERT INTO experience (year, title_th, title_en, subtitle_th, subtitle_en, description_th, description_en, badge, order_index, is_visible)
SELECT '2025', 'English on Tour', 'English on Tour', 'Penang, มาเลเซีย', 'Penang, Malaysia', 'โครงการพัฒนาภาษาอังกฤษผ่านการท่องเที่ยวเชิงวัฒนธรรม', 'English language development program through cultural tourism', NULL, 2, true
WHERE NOT EXISTS (SELECT 1 FROM experience WHERE title_en = 'English on Tour');

INSERT INTO experience (year, title_th, title_en, subtitle_th, subtitle_en, description_th, description_en, badge, order_index, is_visible)
SELECT '2023–2024', 'ผู้ช่วยสอน', 'Teaching Assistant', 'คณะวิทยาศาสตร์, มหาวิทยาลัยสงขลานครินทร์', 'Faculty of Science, PSU', 'ผู้ช่วยสอน 3 ปี: C/C#, System Architecture, Network, Frontend Development', '3-year Teaching Assistant: C/C#, System Architecture, Network, Frontend Development', '3 Years', 3, true
WHERE NOT EXISTS (SELECT 1 FROM experience WHERE title_en = 'Teaching Assistant');

INSERT INTO experience (year, title_th, title_en, subtitle_th, subtitle_en, description_th, description_en, badge, order_index, is_visible)
SELECT '2023', 'PSU Backpacking ASEAN', 'PSU Backpacking ASEAN', 'มาเลเซีย และ สิงคโปร์', 'Malaysia & Singapore', 'การเดินทางศึกษาดูงานและแลกเปลี่ยนวัฒนธรรมในอาเซียน', 'Educational tour and cultural exchange program in ASEAN', NULL, 4, true
WHERE NOT EXISTS (SELECT 1 FROM experience WHERE title_en = 'PSU Backpacking ASEAN');

INSERT INTO experience (year, title_th, title_en, subtitle_th, subtitle_en, description_th, description_en, badge, order_index, is_visible)
SELECT '2022–2023', 'อุปนายกฝ่ายกิจการพิเศษ', 'Vice President for Special Affairs', 'สโมสรนักศึกษาวิทยาศาสตร์, มหาวิทยาลัยสงขลานครินทร์', 'Science Student Club, PSU', 'อุปนายกฝ่ายกิจการพิเศษ - ดูแลโครงการและกิจกรรมพิเศษ', 'Vice President for Special Affairs - Oversee special projects and activities', 'Leadership', 5, true
WHERE NOT EXISTS (SELECT 1 FROM experience WHERE title_en = 'Vice President for Special Affairs');

-- ========================================
-- 5. Final Check
-- ========================================
SELECT 'Projects Count' as type, count(*) as count FROM projects
UNION ALL
SELECT 'Education Count', count(*) FROM education
UNION ALL
SELECT 'Experience Count', count(*) FROM experience;
