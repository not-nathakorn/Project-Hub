-- Fix RLS policies for map_universities table
-- This allows public read and authenticated write access

-- First, check and enable RLS if not already enabled
ALTER TABLE map_universities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to recreate them properly)
DROP POLICY IF EXISTS "Allow public read access" ON map_universities;
DROP POLICY IF EXISTS "Allow authenticated update" ON map_universities;
DROP POLICY IF EXISTS "Allow anonymous read" ON map_universities;
DROP POLICY IF EXISTS "Allow anonymous update" ON map_universities;
DROP POLICY IF EXISTS "Enable read access for all users" ON map_universities;
DROP POLICY IF EXISTS "Enable update for all users" ON map_universities;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users" 
ON map_universities
FOR SELECT 
TO public
USING (true);

-- Create policy for public update access (for admin panel without auth)
CREATE POLICY "Enable update for all users" 
ON map_universities
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'map_universities';
