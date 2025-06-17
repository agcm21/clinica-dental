import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Obtener estadísticas de pacientes
    const { data: patients, error: patientsError } = await supabase.from("patients").select("*")

    if (patientsError) {
      return NextResponse.json({ error: patientsError.message }, { status: 500 })
    }

    // Obtener estadísticas de tratamientos
    const { data: treatments, error: treatmentsError } = await supabase.from("dental_treatments").select("*")

    if (treatmentsError) {
      return NextResponse.json({ error: treatmentsError.message }, { status: 500 })
    }

    // Obtener estadísticas de citas
    const { data: appointments, error: appointmentsError } = await supabase.from("appointments").select("*")

    if (appointmentsError) {
      return NextResponse.json({ error: appointmentsError.message }, { status: 500 })
    }

    // Calcular estadísticas
    const totalPatients = patients?.length || 0
    const totalTreatments = treatments?.length || 0
    const totalAppointments = appointments?.length || 0

    // Estadísticas por mes (últimos 6 meses)
    const monthlyStats: { [key: string]: number } = {}
    const currentDate = new Date()

    // Inicializar los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
      monthlyStats[monthKey] = 0
    }

    // Contar pacientes por mes
    patients?.forEach((patient: any) => {
      if (patient.created_at) {
        const monthKey = patient.created_at.slice(0, 7) // YYYY-MM format
        if (monthKey in monthlyStats) {
          monthlyStats[monthKey]++
        }
      }
    })

    // Estadísticas de tratamientos por estado
    const treatmentStats: { [key: string]: number } = {
      completed: 0,
      "in-treatment": 0,
      pending: 0,
      healthy: 0,
    }

    treatments?.forEach((treatment: any) => {
      const status = treatment.status || "healthy"
      if (status in treatmentStats) {
        treatmentStats[status]++
      }
    })

    // Citas por estado
    const appointmentStats: { [key: string]: number } = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    }

    appointments?.forEach((appointment: any) => {
      const status = appointment.status || "scheduled"
      if (status in appointmentStats) {
        appointmentStats[status]++
      }
    })

    return NextResponse.json({
      totalPatients,
      totalTreatments,
      totalAppointments,
      monthlyPatients: monthlyStats,
      treatmentsByStatus: treatmentStats,
      appointmentsByStatus: appointmentStats,
    })
  } catch (error) {
    console.error("Error getting patient stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
