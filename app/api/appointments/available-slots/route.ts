// Ubicación: app/api/appointments/available-slots/route.ts
// Reemplazar todo el archivo con esta versión mejorada

import { NextResponse } from "next/server"
import { EXCLUDED_HOURS, WORKING_DAYS } from "@/lib/appointment-utils"
import { supabase } from "@/lib/supabase-client"
import { parseISO, getDay, format } from "date-fns"

// Define clinic hours
const CLINIC_HOURS = {
  start: 8, // 8 AM
  end: 18, // 6 PM
  slotDuration: 60, // 60 minutes per appointment
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    // Usar parseISO para convertir el string a Date de manera consistente
    const selectedDate = parseISO(date)
    
    // Obtener el día de la semana usando date-fns (0 = domingo, 1 = lunes, etc.)
    const dayOfWeek = getDay(selectedDate)
    
    console.log("=== API: DIAGNÓSTICO DE FECHA ===")
    console.log(`Fecha seleccionada (string): ${date}`)
    console.log(`Fecha parseada: ${format(selectedDate, "yyyy-MM-dd")}`)
    console.log(`Día de la semana: ${dayOfWeek} (1=Lunes, 2=Martes, etc.)`)
    console.log(`¿Es día laborable?: ${WORKING_DAYS.includes(dayOfWeek) ? "SÍ" : "NO"}`)
    console.log("===========================")

    if (!WORKING_DAYS.includes(dayOfWeek)) {
      console.log(`API: No es un día laborable: ${dayOfWeek}`)
      return NextResponse.json({
        available: false,
        message: "La clínica está cerrada este día",
        slots: [],
      })
    }

    // Generate all possible time slots for the day
    const allSlots = []
    for (let hour = CLINIC_HOURS.start; hour < CLINIC_HOURS.end; hour++) {
      // Solo agregar si no está en la lista de horas excluidas
      if (!EXCLUDED_HOURS.includes(hour)) {
        allSlots.push({
          start: `${hour.toString().padStart(2, "0")}:00`,
          end: `${(hour + 1).toString().padStart(2, "0")}:00`,
          available: true,
        })
      }
    }

    console.log(`API: Generados ${allSlots.length} slots para la fecha ${date}`)

    // Fetch existing appointments for the selected date
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("start_time, end_time")
      .eq("appointment_date", date)
      .not("status", "eq", "cancelled")

    if (error) {
      console.error("API: Error fetching appointments:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`API: Encontradas ${appointments.length} citas existentes para la fecha ${date}`)

    // Mark booked slots as unavailable
    appointments.forEach((appointment) => {
      const startHour = Number.parseInt(appointment.start_time.split(":")[0])
      const endHour = Number.parseInt(appointment.end_time.split(":")[0])

      allSlots.forEach((slot) => {
        const slotStartHour = Number.parseInt(slot.start.split(":")[0])
        if (slotStartHour >= startHour && slotStartHour < endHour) {
          slot.available = false
        }
      })
    })

    console.log(`API: Slots disponibles finales: ${allSlots.filter(slot => slot.available).length}`)

    return NextResponse.json({
      date,
      available: true,
      slots: allSlots,
    })
  } catch (error) {
    console.error("API: Error in available-slots route:", error)
    return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 })
  }
}
