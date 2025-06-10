-- Disable RLS for storage.objects temporarily to allow initial setup
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public Access to Treatment Images" ON storage.objects;
DROP POLICY IF EXISTS "Enable upload for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for all users" ON storage.objects;

-- Create new policies with proper permissions
CREATE POLICY "Public Access to Treatment Images"
ON storage.objects FOR SELECT
TO PUBLIC
USING (bucket_id = 'treatment-images');

CREATE POLICY "Enable upload for all users"
ON storage.objects FOR INSERT
TO PUBLIC
WITH CHECK (bucket_id = 'treatment-images');

CREATE POLICY "Enable update for all users"
ON storage.objects FOR UPDATE
TO PUBLIC
USING (bucket_id = 'treatment-images');

CREATE POLICY "Enable delete for all users"
ON storage.objects FOR DELETE
TO PUBLIC
USING (bucket_id = 'treatment-images');

-- Re-enable RLS for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
