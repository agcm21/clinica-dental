"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, Calendar, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase-client"
import { formatDateForDisplay } from "@/lib/date-utils"

interface Appointment {
  id: string
  title: string
  appointment_date: string
  start_time: string
  end_time: string
  treatment_type: string
  doctor: string
  notes: string
  status: string
  patient_id: string
  patients?: {
    id: string
    first_name: string
    last_name: string
    cedula: string
    phone: string
    email: string
  }
}

export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true)

        // Get today's date
        const today = new Date()
        const todayFormatted = format(today, "yyyy-MM-dd")

        // Fetch upcoming appointments
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
          .gte("appointment_date", todayFormatted)
          .not("status", "eq", "cancelled")
          .order("appointment_date", { ascending: true })
          .order("start_time", { ascending: true })
          .limit(3)

        if (error) {
          throw new Error(`Error al cargar citas: ${error.message}`)
        }

        setAppointments(data || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()

    // Refresh every 5 minutes
    const intervalId = setInterval(fetchAppointments, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  // Format time
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? "PM" : "AM"}`
  }

  // Format date for display - using the corrected date formatter
  const formatAppointmentDate = (dateString: string) => {
    // Use the same formatter that works correctly in the appointments page
    const date = parseISO(dateString)
    return {
      day: format(date, "dd", { locale: es }),
      month: format(date, "MMM", { locale: es }),
      fullDate: formatDateForDisplay(dateString),
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <span className="ml-2">Cargando citas...</span>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p>No hay citas próximas programadas</p>
        <Button className="mt-4" asChild>
          <Link href="/citas/nueva">Programar Nueva Cita</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const formattedDate = formatAppointmentDate(appointment.appointment_date)

        return (
          <div key={appointment.id} className="flex items-start p-4 border rounded-lg hover:bg-muted/30">
            <div className="flex-shrink-0 mr-4">
              <div className="flex flex-col items-center justify-center bg-primary/10 p-3 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium mt-1">{formattedDate.day}</span>
                <span className="text-xs">{formattedDate.month}</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm font-medium">{formatTime(appointment.start_time)}</span>
              </div>

              <h4 className="font-medium">{appointment.treatment_type}</h4>

              <div className="flex items-center mt-1">
                <User className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-sm">
                  {appointment.patients
                    ? `${appointment.patients.first_name} ${appointment.patients.last_name}`
                    : "Paciente no encontrado"}
                </span>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="flex-shrink-0" asChild>
              <Link href={`/citas/editar/${appointment.id}`}>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )
      })}

      <div className="text-center pt-2">
        <Button variant="outline" asChild>
          <Link href="/citas" className="flex items-center">
            Ver Todas las Citas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
