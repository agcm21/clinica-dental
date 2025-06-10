import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET - Obtener un presupuesto por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const { data, error } = await supabase.from("presupuestos").select("*").eq("id", id).single()

    if (error) {
      console.error("Error al obtener presupuesto:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error al obtener presupuesto" }, { status: 500 })
  }
}

// PUT - Actualizar un presupuesto
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const presupuestoData = await request.json()

    console.log("Actualizando presupuesto:", id, "con datos:", presupuestoData)

    // Verificar si el presupuesto existe
    const { data: existingPresupuesto, error: checkError } = await supabase
      .from("presupuestos")
      .select("id")
      .eq("id", id)
      .single()

    if (checkError || !existingPresupuesto) {
      console.error("Presupuesto no encontrado:", id)
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 })
    }

    // Actualizar el presupuesto
    const { data, error } = await supabase.from("presupuestos").update(presupuestoData).eq("id", id).select()

    if (error) {
      console.error("Error al actualizar presupuesto:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No se pudo actualizar el presupuesto" }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error al actualizar presupuesto" }, { status: 500 })
  }
}

// DELETE - Eliminar un presupuesto
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // First, check if the presupuesto exists
    const { data: presupuesto, error: presupuestoError } = await supabase
      .from("presupuestos")
      .select("id")
      .eq("id", id)
      .single()

    if (presupuestoError || !presupuesto) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 })
    }

    // Delete the presupuesto
    const { error } = await supabase.from("presupuestos").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar presupuesto:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Presupuesto eliminado correctamente" })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error al eliminar presupuesto" }, { status: 500 })
  }
}
