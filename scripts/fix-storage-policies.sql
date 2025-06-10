-- Deshabilitar temporalmente RLS para storage.buckets
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- Asegurarse de que el bucket existe y es público
DO $$
BEGIN
    -- Verificar si el bucket existe
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'treatment-images'
    ) THEN
        -- Crear el bucket si no existe
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('treatment-images', 'treatment-images', true);
    ELSE
        -- Actualizar el bucket existente para hacerlo público
        UPDATE storage.buckets
        SET public = true
        WHERE name = 'treatment-images';
    END IF;
END $$;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Delete Access" ON storage.objects;

-- Crear nuevas políticas más permisivas
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'treatment-images');

CREATE POLICY "Insert Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'treatment-images');

CREATE POLICY "Update Access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'treatment-images');

CREATE POLICY "Delete Access"
ON storage.objects FOR DELETE
USING (bucket_id = 'treatment-images');

-- Habilitar RLS nuevamente
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Asegurarse de que la tabla objects tiene RLS habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
