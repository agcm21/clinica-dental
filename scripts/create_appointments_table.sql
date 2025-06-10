-- Create appointments table if it doesn't exist
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  treatment_type TEXT NOT NULL,
  doctor TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  google_calendar_id TEXT,
  external_id TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_google_calendar_id ON appointments(google_calendar_id);

-- Add sample data if the table is empty
INSERT INTO appointments (
  patient_id, 
  title, 
  appointment_date, 
  start_time, 
  end_time, 
  treatment_type, 
  doctor, 
  notes, 
  status
)
SELECT 
  (SELECT id FROM patients ORDER BY RANDOM() LIMIT 1),
  'Limpieza Dental',
  CURRENT_DATE + (RANDOM() * 14)::INTEGER,
  '09:00:00'::TIME,
  '10:00:00'::TIME,
  'Limpieza',
  'Dr. Martinez',
  'Primera visita del paciente',
  'scheduled'
FROM generate_series(1, 5)
WHERE NOT EXISTS (SELECT 1 FROM appointments LIMIT 1);
