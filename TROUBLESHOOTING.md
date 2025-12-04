# 🔧 คำแนะนำแก้ปัญหา

## ปัญหาที่พบ:

### 1. ❌ 404 Error: map_settings table not found

```
tncaevvnicaygulracft.supabase.co/rest/v1/map_settings?select=*:1
Failed to load resource: the server responded with a status of 404 ()
```

### 2. ❌ การ์ดไม่ปิดเมื่อคลิกส่วนอื่นของจอ

---

## ✅ วิธีแก้ปัญหา:

### 1. แก้ 404 Error - สร้างตาราง map_settings

**ขั้นตอน:**

1. เข้า Supabase Dashboard
2. ไปที่ **SQL Editor**
3. คัดลอกและรันคำสั่งจากไฟล์ `supabase_map_settings.sql`

**หรือรันคำสั่งนี้:**

```sql
-- Create map_settings table
CREATE TABLE IF NOT EXISTS public.map_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  is_visible BOOLEAN DEFAULT true,
  enabled_universities JSONB DEFAULT '["north", "northeast", "central", "south"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.map_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON public.map_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to update" ON public.map_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert" ON public.map_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert default settings
INSERT INTO public.map_settings (is_visible, enabled_universities)
SELECT true, '["north", "northeast", "central", "south"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.map_settings);

-- Create updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.map_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

**ตรวจสอบว่าสำเร็จ:**

```sql
SELECT * FROM map_settings;
```

ควรเห็น 1 แถวที่มี:

- is_visible = true
- enabled_universities = ["north", "northeast", "central", "south"]

---

### 2. แก้การ์ดไม่ปิดเมื่อคลิก - ตรวจสอบ Console

**ขั้นตอนการ Debug:**

1. เปิด Browser Developer Tools (F12)
2. ไปที่แท็บ **Console**
3. คลิกที่ส่วนต่างๆ ของหน้าจอ
4. ดูว่ามี error หรือไม่

**สิ่งที่ควรเกิดขึ้น:**

- คลิกที่โลโก้มหาวิทยาลัย → การ์ดเปิด
- คลิกที่การ์ด → การ์ดยังเปิดอยู่
- คลิกที่พื้นหลัง/ส่วนอื่น → การ์ดปิด

**ถ้ายังไม่ทำงาน:**

ลอง Refresh หน้าเว็บ (Ctrl+F5 หรือ Cmd+Shift+R) เพื่อ clear cache

---

## 📋 Checklist การแก้ปัญหา:

- [ ] รัน SQL สำหรับสร้างตาราง `map_settings`
- [ ] รัน SQL สำหรับสร้างตาราง `map_universities`
- [ ] ตรวจสอบว่าทั้ง 2 ตารางมีข้อมูล
- [ ] Refresh หน้าเว็บ (Ctrl+F5)
- [ ] ตรวจสอบ Console ว่าไม่มี error
- [ ] ทดสอบคลิกโลโก้มหาวิทยาลัย
- [ ] ทดสอบคลิกภาคบนแผนที่
- [ ] ทดสอบคลิกพื้นหลังเพื่อปิดการ์ด

---

## 🎯 ลำดับการรัน SQL Scripts:

1. **ก่อน:** `supabase_map_settings.sql`
2. **หลัง:** `supabase_map_universities.sql`

**สำคัญ:** ต้องรัน map_settings ก่อน เพราะ map_universities ใช้ function `handle_updated_at()` ที่สร้างใน map_settings

---

## 🔍 วิธีตรวจสอบว่าระบบทำงานถูกต้อง:

### ตรวจสอบ Database:

```sql
-- ตรวจสอบ map_settings
SELECT * FROM map_settings;

-- ตรวจสอบ map_universities
SELECT region, name_th, degree_level, is_visible
FROM map_universities
ORDER BY order_index;
```

### ตรวจสอบ Console:

เปิด Browser Console (F12) และดูว่ามี error หรือไม่:

✅ **ถูกต้อง:**

```
🌐 Website data refreshed: 5:05:57 AM
📦 Projects: 3
🎓 Education: 1
💼 Experience: 5
```

❌ **ผิดพลาด:**

```
Failed to load resource: the server responded with a status of 404 ()
Error fetching map settings
Error fetching universities
```

---

## 💡 Tips:

1. **ถ้า 404 Error ยังมี:**

   - ตรวจสอบว่ารัน SQL script แล้ว
   - ตรวจสอบว่าตารางถูกสร้างใน schema `public`
   - ตรวจสอบ RLS policies

2. **ถ้าการ์ดไม่ปิด:**

   - Refresh หน้าเว็บ (Hard Refresh)
   - Clear browser cache
   - ตรวจสอบ Console สำหรับ JavaScript errors

3. **ถ้าข้อมูลไม่แสดง:**
   - ตรวจสอบว่า `is_visible = true` ในตาราง
   - ตรวจสอบว่ามีข้อมูลในตาราง
   - ตรวจสอบ Console สำหรับ fetch errors

---

## 📞 ถ้ายังมีปัญหา:

1. ส่ง screenshot ของ Console errors
2. ส่งผลลัพธ์จาก SQL query:
   ```sql
   SELECT * FROM map_settings;
   SELECT * FROM map_universities;
   ```
3. บอกว่าขั้นตอนไหนที่ทำแล้ว
