-- Temporalmente deshabilitar RLS para la tabla storage.buckets
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- Verificar si el bucket ya existe
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'treatment-images'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    -- Insertar el bucket directamente en la base de datos
    INSERT INTO storage.buckets (id, name, owner, created_at, updated_at, public)
    VALUES ('treatment-images', 'treatment-images', auth.uid(), now(), now(), TRUE);
  END IF;
END $$;

-- Crear políticas para el bucket
DROP POLICY IF EXISTS "Public Access to Treatment Images Bucket" ON storage.buckets;
CREATE POLICY "Public Access to Treatment Images Bucket"
ON storage.buckets FOR SELECT
TO PUBLIC
USING (name = 'treatment-images');

-- Configurar políticas para los objetos dentro del bucket
DROP POLICY IF EXISTS "Public Access to Treatment Images" ON storage.objects;
DROP POLICY IF EXISTS "Enable upload for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for all users" ON storage.objects;

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

-- Volver a habilitar RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
