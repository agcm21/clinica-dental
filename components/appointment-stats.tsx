"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "lucide-react"

interface AppointmentStats {
  today: number
  thisWeek: number
  restOfMonth: number
  nextMonth: number
}

export function AppointmentStats() {
  const [stats, setStats] = useState<AppointmentStats>({
    today: 0,
    thisWeek: 0,
    restOfMonth: 0,
    nextMonth: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAppointmentStats = async () => {
      try {
        setIsLoading(true)

        // Get current date references
        const today = new Date()
        const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }) // Start on Monday
        const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 })
        const currentMonthStart = startOfMonth(today)
        const currentMonthEnd = endOfMonth(today)
        const nextMonthStart = startOfMonth(addMonths(today, 1))
        const nextMonthEnd = endOfMonth(addMonths(today, 1))

        // Format dates for Supabase query
        const todayFormatted = format(today, "yyyy-MM-dd")

        // Fetch all appointments for the next two months
        const { data: appointments, error } = await supabase
          .from("appointments")
          .select("*")
          .gte("appointment_date", todayFormatted)
          .lte("appointment_date", format(nextMonthEnd, "yyyy-MM-dd"))
          .not("status", "eq", "cancelled")

        if (error) {
          throw new Error(`Error fetching appointment stats: ${error.message}`)
        }

        if (appointments) {
          // Count appointments by period
          const todayCount = appointments.filter((apt) => apt.appointment_date === todayFormatted).length

          const thisWeekCount = appointments.filter((apt) => {
            const aptDate = new Date(apt.appointment_date)
            return isWithinInterval(aptDate, { start: currentWeekStart, end: currentWeekEnd })
          }).length

          const thisMonthCount = appointments.filter((apt) => {
            const aptDate = new Date(apt.appointment_date)
            return isWithinInterval(aptDate, { start: currentMonthStart, end: currentMonthEnd })
          }).length

          const nextMonthCount = appointments.filter((apt) => {
            const aptDate = new Date(apt.appointment_date)
            return isWithinInterval(aptDate, { start: nextMonthStart, end: nextMonthEnd })
          }).length

          // Calculate rest of month (excluding this week)
          const restOfMonthCount = thisMonthCount - thisWeekCount

          setStats({
            today: todayCount,
            thisWeek: thisWeekCount,
            restOfMonth: restOfMonthCount > 0 ? restOfMonthCount : 0,
            nextMonth: nextMonthCount,
          })
        }
      } catch (error) {
        console.error("Error fetching appointment stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointmentStats()

    // Refresh stats every 5 minutes
    const intervalId = setInterval(fetchAppointmentStats, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  const currentMonth = format(new Date(), "MMMM", { locale: es })
  const nextMonth = format(addMonths(new Date(), 1), "MMMM", { locale: es })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Citas Hoy
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-3xl font-bold">{stats.today}</span>
            </div>
            <div className="space-y-2 border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Esta semana:</span>
                <span className="font-medium">{stats.thisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Resto {currentMonth} (total):</span>
                <span className="font-medium">{stats.restOfMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mes siguiente:</span>
                <span className="font-medium">{stats.nextMonth}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
