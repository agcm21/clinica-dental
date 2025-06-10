-- Crear tabla de presupuestos si no existe
CREATE TABLE IF NOT EXISTS presupuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  monto DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  tratamientos JSONB NOT NULL,
  notas TEXT,
  metodo_envio VARCHAR(20) DEFAULT NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_presupuestos_paciente_id ON presupuestos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_estado ON presupuestos(estado);

-- Insertar datos de ejemplo si la tabla está vacía
INSERT INTO presupuestos (paciente_id, monto, estado, tratamientos, notas)
SELECT 
  (SELECT id FROM pacientes ORDER BY RANDOM() LIMIT 1),
  ROUND(CAST(RANDOM() * 1000 + 500 AS NUMERIC), 2),
  CASE 
    WHEN RANDOM() < 0.25 THEN 'aprobado'
    WHEN RANDOM() < 0.5 THEN 'rechazado'
    ELSE 'pendiente'
  END,
  '[{"diente": 11, "tratamiento": "Limpieza", "precio": 50}, {"diente": 21, "tratamiento": "Empaste", "precio": 75}]'::JSONB,
  'Presupuesto de ejemplo'
FROM generate_series(1, 4)
WHERE NOT EXISTS (SELECT 1 FROM presupuestos LIMIT 1);
