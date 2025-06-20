import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getAvailableTimeSlots } from "@/lib/appointment-utils"

// GET - Fetch available slots for n8n integration
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    const availableSlots = await getAvailableTimeSlots(date)

    return NextResponse.json(availableSlots)
  } catch (error) {
    console.error("Error in n8n integration GET route:", error)
    return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 })
  }
}

// POST - Create appointment from n8n
export async function POST(request: Request) {
  try {
    const appointmentData = await request.json()

    // Validate required fields
    if (!appointmentData.patient_id && !appointmentData.patient_data) {
      return NextResponse.json({ error: "Either patient_id or patient_data is required" }, { status: 400 })
    }

    if (!appointmentData.appointment_date || !appointmentData.start_time || !appointmentData.treatment_type) {
      return NextResponse.json({ error: "Missing required appointment fields" }, { status: 400 })
    }

    let patientId = appointmentData.patient_id

    // If patient_data is provided but no patient_id, create a new patient
    if (!patientId && appointmentData.patient_data) {
      const patientData = appointmentData.patient_data

      // Validate patient data
      if (!patientData.first_name || !patientData.last_name || !patientData.cedula) {
        return NextResponse.json({ error: "Missing required patient fields" }, { status: 400 })
      }

      // Create new patient
      const { data: newPatient, error: patientError } = await supabase.from("patients").insert([patientData]).select()

      if (patientError) {
        // ✅ CORRECCIÓN: Usar patientError en lugar de error, eliminar patientId( incorrecto
        return NextResponse.json(
          {
            error: `Error creating patient: ${patientError instanceof Error ? patientError.message : "Error desconocido"}`,
          },
          { status: 500 },
        )
      }

      patientId = newPatient[0].id
    }

    // Calculate end_time if not provided
    if (!appointmentData.end_time) {
      const startTime = new Date(`2000-01-01T${appointmentData.start_time}`)
      startTime.setHours(startTime.getHours() + 1)
      appointmentData.end_time = startTime.toTimeString().split(" ")[0]
    }

    // Create appointment
    const { data, error } = await supabase
      .from("appointments")
      .insert([
        {
          patient_id: patientId,
          title: appointmentData.title || appointmentData.treatment_type,
          appointment_date: appointmentData.appointment_date,
          start_time: appointmentData.start_time,
          end_time: appointmentData.end_time,
          treatment_type: appointmentData.treatment_type,
          doctor: appointmentData.doctor || null,
          notes: appointmentData.notes || null,
          status: appointmentData.status || "scheduled",
          google_calendar_id: appointmentData.google_calendar_id || null,
          external_id: appointmentData.external_id || null,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("Error in n8n integration POST route:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}



