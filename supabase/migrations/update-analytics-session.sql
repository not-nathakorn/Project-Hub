-- เพิ่มคอลัมน์ session_id เพื่อแยกแยะผู้ใช้งาน (Unique Visitors)
ALTER TABLE website_visits ADD COLUMN IF NOT EXISTS session_id TEXT;
