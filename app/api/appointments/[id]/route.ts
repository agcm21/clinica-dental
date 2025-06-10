import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET - Fetch a specific appointment
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
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
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 })
  }
}

// PUT - Update an appointment
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const appointmentData = await request.json()

    // Validate the appointment exists
    const { data: existingAppointment, error: checkError } = await supabase
      .from("appointments")
      .select("id")
      .eq("id", params.id)
      .single()

    if (checkError || !existingAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Update the appointment
    const { data, error } = await supabase
      .from("appointments")
      .update({
        ...appointmentData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
  }
}

// DELETE - Cancel/delete an appointment
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Option 1: Hard delete
    // const { error } = await supabase.from("appointments").delete().eq("id", params.id)

    // Option 2: Soft delete (mark as cancelled)
    const { error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 })
  }
}
