-- ========================================
-- 🗑️ ADD DELETE POLICY FOR ANALYTICS
-- ========================================
-- This allows admin to delete analytics data from the dashboard

-- Drop existing delete policy if exists
DROP POLICY IF EXISTS "Allow admin delete access" ON website_visits;

-- Create new delete policy that allows anyone to delete
-- Note: In production, you should restrict this to authenticated admin users only
CREATE POLICY "Allow admin delete access" ON website_visits
  FOR DELETE USING (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'website_visits';
