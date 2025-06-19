"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  MoreHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabase-client"
import { format, addDays, subDays, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns"
import { es } from "date-fns/locale"
import { formatDateForDisplay, debugDate } from "@/lib/date-utils"

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

export default function AppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("today")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Forzar el mes actual (mayo 2025)
  const currentMonth = format(new Date(), "yyyy-MM")
  const [currentViewMonth, setCurrentViewMonth] = useState(currentMonth)

  // Asegurar que el mes actual se establezca correctamente al cargar el componente
  useEffect(() => {
    if (dateFilter === "month") {
      setCurrentViewMonth(currentMonth)
    }
  }, [dateFilter])

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching appointments with filter:", dateFilter)
        console.log("Current view month:", currentViewMonth)

        // Determine date range based on filter
        let startDate = format(currentDate, "yyyy-MM-dd")
        let endDate = startDate

        if (dateFilter === "week") {
          const weekEnd = addDays(currentDate, 6)
          endDate = format(weekEnd, "yyyy-MM-dd")
        } else if (dateFilter === "month") {
          // Use the current view month instead of current date for month filter
          const monthStart = startOfMonth(new Date(`${currentViewMonth}-01T00:00:00`))
          const monthEnd = endOfMonth(monthStart)
          startDate = format(monthStart, "yyyy-MM-dd")
          endDate = format(monthEnd, "yyyy-MM-dd")

          console.log(`Month filter: ${startDate} to ${endDate}`)
        } else if (dateFilter === "all") {
          // No date filtering
          startDate = ""
          endDate = ""
        }

        console.log(`Date range: ${startDate} to ${endDate}`)

        let query = supabase
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
          .order("appointment_date", { ascending: true })
          .order("start_time", { ascending: true })

        // Apply date filters if needed
        if (startDate && dateFilter !== "all") {
          query = query.gte("appointment_date", startDate)
        }
        if (endDate && dateFilter !== "all") {
          query = query.lte("appointment_date", endDate)
        }
        // Apply status filter if needed
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter)
        } else {
          query = query.not("status", "eq", "cancelled") // By default, don't show cancelled appointments
        }

        const { data, error } = await query

        if (error) {
          throw new Error(`Error al cargar citas: ${(error instanceof Error ? error.message : "Error desconocido")}`)
        }

        console.log("Appointments loaded:", data?.length || 0)

        // Debug the first appointment date if available
        if (data && data.length > 0) {
          debugDate("First appointment date", data[0].appointment_date)
        }

        setAppointments(data || [])
        applySearchFilter(data || [], searchTerm)
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las citas",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()

    // Config refresh interval
    const intervalId = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1)
    }, 30000) // Update every 30 seconds

    return () => clearInterval(intervalId)
  }, [dateFilter, statusFilter, refreshTrigger, currentDate, currentViewMonth])

  // Apply search filter
  const applySearchFilter = (data: Appointment[], term: string) => {
    if (!term.trim()) {
      setFilteredAppointments(data)
      return
    }

    const termLower = term.toLowerCase()
    const filtered = data.filter((appointment) => {
      const patientName = appointment.patients
        ? `${appointment.patients.first_name} ${appointment.patients.last_name}`.toLowerCase()
        : ""
      const patientCedula = appointment.patients?.cedula?.toLowerCase() || ""
      const treatmentType = appointment.treatment_type?.toLowerCase() || ""
      const doctor = appointment.doctor?.toLowerCase() || ""

      return (
        patientName.includes(termLower) ||
        patientCedula.includes(termLower) ||
        treatmentType.includes(termLower) ||
        doctor.includes(termLower)
      )
    })

    setFilteredAppointments(filtered)
  }

  // Navigation functions
  const goToPreviousDay = () => {
    if (dateFilter === "month") {
      // Solo para el filtro de mes: navegar al mes anterior
      try {
        const currentMonthDate = new Date(`${currentViewMonth}-01T00:00:00`)
        const prevMonth = subMonths(currentMonthDate, 1)
        const newMonth = format(prevMonth, "yyyy-MM")
        console.log("Navigating to previous month:", newMonth)
        setCurrentViewMonth(newMonth)
      } catch (error) {
        console.error("Error navigating to previous month:", error)
      }
    } else {
      // Mantener la funcionalidad existente para día y semana
      setCurrentDate((prev) => {
        const newDate = subDays(prev, dateFilter === "week" ? 7 : 1)
        return newDate
      })
    }
  }

  const goToNextDay = () => {
    if (dateFilter === "month") {
      // Solo para el filtro de mes: navegar al mes siguiente
      try {
        const currentMonthDate = new Date(`${currentViewMonth}-01T00:00:00`)
        const nextMonth = addMonths(currentMonthDate, 1)
        const newMonth = format(nextMonth, "yyyy-MM")
        console.log("Navigating to next month:", newMonth)
        setCurrentViewMonth(newMonth)
      } catch (error) {
        console.error("Error navigating to next month:", error)
      }
    } else {
      // Mantener la funcionalidad existente para día y semana
      setCurrentDate((prev) => {
        const newDate = addDays(prev, dateFilter === "week" ? 7 : 1)
        return newDate
      })
    }
  }

  const goToToday = () => {
    // Restablecer a la fecha actual para todos los filtros
    setCurrentDate(new Date())

    // Para el filtro de mes, asegurarse de que se muestre el mes actual
    setCurrentViewMonth(currentMonth)

    // Cambiar al filtro de "hoy"
    setDateFilter("today")
  }

  // Handle date filter change
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value)

    // Solo para el filtro de mes: restablecer al mes actual
    if (value === "month") {
      // Asegurarse de que siempre se establezca al mes actual (mayo)
      setCurrentViewMonth(currentMonth)
    }
  }

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
    toast({
      title: "Actualizando",
      description: "Recargando lista de citas...",
    })
  }

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    applySearchFilter(appointments, term)
  }

  // Format time
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? "PM" : "AM"}`
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-500">Programada</Badge>
      case "confirmed":
        return <Badge className="bg-green-500">Confirmada</Badge>
      case "completed":
        return <Badge className="bg-purple-500">Completada</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelada</Badge>
      case "no_show":
        return <Badge className="bg-yellow-500">No Asistió</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setIsUpdating((prev) => ({ ...prev, [id]: true }))

      const { error } = await supabase.from("appointments").update({ status: newStatus }).eq("id", id)

      if (error) {
        throw new Error(`Error al actualizar estado: ${(error instanceof Error ? error.message : "Error desconocido")}`)
      }

      // Update local state
      const updatedAppointments = appointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status: newStatus } : appointment,
      )

      setAppointments(updatedAppointments)
      applySearchFilter(updatedAppointments, searchTerm)

      toast({
        title: "Estado actualizado",
        description: "El estado de la cita ha sido actualizado",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cita",
        variant: "destructive",
      })
    } finally {
      setIsUpdating((prev) => ({ ...prev, [id]: false }))
    }
  }

  // Handle appointment deletion/cancellation
  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return

    try {
      // Option 1: Hard delete
      // const { error } = await supabase
      //  .from("appointments")
      //  .delete()
      //  .eq("id", appointmentToDelete.id)

      // Option 2: Soft delete (update status to cancelled)
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentToDelete.id)

      if (error) {
        throw new Error(`Error al cancelar la cita: ${(error instanceof Error ? error.message : "Error desconocido")}`)
      }

      // Update local state
      const updatedAppointments = appointments.filter(
        (appointment) =>
          appointment.id !== appointmentToDelete.id ||
          (statusFilter === "all" && { ...appointment, status: "cancelled" }),
      )

      setAppointments(updatedAppointments)
      applySearchFilter(updatedAppointments, searchTerm)

      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada exitosamente",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo cancelar la cita",
        variant: "destructive",
      })
    } finally {
      setAppointmentToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  // Group appointments by date
  const groupedAppointments = filteredAppointments.reduce(
    (groups, appointment) => {
      const date = appointment.appointment_date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(appointment)
      return groups
    },
    {} as Record<string, Appointment[]>,
  )

  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  // Get current date display
  const getCurrentDateDisplay = () => {
    // Usar la misma fecha que se usa para filtrar las citas
    const displayDate = currentDate

    if (dateFilter === "today") {
      return `Estás revisando el: ${format(displayDate, "d 'de' MMMM 'de' yyyy", { locale: es })}`
    } else if (dateFilter === "week") {
      const endDate = addDays(displayDate, 6)
      return `Estás revisando: ${format(displayDate, "d 'de' MMMM", { locale: es })} - ${format(endDate, "d 'de' MMMM 'de' yyyy", { locale: es })}`
    } else if (dateFilter === "month") {
      try {
        const monthDate = new Date(`${currentViewMonth}-01T00:00:00`)
        return `Estás revisando: ${format(monthDate, "MMMM 'de' yyyy", { locale: es })}`
      } catch (error) {
        console.error("Error formatting month date:", error)
        return `Estás revisando: ${currentViewMonth}`
      }
    } else {
      return "Todas las citas"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/panel-principal" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al Panel</span>
            </Link>
            <h1 className="text-lg font-semibold">Gestión de Citas</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} className="mr-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
            <Link href="/citas/nueva">
              <Button className="bg-[#0051FF] text-white hover:bg-[#0051FF]/90">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Cita
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar citas..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="all">Todas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="scheduled">Programadas</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                  <SelectItem value="no_show">No Asistió</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Hoy
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="font-medium">{getCurrentDateDisplay()}</div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-3">Cargando citas...</span>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No hay citas</h3>
                <p className="text-muted-foreground mt-1">No se encontraron citas con los filtros actuales</p>
                <Button className="mt-4" onClick={() => router.push("/citas/nueva")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Nueva Cita
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <Card key={date}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg capitalize">
                      {/* Use our custom date formatter to fix the date display issue */}
                      {formatDateForDisplay(date)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {groupedAppointments[date].map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/30"
                        >
                          <div className="flex items-center gap-3 md:w-1/4">
                            <div className="flex flex-col items-center justify-center bg-primary/10 p-2 rounded-lg">
                              <Clock className="h-5 w-5 text-primary" />
                              <span className="text-sm font-medium mt-1">{formatTime(appointment.start_time)}</span>
                            </div>
                            <div>
                              <h4 className="font-medium">{appointment.treatment_type}</h4>
                              {appointment.doctor && (
                                <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col md:w-1/3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {appointment.patients
                                  ? `${appointment.patients.first_name} ${appointment.patients.last_name}`
                                  : "Paciente no encontrado"}
                              </span>
                            </div>
                            {appointment.patients && (
                              <>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-muted-foreground">
                                    CI: {appointment.patients.cedula}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{appointment.patients.phone}</span>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex flex-col md:w-1/4">
                            {appointment.notes && (
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span className="text-sm">{appointment.notes}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between md:w-1/6 md:justify-end gap-2">
                            <Select
                              value={appointment.status || "scheduled"}
                              onValueChange={(value) => handleStatusChange(appointment.id, value)}
                              disabled={isUpdating[appointment.id]}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue>{getStatusBadge(appointment.status || "scheduled")}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="scheduled">
                                  <div className="flex items-center">
                                    <Badge className="bg-blue-500 mr-2">Programada</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="confirmed">
                                  <div className="flex items-center">
                                    <Badge className="bg-green-500 mr-2">Confirmada</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="completed">
                                  <div className="flex items-center">
                                    <Badge className="bg-purple-500 mr-2">Completada</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  <div className="flex items-center">
                                    <Badge className="bg-red-500 mr-2">Cancelada</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value="no_show">
                                  <div className="flex items-center">
                                    <Badge className="bg-yellow-500 mr-2">No Asistió</Badge>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/citas/editar/${appointment.id}`)}>
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setAppointmentToDelete(appointment)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                >
                                  Cancelar Cita
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de cancelar esta cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la cita como cancelada. El horario quedará disponible para otras citas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener cita</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAppointment} className="bg-red-500 hover:bg-red-600">
              Sí, cancelar cita
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


