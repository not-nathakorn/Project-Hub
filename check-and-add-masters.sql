-- ========================================
-- ตรวจสอบและเพิ่มข้อมูลปริญญาโท
-- ========================================

-- ขั้นตอนที่ 1: ตรวจสอบข้อมูลที่มีอยู่
SELECT 
  id,
  year,
  title_th,
  title_en,
  is_visible,
  order_index,
  created_at
FROM education
ORDER BY order_index;

-- ========================================
-- ถ้าไม่เห็นปริญญาโท ให้รันคำสั่งด้านล่าง
-- ========================================

-- ขั้นตอนที่ 2: เพิ่มข้อมูลปริญญาโท
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
) VALUES (
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
)
RETURNING id, title_th, is_visible, order_index;

-- ========================================
-- ขั้นตอนที่ 3: ตรวจสอบอีกครั้งหลังเพิ่ม
-- ========================================
SELECT 
  id,
  year,
  title_th,
  title_en,
  badge,
  is_visible,
  order_index
FROM education
ORDER BY order_index;
