-- Añadir columna para almacenar la acción seleccionada
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS metodo_envio VARCHAR(20);
