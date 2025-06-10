-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Public Access to Treatment Images" ON storage.objects;
DROP POLICY IF EXISTS "Enable upload for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON storage.objects;

-- Política para permitir acceso público a las imágenes
CREATE POLICY "Public Access to Treatment Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'treatment-images');

-- Política para permitir la carga de imágenes sin restricciones
CREATE POLICY "Enable upload for all users"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'treatment-images');

-- Política para permitir actualización de imágenes
CREATE POLICY "Enable update for all users"
ON storage.objects FOR UPDATE
USING (bucket_id = 'treatment-images');

-- Política para permitir eliminación de imágenes
CREATE POLICY "Enable delete for all users"
ON storage.objects FOR DELETE
USING (bucket_id = 'treatment-images');
