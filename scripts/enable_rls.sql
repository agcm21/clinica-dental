-- Habilitar RLS en la tabla dental_treatments
ALTER TABLE dental_treatments ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (ajustar según necesidades)
CREATE POLICY "Enable all operations for dental_treatments"
ON dental_treatments
FOR ALL
USING (true)
WITH CHECK (true);
