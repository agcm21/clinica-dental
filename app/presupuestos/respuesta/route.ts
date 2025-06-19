import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { presupuesto_id, respuestas } = await request.json()

    if (!presupuesto_id || !respuestas) {
      return NextResponse.json({ message: "Missing presupuesto_id or respuestas" }, { status: 400 })
    }

    // Validate respuestas (optional, but recommended)
    if (!Array.isArray(respuestas)) {
      return NextResponse.json({ message: "Respuestas must be an array" }, { status: 400 })
    }

    // Insert each respuesta into the database
    for (const respuesta of respuestas) {
      const { pregunta_id, valor } = respuesta

      if (!pregunta_id || valor === undefined) {
        return NextResponse.json({ message: "Missing pregunta_id or valor in respuesta" }, { status: 400 })
      }

      const { data, error } = await supabase
        .from("respuestas_presupuestos")
        .insert([{ presupuesto_id, pregunta_id, valor }])

      if (error) {
        console.error("Error inserting respuesta:", error)
        return NextResponse.json({ message: "Failed to insert respuesta", error: (error instanceof Error ? error.message : "Error desconocido") }, { status: 500 })
      }
    }

    return NextResponse.json({ message: "Respuestas submitted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ message: "Internal server error", error: (error as any).message }, { status: 500 })
  }
}

