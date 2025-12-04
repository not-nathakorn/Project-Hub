# คู่มือการติดตั้งระบบจัดการแผนที่การศึกษา

## ขั้นตอนการติดตั้ง

### 1. สร้างตาราง map_settings ใน Supabase

1. เข้าไปที่ Supabase Dashboard
2. ไปที่ SQL Editor
3. คัดลอกและรันคำสั่ง SQL จากไฟล์ `supabase_map_settings.sql`

```sql
-- คัดลอกทั้งหมดจากไฟล์ supabase_map_settings.sql และรันใน SQL Editor
```

### 2. ตรวจสอบการติดตั้ง

หลังจากรัน SQL แล้ว ให้ตรวจสอบว่า:

- ✅ ตาราง `map_settings` ถูกสร้างแล้ว
- ✅ มีข้อมูลเริ่มต้น 1 แถว (is_visible = true, enabled_universities = ทั้ง 4 ภาค)
- ✅ RLS (Row Level Security) ถูกเปิดใช้งาน

### 3. ทดสอบระบบ

1. **ทดสอบหน้า Admin:**

   - เข้าไปที่หน้า Admin (`/admin`)
   - คลิกที่แท็บ "แผนที่"
   - ควรเห็นหน้าจัดการแผนที่การศึกษา

2. **ทดสอบการตั้งค่า:**

   - ลองเปิด/ปิดการแสดงแผนที่
   - ลองเลือก/ยกเลิกมหาวิทยาลัยต่างๆ
   - กดบันทึกและตรวจสอบว่าการเปลี่ยนแปลงถูกบันทึก

3. **ทดสอบหน้าหลัก:**
   - เข้าไปที่หน้าหลัก (`/`)
   - ตรวจสอบว่าแผนที่แสดงตามการตั้งค่า
   - ตรวจสอบว่าแสดงเฉพาะมหาวิทยาลัยที่เลือกไว้

## ฟีเจอร์ที่เพิ่มเข้ามา

### 1. ระบบจัดการแผนที่ (MapSettingsManager)

- **ตำแหน่ง:** `/src/components/admin/MapSettingsManager.tsx`
- **ฟีเจอร์:**
  - เปิด/ปิดการแสดงแผนที่ทั้งหมด
  - เลือกมหาวิทยาลัยที่ต้องการแสดง (อย่างน้อย 1 แห่ง)
  - แสดงสถานะปัจจุบัน
  - บันทึกการตั้งค่าลง Supabase

### 2. อัพเดท ThailandEducationMap

- **ตำแหน่ง:** `/src/components/ThailandEducationMap.tsx`
- **การเปลี่ยนแปลง:**
  - ดึงการตั้งค่าจาก Supabase อัตโนมัติ
  - ซ่อนแผนที่ทั้งหมดถ้า `is_visible = false`
  - แสดงเฉพาะมหาวิทยาลัยที่เลือกไว้ใน `enabled_universities`

### 3. เพิ่มแท็บในหน้า Admin

- **ตำแหน่ง:** `/src/pages/Admin.tsx`
- **การเปลี่ยนแปลง:**
  - เพิ่มแท็บ "แผนที่" ใหม่
  - เพิ่ม MapSettingsManager component

### 4. อัพเดท Supabase Types

- **ตำแหน่ง:** `/src/lib/supabase.ts`
- **การเปลี่ยนแปลง:**
  - เพิ่ม `MapSettings` interface

## โครงสร้างข้อมูล

### ตาราง map_settings

| Column               | Type      | Description                    |
| -------------------- | --------- | ------------------------------ |
| id                   | UUID      | Primary key                    |
| is_visible           | BOOLEAN   | เปิด/ปิดการแสดงแผนที่          |
| enabled_universities | JSONB     | อาร์เรย์ของมหาวิทยาลัยที่เลือก |
| created_at           | TIMESTAMP | วันที่สร้าง                    |
| updated_at           | TIMESTAMP | วันที่อัพเดทล่าสุด             |

### ค่าที่เป็นไปได้ของ enabled_universities

```json
["north", "northeast", "central", "south"]
```

- `"north"` = ภาคเหนือ (CMU)
- `"northeast"` = ภาคอีสาน (KKU)
- `"central"` = ภาคกลาง (RU)
- `"south"` = ภาคใต้ (PSU)

## การแก้ไขปัญหา

### ปัญหา: ไม่สามารถบันทึกการตั้งค่าได้

**วิธีแก้:**

1. ตรวจสอบว่า RLS policies ถูกสร้างแล้ว
2. ตรวจสอบว่าผู้ใช้ล็อกอินแล้ว (authenticated)
3. ตรวจสอบ Console ใน Browser สำหรับ error messages

### ปัญหา: แผนที่ไม่แสดงบนหน้าหลัก

**วิธีแก้:**

1. ตรวจสอบว่า `is_visible = true` ในตาราง map_settings
2. ตรวจสอบว่ามีมหาวิทยาลัยอย่างน้อย 1 แห่งใน `enabled_universities`
3. ตรวจสอบ Console ใน Browser สำหรับ error messages

### ปัญหา: การเปลี่ยนแปลงไม่แสดงทันที

**วิธีแก้:**

1. Refresh หน้าเว็บ (F5)
2. ตรวจสอบว่าการบันทึกสำเร็จ (ดูที่ toast notification)

## การพัฒนาต่อ

### เพิ่มฟีเจอร์ใหม่

1. **Real-time Updates:**

   - ใช้ Supabase Realtime เพื่ออัพเดทแผนที่แบบ real-time
   - เพิ่ม subscription ใน ThailandEducationMap

2. **การจัดการข้อมูลมหาวิทยาลัย:**

   - สร้างตาราง universities
   - เพิ่มฟอร์มสำหรับแก้ไขข้อมูลมหาวิทยาลัย

3. **Analytics:**
   - ติดตามว่ามหาวิทยาลัยไหนถูกคลิกบ่อยที่สุด
   - แสดงสถิติการใช้งาน

## ติดต่อและสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. ตรวจสอบ Console ใน Browser
2. ตรวจสอบ Supabase Logs
3. ตรวจสอบไฟล์นี้สำหรับคำแนะนำ
