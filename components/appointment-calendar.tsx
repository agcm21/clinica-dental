"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfWeek, isToday, addWeeks, subWeeks } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { EXCLUDED_HOURS } from "@/lib/appointment-utils"

interface TimeSlot {
  start: string
  end: string
  available: boolean
}

interface AvailabilityResponse {
  date: string
  available: boolean
  message?: string
  slots: TimeSlot[]
}

interface AppointmentCalendarProps {
  onSelectSlot: (date: string, startTime: string, endTime: string) => void
  selectedDate?: string
  selectedTime?: string
}

export function AppointmentCalendar({
  onSelectSlot,
  selectedDate: propSelectedDate,
  selectedTime: propSelectedTime,
}: AppointmentCalendarProps) {
  // Iniciar con el lunes de la semana actual o futura
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    // Asegurarse de que la semana comience en el lunes actual o futuro
    const mondayOfWeek = startOfWeek(today, { weekStartsOn: 1 })

    // Si hoy es después del viernes, mostrar la próxima semana
    const dayOfWeek = today.getDay() // 0 = domingo, 1 = lunes, ..., 6 = sábado
    if (dayOfWeek === 0 || dayOfWeek > 5) {
      // Si es domingo o sábado
      return addWeeks(mondayOfWeek, 1) // Mostrar la próxima semana
    }

    return mondayOfWeek
  })

  const [selectedDay, setSelectedDay] = useState<string>(propSelectedDate || format(new Date(), "yyyy-MM-dd"))
  const [selectedTime, setSelectedTime] = useState<string | null>(propSelectedTime || null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState<boolean>(false)

  // Función para determinar si un horario debe estar disponible basado en la hora actual
  const isTimeSlotAvailable = (date: string, startTime: string): boolean => {
    // Si no es el día actual, todos los horarios están disponibles
    const today = new Date()
    const slotDate = new Date(`${date}T00:00:00`)

    if (
      slotDate.getDate() !== today.getDate() ||
      slotDate.getMonth() !== today.getMonth() ||
      slotDate.getFullYear() !== today.getFullYear()
    ) {
      return true
    }

    // Para el día actual, verificar la hora
    const currentHour = today.getHours()
    const currentMinute = today.getMinutes()
    const [slotHour, slotMinute] = startTime.split(":").map(Number)

    // Calcular la diferencia en minutos
    const currentTotalMinutes = currentHour * 60 + currentMinute
    const slotTotalMinutes = slotHour * 60 + Number(slotMinute || 0)
    const diffMinutes = slotTotalMinutes - currentTotalMinutes

    // Verificar si hay al menos 60 minutos (1 hora) de diferencia
    return diffMinutes >= 60
  }

  // Generate days for the current work week (Monday to Friday)
  const generateWorkWeek = () => {
    const days = []

    // Generate 5 working days (Monday to Friday) starting from currentWeekStart
    for (let i = 0; i < 5; i++) {
      const day = addDays(currentWeekStart, i)
      days.push({
        date: day,
        dayName: format(day, "EEE", { locale: es }),
        dayNumber: format(day, "d"),
        dateString: format(day, "yyyy-MM-dd"),
      })
    }

    return days
  }

  const weekDays = generateWorkWeek()

  // Determinar el mes que se muestra (basado en el día medio de la semana)
  const displayMonth = format(addDays(currentWeekStart, 2), "MMMM yyyy", { locale: es })

  // Fetch available slots when selectedDay changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDay) return

      setIsLoading(true)
      setError(null)
      try {
        console.log("Fetching slots for date:", selectedDay)

        // Verificar el día de la semana de la fecha seleccionada
        const selectedDateObj = new Date(selectedDay + "T12:00:00") // Usar mediodía para evitar problemas de zona horaria
        console.log("Día de la semana (0=domingo, 1=lunes):", selectedDateObj.getDay())

        const response = await fetch(`/api/appointments/available-slots?date=${selectedDay}`)

        if (!response.ok) {
          throw new Error("Error fetching available slots")
        }

        const data: AvailabilityResponse = await response.json()
        console.log("Received data:", data)

        // Filtrar las franjas horarias excluidas localmente también
        let slots = data.slots || []
        slots = slots.filter((slot) => {
          const hour = Number.parseInt(slot.start.split(":")[0])
          return !EXCLUDED_HOURS.includes(hour)
        })

        setAvailableSlots(slots)
      } catch (error) {
        console.error("Error fetching available slots:", error)
        setError("No se pudieron cargar los horarios disponibles")
        toast({
          title: "Error",
          description: "No se pudieron cargar los horarios disponibles",
          variant: "destructive",
        })
        setAvailableSlots([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailableSlots()
  }, [selectedDay])

  // Navegar a la semana anterior
  const handlePreviousWeek = () => {
    setCurrentWeekStart((prevWeekStart) => subWeeks(prevWeekStart, 1))
  }

  // Navegar a la semana siguiente
  const handleNextWeek = () => {
    setCurrentWeekStart((prevWeekStart) => addWeeks(prevWeekStart, 1))
  }

  // Ir a la semana actual
  const handleToday = () => {
    const today = new Date()
    const mondayOfWeek = startOfWeek(today, { weekStartsOn: 1 })

    // Si hoy es después del viernes, mostrar la próxima semana
    const dayOfWeek = today.getDay() // 0 = domingo, 1 = lunes, ..., 6 = sábado
    if (dayOfWeek === 0 || dayOfWeek > 5) {
      // Si es domingo o sábado
      setCurrentWeekStart(addWeeks(mondayOfWeek, 1)) // Mostrar la próxima semana
    } else {
      setCurrentWeekStart(mondayOfWeek)
    }

    setSelectedDay(format(today, "yyyy-MM-dd"))
  }

  const handleDaySelect = (dateString: string) => {
    console.log("Day selected:", dateString)

    // Verificar el día de la semana
    const selectedDateObj = new Date(dateString + "T12:00:00") // Usar mediodía para evitar problemas de zona horaria
    const dayOfWeek = selectedDateObj.getDay()
    console.log("Día de la semana (0=domingo, 1=lunes):", dayOfWeek)

    setSelectedDay(dateString)
    setSelectedTime(null)

    // Limpiar la selección de hora
    onSelectSlot(dateString, "", "")
  }

  const handleTimeSelect = (start: string, end: string) => {
    setSelectedTime(start)
    onSelectSlot(selectedDay, start, end)
  }

  // Separar los slots en mañana y tarde
  const morningSlots = availableSlots.filter((slot) => {
    const hour = Number.parseInt(slot.start.split(":")[0])
    return hour < 12
  })

  const afternoonSlots = availableSlots.filter((slot) => {
    const hour = Number.parseInt(slot.start.split(":")[0])
    return hour >= 14
  })

  // Verificar si hay horarios no disponibles por la restricción de 1 hora
  const hasMorningUnavailableSlots =
    isToday(new Date(selectedDay)) && morningSlots.some((slot) => !isTimeSlotAvailable(selectedDay, slot.start))
  const hasAfternoonUnavailableSlots =
    isToday(new Date(selectedDay)) && afternoonSlots.some((slot) => !isTimeSlotAvailable(selectedDay, slot.start))
  const hasUnavailableSlots = hasMorningUnavailableSlots || hasAfternoonUnavailableSlots

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold capitalize">{displayMonth}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek} title="Semana anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek} title="Semana siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {weekDays.map((day) => {
          const isSelected = selectedDay === day.dateString
          return (
            <Button
              key={day.dateString}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "flex flex-col h-auto py-2",
                isToday(day.date) && !isSelected && "border-primary text-primary",
              )}
              onClick={() => handleDaySelect(day.dateString)}
            >
              <span className="text-xs font-medium capitalize">{day.dayName}</span>
              <span className="text-2xl">{day.dayNumber}</span>
            </Button>
          )
        })}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Seleccionar una hora:</h3>

          {/* Ícono de advertencia con tooltip simple */}
          {hasUnavailableSlots && (
            <div className="relative">
              <div
                className="flex items-center text-amber-500 cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              {showTooltip && (
                <div className="absolute right-0 z-10 w-64 p-2 mt-2 text-sm bg-white border rounded shadow-lg">
                  Algunos horarios no están disponibles. Estos deben reservarse con al menos 1 hora de anticipación.
                </div>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="ml-2">Cargando horarios...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay horarios disponibles para esta fecha</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Columna de mañana */}
            <div className="flex flex-col">
              <div className="bg-blue-600 text-white py-2 px-4 text-center font-medium mb-2">Mañana</div>
              <div className="space-y-2">
                {morningSlots.map((slot, index) => {
                  const isSlotAvailable = slot.available && isTimeSlotAvailable(selectedDay, slot.start)
                  return (
                    <Button
                      key={`morning-${index}`}
                      variant={selectedTime === slot.start ? "default" : "outline"}
                      className={cn("w-full justify-start", !isSlotAvailable && "opacity-50 cursor-not-allowed")}
                      disabled={!isSlotAvailable}
                      onClick={() => handleTimeSelect(slot.start, slot.end)}
                      title={
                        !isSlotAvailable && !slot.available
                          ? "Horario no disponible"
                          : !isSlotAvailable
                            ? "Debe reservarse con al menos 1 hora de anticipación"
                            : `Reservar de ${slot.start} a ${slot.end}`
                      }
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        {slot.start} - {slot.end}
                      </span>
                    </Button>
                  )
                })}
                {morningSlots.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No hay horarios disponibles en la mañana</div>
                )}
              </div>
            </div>

            {/* Columna de tarde */}
            <div className="flex flex-col">
              <div className="bg-blue-600 text-white py-2 px-4 text-center font-medium mb-2">Tarde</div>
              <div className="space-y-2">
                {afternoonSlots.map((slot, index) => {
                  const isSlotAvailable = slot.available && isTimeSlotAvailable(selectedDay, slot.start)
                  return (
                    <Button
                      key={`afternoon-${index}`}
                      variant={selectedTime === slot.start ? "default" : "outline"}
                      className={cn("w-full justify-start", !isSlotAvailable && "opacity-50 cursor-not-allowed")}
                      disabled={!isSlotAvailable}
                      onClick={() => handleTimeSelect(slot.start, slot.end)}
                      title={
                        !isSlotAvailable && !slot.available
                          ? "Horario no disponible"
                          : !isSlotAvailable
                            ? "Debe reservarse con al menos 1 hora de anticipación"
                            : `Reservar de ${slot.start} a ${slot.end}`
                      }
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        {slot.start} - {slot.end}
                      </span>
                    </Button>
                  )
                })}
                {afternoonSlots.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No hay horarios disponibles en la tarde</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

