-- ========================================
-- Safe SQL Script - ป้องกัน Error เมื่อรันซ้ำ
-- ========================================
-- ใช้สำหรับเพิ่มข้อมูลปริญญาโทเท่านั้น
-- ไม่สร้าง triggers หรือ tables ซ้ำ

-- เช็คว่ามีข้อมูลปริญญาโทอยู่แล้วหรือไม่
DO $$
BEGIN
  -- ลบข้อมูลปริญญาโทเก่าถ้ามี (ป้องกันข้อมูลซ้ำ)
  DELETE FROM education WHERE title_en = 'Master of Education';
  
  -- เพิ่มข้อมูลปริญญาโทใหม่
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
  );
  
  RAISE NOTICE 'เพิ่มข้อมูลปริญญาโทสำเร็จ!';
END $$;

-- ========================================
-- ผลลัพธ์ที่คาดหวัง:
-- ========================================
-- NOTICE: เพิ่มข้อมูลปริญญาโทสำเร็จ!
-- Query returned successfully in XXX msec.
