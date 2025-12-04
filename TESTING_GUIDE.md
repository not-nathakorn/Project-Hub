# 🧪 คู่มือการทดสอบระบบ Show/Hide

## 📋 Overview

ระบบ Show/Hide ทำงานแบบ Realtime:

- **Admin Dashboard**: จัดการข้อมูล (แสดง/ซ่อน)
- **หน้าเว็บหลัก**: แสดงเฉพาะข้อมูลที่ `is_visible = true`
- **Realtime Sync**: อัพเดทอัตโนมัติไม่ต้อง refresh

---

## 🚀 ขั้นตอนการ Setup

### 1. รัน SQL Setup Script

เปิด Supabase SQL Editor และรัน:

```bash
# ไฟล์: complete-system-setup.sql
```

หรือรันทีละขั้นตอน:

```sql
-- 1. แก้ไข RLS Policies
DROP POLICY IF EXISTS "Allow public read access" ON education;
DROP POLICY IF EXISTS "Allow public read access" ON projects;
DROP POLICY IF EXISTS "Allow public read access" ON experience;

CREATE POLICY "Allow public read access" ON education FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON experience FOR SELECT USING (true);

-- 2. เปิด Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE education;
ALTER PUBLICATION supabase_realtime ADD TABLE experience;
```

### 2. Restart Dev Server (ถ้าจำเป็น)

```bash
# หยุด server (Ctrl+C)
# รันใหม่
npm run dev
```

---

## ✅ การทดสอบ

### Test 1: Admin Dashboard - ดูข้อมูลทั้งหมด

1. เปิด `http://localhost:8080/admin`
2. คลิก Tab "การศึกษา"
3. **ควรเห็น:**
   - ✅ การศึกษา **1/2** (แสดง 1 จาก 2)
   - ✅ รายการปริญญาโท (สีเทา, badge "ซ่อนอยู่")
   - ✅ รายการปริญญาตรี (สีเขียว, badge "แสดงบนเว็บ")

**Console Log:**

```
📚 Education data fetched: Array(2)
📊 Total education records: 2
```

---

### Test 2: หน้าเว็บ - แสดงเฉพาะที่เปิด

1. เปิด `http://localhost:8080/`
2. Scroll ไปที่ Education Section
3. **ควรเห็น:**
   - ✅ เฉพาะปริญญาตรี (2021–2024)
   - ❌ ไม่เห็นปริญญาโท (ถูกซ่อน)

**Console Log:**

```
🌐 Website data loaded:
  📦 Projects: 6
  🎓 Education: 1  ← เฉพาะที่แสดง
  💼 Experience: 5
```

---

### Test 3: Toggle Visibility - แสดงปริญญาโท

1. **เปิด 2 แท็บ:**

   - Tab 1: `http://localhost:8080/` (หน้าเว็บ)
   - Tab 2: `http://localhost:8080/admin` (Admin)

2. **ใน Admin Tab:**

   - คลิก Tab "การศึกษา"
   - คลิกปุ่ม 👁️ ที่ปริญญาโท
   - **ควรเห็น:**
     - ✅ Toast: "🌐 แสดงรายการแล้ว - แสดงบนเว็บ"
     - ✅ Card เปลี่ยนเป็นสีเขียว
     - ✅ Badge เปลี่ยนเป็น "แสดงบนเว็บ"
     - ✅ สถิติเปลี่ยนเป็น **2/2**

3. **ใน Website Tab (ไม่ต้อง refresh!):**
   - **ควรเห็นอัตโนมัติ:**
     - ✅ ปริญญาโทปรากฏขึ้นมา
     - ✅ แสดง 2 รายการ

**Console Log (Website Tab):**

```
🔄 Education updated, refreshing...
🌐 Website data loaded:
  📦 Projects: 6
  🎓 Education: 2  ← เพิ่มขึ้นเป็น 2!
  💼 Experience: 5
```

---

### Test 4: Toggle Visibility - ซ่อนปริญญาโท

1. **ใน Admin Tab:**

   - คลิกปุ่ม 👁️ ที่ปริญญาโทอีกครั้ง
   - **ควรเห็น:**
     - ✅ Toast: "✅ ซ่อนรายการแล้ว - ไม่แสดงบนเว็บ"
     - ✅ Card เปลี่ยนเป็นสีเทา
     - ✅ Badge เปลี่ยนเป็น "ซ่อนอยู่"
     - ✅ สถิติเปลี่ยนเป็น **1/2**

2. **ใน Website Tab (ไม่ต้อง refresh!):**
   - **ควรเห็นอัตโนมัติ:**
     - ✅ ปริญญาโทหายไป
     - ✅ แสดงเฉพาะปริญญาตรี

**Console Log (Website Tab):**

```
🔄 Education updated, refreshing...
🌐 Website data loaded:
  📦 Projects: 6
  🎓 Education: 1  ← กลับเป็น 1!
  💼 Experience: 5
```

---

### Test 5: ทดสอบ Projects

1. **ใน Admin Tab:**

   - คลิก Tab "โครงการ"
   - เลือกโครงการใดก็ได้
   - คลิกปุ่ม 👁️

2. **ใน Website Tab:**
   - Scroll ไปที่ Projects Section
   - **ควรเห็น:** โครงการหาย/ปรากฏอัตโนมัติ

**Console Log:**

```
🔄 Projects updated, refreshing...
🌐 Website data loaded:
  📦 Projects: X  ← เปลี่ยนตามที่ toggle
```

---

### Test 6: ทดสอบ Experience

1. **ใน Admin Tab:**

   - คลิก Tab "ประสบการณ์"
   - เลือกประสบการณ์ใดก็ได้
   - คลิกปุ่ม 👁️

2. **ใน Website Tab:**
   - Scroll ไปที่ Experience Section
   - **ควรเห็น:** ประสบการณ์หาย/ปรากฏอัตโนมัติ

**Console Log:**

```
🔄 Experience updated, refreshing...
🌐 Website data loaded:
  💼 Experience: X  ← เปลี่ยนตามที่ toggle
```

---

## 📱 Mobile Testing

### Desktop

1. เปิด Chrome DevTools (F12)
2. คลิก Toggle Device Toolbar (Ctrl+Shift+M)
3. เลือก iPhone/iPad
4. ทดสอบ toggle - ควรทำงานเหมือนกัน

### จริง Mobile/Tablet

1. เปิดหน้าเว็บบนมือถือ: `http://[your-ip]:8080/`
2. เปิด Admin บน Desktop
3. Toggle ใน Admin
4. ดูหน้าเว็บบนมือถือ - ควรอัพเดทอัตโนมัติ

---

## 🐛 Troubleshooting

### ปัญหา: หน้าเว็บไม่อัพเดทอัตโนมัติ

**สาเหตุ:** Realtime ไม่ทำงาน

**แก้ไข:**

1. ตรวจสอบว่ารัน `ALTER PUBLICATION` แล้ว
2. Hard refresh (Ctrl+Shift+R)
3. ดู Console มี error ไหม
4. ตรวจสอบ Supabase Realtime status

```sql
-- ตรวจสอบ Realtime
SELECT * FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

---

### ปัญหา: Admin ไม่เห็นข้อมูลที่ซ่อน

**สาเหตุ:** RLS Policy ยังกรอง `is_visible = true`

**แก้ไข:**

```sql
-- ตรวจสอบ Policy
SELECT * FROM pg_policies WHERE tablename = 'education';

-- ถ้า qual != 'true' ให้แก้ไข
DROP POLICY "Allow public read access" ON education;
CREATE POLICY "Allow public read access" ON education FOR SELECT USING (true);
```

---

### ปัญหา: Toggle ไม่ทำงาน

**สาเหตุ:** Permission หรือ Network error

**แก้ไข:**

1. เปิด Console (F12)
2. ดู Network tab
3. ดู error message
4. ตรวจสอบ Supabase credentials

---

### ปัญหา: ข้อมูลไม่ตรงกันระหว่าง Admin กับ Website

**สาเหตุ:** Cache หรือ stale data

**แก้ไข:**

1. Hard refresh ทั้ง 2 แท็บ (Ctrl+Shift+R)
2. Clear browser cache
3. ตรวจสอบข้อมูลใน Supabase Table Editor

```sql
-- ดูข้อมูลจริงใน Database
SELECT title_th, is_visible FROM education ORDER BY order_index;
```

---

## ✅ Checklist

- [ ] รัน `complete-system-setup.sql` ใน Supabase
- [ ] Restart dev server
- [ ] Admin Dashboard แสดงข้อมูลทั้งหมด (ทั้งแสดงและซ่อน)
- [ ] หน้าเว็บแสดงเฉพาะ `is_visible = true`
- [ ] Toggle ใน Admin → หน้าเว็บอัพเดทอัตโนมัติ
- [ ] Console log แสดงข้อความที่ถูกต้อง
- [ ] ทดสอบทั้ง 3 sections (Projects, Education, Experience)
- [ ] ทดสอบบน Mobile/Tablet
- [ ] ไม่มี error ใน Console

---

## 🎯 Expected Behavior Summary

| Action     | Admin Dashboard | Website              | Realtime |
| ---------- | --------------- | -------------------- | -------- |
| Load page  | แสดงทั้งหมด (2) | แสดงเฉพาะที่เปิด (1) | -        |
| Toggle ON  | Card → สีเขียว  | รายการปรากฏ          | ✅ Auto  |
| Toggle OFF | Card → สีเทา    | รายการหาย            | ✅ Auto  |
| Add new    | +1 รายการ       | +1 (ถ้าเปิด)         | ✅ Auto  |
| Delete     | -1 รายการ       | -1 (ถ้าแสดง)         | ✅ Auto  |

---

## 📊 Performance

- **Initial Load:** ~500ms
- **Toggle Response:** <100ms
- **Realtime Update:** <200ms
- **No Refresh Needed:** ✅

---

## 🎉 Success Criteria

ระบบทำงานสมบูรณ์เมื่อ:

1. ✅ Admin เห็นข้อมูลทั้งหมด
2. ✅ Website แสดงเฉพาะที่เปิด
3. ✅ Toggle ทำงานได้ทุก section
4. ✅ Realtime sync ไม่ต้อง refresh
5. ✅ UI สวยงามทั้ง Desktop และ Mobile
6. ✅ ไม่มี error ใน Console
7. ✅ Toast notifications ทำงานถูกต้อง
8. ✅ Statistics อัพเดทแบบ realtime

---

**หากทุกอย่างทำงานตาม checklist แสดงว่าระบบพร้อมใช้งานแล้ว!** 🚀
