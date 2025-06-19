import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Verificar si la tabla presupuestos existe usando una consulta directa
    const { data, error } = await supabase.from("presupuestos").select("id").limit(1)

    if (error) {
      console.error("Error al verificar tabla presupuestos:", error)
      return NextResponse.json({ success: false, error: (error instanceof Error ? error.message : "Error desconocido") }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error general al verificar tabla:", error)
    return NextResponse.json({ success: false, error: "Error al verificar tabla de presupuestos" }, { status: 500 })
  }
}

