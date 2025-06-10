import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    // Obtener el total de pacientes
    const { count: totalPatients, error: countError } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error contando pacientes:", countError)
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    // Obtener pacientes del año actual
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1).toISOString()

    const { count: currentYearPatients, error: yearError } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfYear)

    if (yearError) {
      console.error("Error contando pacientes del año actual:", yearError)
      return NextResponse.json({ error: yearError.message }, { status: 500 })
    }

    // Obtener pacientes de los últimos 3 meses con desglose por mes
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    const today = new Date()
    const monthlyBreakdown = {}
    let last3MonthsPatients = 0

    // Procesar los últimos 3 meses
    for (let i = 0; i < 3; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0)

      const monthName = monthNames[month.getMonth()]
      const startDate = month.toISOString()
      const endDate = monthEnd.toISOString()

      console.log(`Consultando pacientes para ${monthName}: ${startDate} a ${endDate}`)

      const { count: monthCount, error: monthError } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate)
        .lte("created_at", endDate)

      if (monthError) {
        console.error(`Error contando pacientes de ${monthName}:`, monthError)
        monthlyBreakdown[monthName] = 0
      } else {
        console.log(`Pacientes en ${monthName}: ${monthCount}`)
        monthlyBreakdown[monthName] = monthCount || 0
        last3MonthsPatients += monthCount || 0
      }
    }

    // Calcular el porcentaje de crecimiento (últimos 3 meses vs total)
    const percentageGrowth = totalPatients > 0 ? Math.round((last3MonthsPatients / totalPatients) * 100) : 0

    const responseData = {
      totalPatients: totalPatients || 0,
      currentYearPatients: currentYearPatients || 0,
      last3MonthsPatients: last3MonthsPatients || 0,
      monthlyBreakdown,
      percentageGrowth: `+${percentageGrowth}%`,
    }

    console.log("Datos de respuesta:", responseData)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error inesperado en stats de pacientes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

