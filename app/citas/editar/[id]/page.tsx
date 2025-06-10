"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppointmentCalendar } from "@/components/appointment-calendar"
import { toast } from "@/components/ui/use-toast"
import { TREATMENT_TYPES, DOCTORS } from "@/lib/appointment-utils"

export default function EditAppointmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [appointment, setAppointment] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const [treatmentType, setTreatmentType] = useState<string>("")
  const [doctor, setDoctor] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [status, setStatus] = useState<string>("")

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`/api/appointments/${params.id}`)

        if (!response.ok) {
          throw new Error("Error al cargar la cita")
        }

        const data = await response.json()
        setAppointment(data)

        // Set form values
        setSelectedDate(data.appointment_date)
        setSelectedTime(data.start_time)
        setEndTime(data.end_time)
        setTreatmentType(data.treatment_type)
        setDoctor(data.doctor || "")
        setNotes(data.notes || "")
        setStatus(data.status)
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la cita",
          variant: "destructive",
        })
        router.push("/citas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointment()
  }, [params.id, router])

  // Handle time slot selection
  const handleTimeSlotSelect = (date: string, startTime: string, endTime: string) => {
    setSelectedDate(date)
    setSelectedTime(startTime)
    setEndTime(endTime)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validate required fields
      if (!selectedDate || !selectedTime || !treatmentType) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos obligatorios",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      // Mostrar mensaje de guardando
      toast({
        title: "Guardando",
        description: "Actualizando la cita, por favor espere...",
      })

      // Update appointment
      const appointmentData = {
        appointment_date: selectedDate,
        start_time: selectedTime,
        end_time: endTime,
        treatment_type: treatmentType,
        doctor: doctor,
        notes: notes,
        status: status,
      }

      const response = await fetch(`/api/appointments/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar la cita")
      }

      // Mostrar mensaje de éxito
      toast({
        title: "Éxito",
        description: "Cita actualizada correctamente",
      })

      // Asegurar que la redirección funcione correctamente
      setTimeout(() => {
        router.push("/citas")
        router.refresh() // Forzar actualización de la página
      }, 1000)
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la cita",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
          <Link href="/citas" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a Citas</span>
          </Link>
          <h1 className="text-xl font-semibold ml-4">Editar Cita</h1>
        </header>

        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="mt-3">Cargando información de la cita...</span>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
        <Link href="/citas" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a Citas</span>
        </Link>
        <h1 className="text-xl font-semibold ml-4">Editar Cita</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                {appointment?.patients ? (
                  <div className="p-4 border rounded-md bg-muted/50">
                    <h3 className="font-medium">Paciente</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>Nombre: {`${appointment.patients.first_name} ${appointment.patients.last_name}`}</p>
                      <p>Cédula: {appointment.patients.cedula}</p>
                      <p>Teléfono: {appointment.patients.phone}</p>
                      {appointment.patients.email && <p>Email: {appointment.patients.email}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No se encontró información del paciente</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Cita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="treatment_type">Tipo de Tratamiento</Label>
                      <Select value={treatmentType} onValueChange={setTreatmentType} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tratamiento" />
                        </SelectTrigger>
                        <SelectContent>
                          {TREATMENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="doctor">Doctor</Label>
                      <Select value={doctor} onValueChange={setDoctor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCTORS.map((doc) => (
                            <SelectItem key={doc.value} value={doc.value}>
                              {doc.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Estado</Label>
                      <Select value={status} onValueChange={setStatus} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Programada</SelectItem>
                          <SelectItem value="confirmed">Confirmada</SelectItem>
                          <SelectItem value="completed">Completada</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                          <SelectItem value="no_show">No Asistió</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notas</Label>
                      <Textarea
                        id="notes"
                        placeholder="Detalles adicionales sobre la cita..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="p-4 border rounded-md bg-muted/50">
                      <h3 className="font-medium">Detalles Seleccionados</h3>
                      <div className="mt-2 space-y-1 text-sm">
                        {selectedDate && (
                          <p>
                            Fecha:{" "}
                            {new Date(selectedDate).toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        )}
                        {selectedTime && (
                          <p>
                            Hora: {selectedTime} - {endTime}
                          </p>
                        )}
                        {treatmentType && (
                          <p>
                            Tratamiento:{" "}
                            {TREATMENT_TYPES.find((t) => t.value === treatmentType)?.label || treatmentType}
                          </p>
                        )}
                        {doctor && <p>Doctor: {doctor}</p>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <AppointmentCalendar
                      onSelectSlot={handleTimeSlotSelect}
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.push("/citas")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    Guardando...
                  </>
                ) : (
                  "Actualizar Cita"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
