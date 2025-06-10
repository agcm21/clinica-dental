"use server"

import { supabase } from "@/lib/supabase"

interface CreatePatientResult {
  success: boolean
  message?: string
  error?: string
}

export async function createPatient(patientData: any): Promise<CreatePatientResult> {
  try {
    // Validar datos requeridos
    if (!patientData.first_name || !patientData.last_name || !patientData.cedula) {
      return {
        success: false,
        error: "Faltan campos requeridos",
      }
    }

    // Asegurarse de que los campos booleanos sean correctos
    const formattedData = {
      ...patientData,
      pregnant: Boolean(patientData.pregnant),
      created_at: new Date().toISOString(),
    }

    // Eliminar el campo status si existe
    delete formattedData.status

    // Insertar en Supabase
    const { data, error } = await supabase.from("patients").insert([formattedData]).select().single()

    if (error) {
      console.error("Error en Supabase:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Paciente creado exitosamente",
    }
  } catch (error) {
    console.error("Error inesperado:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado al crear el paciente",
    }
  }
}
