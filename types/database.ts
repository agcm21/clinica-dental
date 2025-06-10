// Tipos para la base de datos
export interface Patient {
  id: string
  cedula: string
  first_name: string
  last_name: string
  date_birth: string
  gender: string
  phone: string
  email: string | null
  address: string | null
  occupation: string | null
  blood_type: string | null
  chronic_diseases: string | null
  medications: string | null
  allergies: string | null
  pregnant: boolean
  contagious_disease: string | null
  status: string
  created_at: string
}

export interface DentalTreatment {
  id: string
  patient_id: string
  tooth_number: number
  tooth_zone: string
  treatment_type: string
  treatment_date: string
  details: string
  status: string
  images?: string[]
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  date: string
  time: string
  treatment_type: string
  notes: string | null
  status: string
  created_at: string
}

export interface Invoice {
  id: string
  patient_id: string
  date: string
  total_amount: number
  paid_amount: number
  pending_amount: number
  status: string
  created_at: string
}

export interface Document {
  id: string
  patient_id: string
  name: string
  url: string
  type: string
  created_at: string
}
