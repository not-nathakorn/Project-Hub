# 🔒 Security Guidelines

## ไฟล์ที่ห้ามอัพโหลดขึ้น Git

### ⚠️ ไฟล์ที่มีข้อมูลสำคัญ (ถูก Ignore แล้ว)

#### 1. Environment Variables (`.env`)

```
.env
.env.local
.env.development
.env.production
.env.test
```

**เหตุผล:** มี API Keys และ Credentials ที่สำคัญ

- `VITE_SUPABASE_URL` - URL ของ Supabase Project
- `VITE_SUPABASE_ANON_KEY` - Anonymous Key สำหรับเข้าถึง Database

**วิธีใช้:**

1. คัดลอก `.env.example` เป็น `.env`
2. แก้ไขค่าใน `.env` ด้วย credentials จริง
3. **ห้ามแชร์ไฟล์ `.env` กับใครเด็ดขาด**

#### 2. Database Schema with Data (`supabase-schema.sql`)

```
supabase-schema.sql
```

**เหตุผล:** อาจมีข้อมูลส่วนตัวหรือข้อมูลจริงในคำสั่ง INSERT

**ทางเลือก:**

- ใช้ `supabase-schema-template.sql` แทน (ไม่มีข้อมูลจริง)
- Template file นี้ปลอดภัยสำหรับการ commit

## ✅ ไฟล์ที่ปลอดภัยสำหรับ Git

### 1. `.env.example`

- เป็นแค่ template ไม่มีค่าจริง
- ช่วยให้คนอื่นรู้ว่าต้องตั้งค่าอะไรบ้าง

### 2. `supabase-schema-template.sql`

- มีแค่โครงสร้างตาราง ไม่มีข้อมูลจริง
- ใช้สำหรับ setup database ใหม่

### 3. Source Code ทั้งหมด

- `src/` - โค้ดทั้งหมดปลอดภัย
- `ADMIN_SETUP.md`, `SECURITY.md` - เอกสารคำแนะนำ

## 🛡️ Best Practices

### 1. ตรวจสอบก่อน Commit

```bash
# ดูว่าจะ commit อะไรบ้าง
git status

# ตรวจสอบว่าไม่มีไฟล์ .env หรือ supabase-schema.sql
git diff --cached
```

### 2. ถ้า Commit ไฟล์สำคัญไปแล้ว

```bash
# ลบออกจาก Git แต่เก็บไฟล์ไว้ในเครื่อง
git rm --cached .env
git rm --cached supabase-schema.sql

# Commit การเปลี่ยนแปลง
git commit -m "Remove sensitive files from git"
```

### 3. ถ้า Push ขึ้น GitHub ไปแล้ว

⚠️ **ต้องเปลี่ยน API Keys ทันที!**

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. Project Settings → API
3. Reset API Keys
4. อัพเดท `.env` ด้วย keys ใหม่

### 4. ใช้ Git Hooks (ขั้นสูง)

สร้างไฟล์ `.git/hooks/pre-commit`:

```bash
#!/bin/bash
if git diff --cached --name-only | grep -E "\.env$|supabase-schema\.sql$"; then
  echo "❌ Error: Attempting to commit sensitive files!"
  echo "Files blocked: .env or supabase-schema.sql"
  exit 1
fi
```

## 🔐 Supabase Security

### Row Level Security (RLS)

ตอนนี้ RLS ตั้งค่าแบบนี้:

- ✅ **Read (SELECT):** ทุกคนอ่านได้ (เฉพาะ `is_visible = true`)
- ⚠️ **Write (INSERT/UPDATE/DELETE):** ยังไม่มีการป้องกัน

### เพิ่ม Authentication (แนะนำ)

#### 1. ตั้งค่า Supabase Auth

```sql
-- สร้าง Admin Role
CREATE POLICY "Allow admin write access" ON projects
  FOR ALL
  USING (auth.role() = 'authenticated');
```

#### 2. เพิ่ม Login Page

```typescript
import { supabase } from "@/lib/supabase";

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: "admin@example.com",
  password: "your-password",
});

// Logout
await supabase.auth.signOut();
```

#### 3. Protected Route

```typescript
// ตรวจสอบว่า login หรือยัง
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) {
  navigate("/login");
}
```

## 📋 Checklist ก่อน Deploy

- [ ] ตรวจสอบว่าไม่มี `.env` ใน Git
- [ ] ตรวจสอบว่าไม่มี `supabase-schema.sql` ใน Git
- [ ] มี `.env.example` สำหรับคนอื่น
- [ ] มี `supabase-schema-template.sql` สำหรับ setup
- [ ] RLS Policies ตั้งค่าถูกต้อง
- [ ] API Keys ไม่ถูก hardcode ในโค้ด
- [ ] ใช้ Environment Variables สำหรับ sensitive data

## 🆘 ถ้ามีปัญหา

### ไฟล์ .env หาย

1. คัดลอก `.env.example` เป็น `.env`
2. ไปที่ Supabase Dashboard
3. คัดลอก URL และ Anon Key มาใส่

### API Key รั่วไหล

1. Reset API Keys ใน Supabase Dashboard ทันที
2. อัพเดท `.env` ด้วย keys ใหม่
3. ลบ commit ที่มี keys เก่าออกจาก Git history

### ต้องการแชร์โปรเจค

1. ส่ง `.env.example` ไปให้
2. บอกให้สร้าง Supabase Project เอง
3. ให้รัน `supabase-schema-template.sql`
4. ให้สร้าง `.env` จาก `.env.example`

---

## 📚 Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Git Ignore Documentation](https://git-scm.com/docs/gitignore)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)

---

**สร้างโดย CodeX 🚀**
**อัพเดทล่าสุด: 2025-12-04**
