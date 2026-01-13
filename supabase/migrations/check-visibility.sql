-- ========================================
-- ตรวจสอบสถานะ is_visible ของปริญญาโท
-- ========================================

-- ดูข้อมูลปัจจุบัน
SELECT 
  id,
  year,
  title_th,
  title_en,
  is_visible,
  order_index,
  updated_at
FROM education
ORDER BY order_index;

-- ========================================
-- ถ้าปริญญาโทยัง is_visible = false
-- ให้รันคำสั่งนี้เพื่อเปลี่ยนเป็น true
-- ========================================

UPDATE education
SET is_visible = true
WHERE title_en = 'Master of Education'
RETURNING id, title_th, is_visible;

-- ========================================
-- ตรวจสอบอีกครั้งหลัง update
-- ========================================

SELECT 
  id,
  title_th,
  is_visible
FROM education
ORDER BY order_index;
