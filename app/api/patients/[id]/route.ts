import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET - Obtener un paciente por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const { data, error } = await supabase.from("patients").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener paciente" }, { status: 500 })
  }
}

// PUT - Actualizar un paciente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const patientData = await request.json()

    const { data, error } = await supabase.from("patients").update(patientData).eq("id", id).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar paciente" }, { status: 500 })
  }
}

// DELETE - Eliminar un paciente
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // First, check if the patient exists
    const { data: patient, error: patientError } = await supabase.from("patients").select("id").eq("id", id).single()

    if (patientError || !patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    }

    // Delete the patient
    const { error } = await supabase.from("patients").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Paciente eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar paciente:", error)
    return NextResponse.json({ error: "Error al eliminar paciente" }, { status: 500 })
  }
}
