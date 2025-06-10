-- Añadir columna para URL de imagen y fecha de envío
ALTER TABLE presupuestos
ADD COLUMN IF NOT EXISTS imagen_url TEXT,
ADD COLUMN IF NOT EXISTS fecha_envio TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear un index para facilitar búsquedas por fecha de envío
CREATE INDEX IF NOT EXISTS idx_presupuestos_fecha_envio ON presupuestos(fecha_envio);
