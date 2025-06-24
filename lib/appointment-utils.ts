import { supabase } from "@/lib/supabase-client"

// Definición de horas de la clínica
export const CLINIC_HOURS = {
  start: 9,
  end: 18,
}

// Horas que se excluyen de las franjas horarias disponibles (exportada para uso en otros archivos)
export const EXCLUDED_HOURS = [13] // Excluir la hora de almuerzo (13:00)

// Días laborables (1 = lunes, 2 = martes, etc.) - exportada para uso en otros archivos
export const WORKING_DAYS = [1, 2, 3, 4, 5] // Monday to Friday

// Lista completa de tratamientos, exactamente igual que en el módulo de odontograma
export const TREATMENT_TYPES = [
  { value: "x_exodoncia", label: "Exodoncia" },
  { value: "l_endodoncia", label: "Endodoncia" },
  { value: "caries", label: "Relleno de zona en rojo caries" },
  { value: "restauracion_azul", label: "Relleno de zona en azul restauración" },
  { value: "o_corona", label: "Corona" },
  { value: "tratamientos", label: "Tratamientos" },
  { value: "restauracion", label: "Restauración" },
  { value: "reconstruccion", label: "Reconstrucción" },
  { value: "carillas", label: "Carillas" },
  { value: "endodoncia_monorradicular", label: "Endodoncia monorradicular" },
  { value: "endodoncia_multirradicular", label: "Endodoncia multirradicular" },
  { value: "endodoncia_birradicular", label: "Endodoncia birradicular" },
  { value: "exodoncia_simple", label: "Exodoncia simple" },
  { value: "exodoncia_quirurgica", label: "Exodoncia quirúrgica" },
  { value: "exodoncia_3ros_molares", label: "Exodoncia 3ros molares" },
  { value: "protesis_total_superior", label: "Prótesis total superior" },
  { value: "protesis_total_inferior", label: "Prótesis total inferior" },
  { value: "protesis_parcial_acrilica_superior", label: "Prótesis parcial acrílica superior" },
  { value: "protesis_parcial_acrilica_inferior", label: "Prótesis parcial acrílica inferior" },
  { value: "protesis_parcial_flexible_superior", label: "Prótesis parcial flexible superior" },
  { value: "protesis_parcial_flexible_inferior", label: "Prótesis parcial flexible inferior" },
  { value: "protesis_metalica_superior", label: "Prótesis metálica superior" },
  { value: "protesis_metalica_inferior", label: "Prótesis metálica inferior" },
  { value: "corona_impresa_3d", label: "Corona impresa 3D" },
  { value: "corona_zirconio", label: "Corona zirconio" },
  { value: "incrustacion_indirecta", label: "Incrustación indirecta" },
  { value: "diseno_sonrisa", label: "Diseño de sonrisa" },
  { value: "blanqueamiento", label: "Blanqueamiento" },
  { value: "tartrectomia_profilaxis", label: "Tartrectomía y profilaxis" },
  { value: "frenilectomia", label: "Frenilectomía" },
  { value: "gigivectomia", label: "Gigivectomía" },
  { value: "ortodoncia", label: "Ortodoncia" },
  { value: "implante_dental", label: "Implante dental" },
  { value: "panoramica", label: "Panorámica" },
  { value: "rx_periapical", label: "Rx periapical" },
  { value: "escaneo_intraoral", label: "Escaneo intraoral" },
]

// Lista de doctores disponibles
export const DOCTORS = [
  { value: "dra-rodriguez", label: "Dra. Rodriguez" },
  { value: "dr-gonzalez", label: "Dr. Gonzalez" },
  { value: "dr-giovanty", label: "Dr. Giovanty" },
]

export async function getAvailableTimeSlots(date: string) {
  try {
    // Parsear la fecha correctamente para evitar problemas de zona horaria
    const dateParts = date.split("-").map((part) => Number.parseInt(part, 10))
    // Crear la fecha sin ajustes de zona horaria
    const selectedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])

    // Obtener el día de la semana (0 = domingo, 1 = lunes, etc.)
    const dayOfWeek = selectedDate.getDay()

    console.log("Selected date:", date)
    console.log("Date parts:", dateParts)
    console.log("Parsed date:", selectedDate.toString())
    console.log("Day of week:", dayOfWeek)
    console.log("Is working day:", WORKING_DAYS.includes(dayOfWeek))

    // Verificar si el día está en la lista de días laborables
    if (!WORKING_DAYS.includes(dayOfWeek)) {
      console.log("Not a working day")
      return {
        available: false,
        message: "La clínica está cerrada este día",
        slots: [],
      }
    }

    // Generate all possible time slots for the day
    const allSlots: Array<{ start: string; end: string; available: boolean }> = []
    for (let hour = CLINIC_HOURS.start; hour < CLINIC_HOURS.end; hour++) {
      // Skip excluded hours
      if (!EXCLUDED_HOURS.includes(hour)) {
        allSlots.push({
          start: `${hour.toString().padStart(2, "0")}:00`,
          end: `${(hour + 1).toString().padStart(2, "0")}:00`,
          available: true,
        })
      }
    }

    console.log("Generated slots:", allSlots.length, "slots")

    // Fetch existing appointments for the selected date
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("start_time, end_time")
      .eq("appointment_date", date)
      .not("status", "eq", "cancelled")

    if (error) {
      console.error("Error fetching appointments:", error)
      throw new Error(error.message)
    }

    console.log("Existing appointments:", appointments)

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

    console.log("Final available slots:", allSlots)

    return {
      date,
      available: true,
      slots: allSlots,
    }
  } catch (error) {
    console.error("Error getting available time slots:", error)
    throw error
  }
}

