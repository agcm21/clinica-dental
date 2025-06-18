import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Obtener total de pacientes
    const { data: patients, error: patientsError } = await supabase.from("patients").select("id, created_at")

    if (patientsError) {
      console.error("Error fetching patients:", patientsError)
      return NextResponse.json({ error: "Error al obtener pacientes" }, { status: 500 })
    }

    // Obtener total de tratamientos
    const { data: treatments, error: treatmentsError } = await supabase
      .from("dental_treatments")
      .select("id, status, created_at")

    if (treatmentsError) {
      console.error("Error fetching treatments:", treatmentsError)
      return NextResponse.json({ error: "Error al obtener tratamientos" }, { status: 500 })
    }

    // Obtener total de citas
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("id, status, created_at")

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError)
      return NextResponse.json({ error: "Error al obtener citas" }, { status: 500 })
    }

    // Calcular estadísticas básicas
    const totalPatients = patients?.length || 0
    const totalTreatments = treatments?.length || 0
    const totalAppointments = appointments?.length || 0

    // Estadísticas de tratamientos por estado
    const treatmentStats = {
      completed: 0,
      "in-treatment": 0,
      pending: 0,
      healthy: 0,
    }

    if (treatments) {
      treatments.forEach((treatment: any) => {
        const status = treatment.status || "healthy"
        if (status in treatmentStats) {
          treatmentStats[status as keyof typeof treatmentStats]++
        }
      })
    }

    // Estadísticas de citas por estado
    const appointmentStats = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    }

    if (appointments) {
      appointments.forEach((appointment: any) => {
        const status = appointment.status || "scheduled"
        if (status in appointmentStats) {
          appointmentStats[status as keyof typeof appointmentStats]++
        }
      })
    }

    return NextResponse.json({
      totalPatients,
      totalTreatments,
      totalAppointments,
      treatmentsByStatus: treatmentStats,
      appointmentsByStatus: appointmentStats,
    })
  } catch (error) {
    console.error("Error in stats API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
