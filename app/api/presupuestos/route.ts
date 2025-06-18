import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("API: Iniciando GET /api/presupuestos")
    const supabase = createClient()

    const { data: presupuestos, error } = await supabase
      .from("presupuestos")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching presupuestos:", error)
      return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
    }

    console.log(`API: Encontrados ${presupuestos.length} presupuestos`)
    return NextResponse.json(presupuestos)
  } catch (error) {
    console.error("Error in presupuestos API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { data: presupuesto, error } = await supabase
      .from("presupuestos")
      .insert([body])
      .select("*")
      .single()

    if (error) {
      console.error("Error creating presupuesto:", error)
      return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
    }

    return NextResponse.json(presupuesto, { status: 201 })
  } catch (error) {
    console.error("Error in presupuestos POST API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

