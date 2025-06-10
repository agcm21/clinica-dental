import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { presupuestoId, respuesta } = await request.json()

    if (!presupuestoId || !respuesta) {
      return NextResponse.json({ error: "Se requiere ID de presupuesto y respuesta" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("presupuestos")
      .update({ respuesta_cliente: respuesta })
      .eq("id", presupuestoId)
      .select()

    if (error) {
      console.error("Error al actualizar respuesta:", error)
      return NextResponse.json({ error: "Error al actualizar la respuesta" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
