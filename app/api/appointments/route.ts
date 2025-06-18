import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

// GET - Fetch appointments with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const status = searchParams.get("status")

    let query = supabase.from("appointments").select(`
      *,
      patients:patient_id (
        id,
        first_name,
        last_name,
        cedula,
        phone,
        email
      )
    `)

    if (patientId) {
      query = query.eq("patient_id", patientId)
    }

    if (startDate) {
      query = query.gte("appointment_date", startDate)
    }

    if (endDate) {
      query = query.lte("appointment_date", endDate)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query
      .order("appointment_date", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching appointments:", error)
      return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in appointments GET route:", error)
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}

// POST - Create a new appointment
export async function POST(request: Request) {
  try {
    const appointmentData = await request.json()
    console.log("API: Creating appointment with data:", appointmentData)

    // Validate required fields
    if (
      !appointmentData.patient_id ||
      !appointmentData.appointment_date ||
      !appointmentData.start_time ||
      !appointmentData.treatment_type
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Calculate end_time if not provided (default to 1 hour after start_time)
    if (!appointmentData.end_time) {
      const startTime = new Date(`2000-01-01T${appointmentData.start_time}`)
      startTime.setHours(startTime.getHours() + 1)
      appointmentData.end_time = startTime.toTimeString().split(" ")[0]
    }

    // Set default title if not provided
    if (!appointmentData.title) {
      appointmentData.title = appointmentData.treatment_type
    }

    const { data, error } = await supabase.from("appointments").insert([appointmentData]).select()

    if (error) {
      console.error("Error creating appointment:", error)
      return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
    }

    console.log("API: Appointment created successfully:", data)
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("Error in appointments POST route:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}
