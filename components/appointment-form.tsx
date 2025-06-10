"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppointmentCalendar } from "@/components/appointment-calendar"
import { toast } from "@/components/ui/use-toast"
import { TREATMENT_TYPES, DOCTORS } from "@/lib/appointment-utils"
import { supabase } from "@/lib/supabase-client"
import { formatDateForDatabase, formatDateForDisplay, debugDate } from "@/lib/date-utils"

interface Patient {
  id: string
  first_name: string
  last_name: string
  cedula: string
  phone: string
  email: string
}

export function AppointmentForm() {
  // Usar useRef para rastrear si el formulario ya se ha enviado
  const formSubmittedRef = useRef(false)

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [endTime, setEndTime] = useState<string>("")
  const [treatmentType, setTreatmentType] = useState<string>("")
  const [doctor, setDoctor] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isNewPatient, setIsNewPatient] = useState(false)
  const [newPatientData, setNewPatientData] = useState({
    first_name: "",
    last_name: "",
    cedula: "",
    phone: "",
    email: "",
  })
  const [showPatientSelector, setShowPatientSelector] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from("patients")
          .select("id, first_name, last_name, cedula, phone, email")
          .order("first_name", { ascending: true })

        if (error) {
          throw error
        }

        setPatients(data || [])
      } catch (error) {
        console.error("Error fetching patients:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los pacientes",
          variant: "destructive",
        })
      } finally {
        setIsLoadingPatients(false)
      }
    }

    fetchPatients()
  }, [])

  // Filter patients based on search term
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
    const cedula = patient.cedula?.toLowerCase() || ""
    const searchLower = searchTerm.toLowerCase()

    return fullName.includes(searchLower) || cedula.includes(searchLower)
  })

  // Handle patient selection
  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId)
    setSelectedPatient(patient || null)
    setIsNewPatient(false)
    setShowPatientSelector(false)
  }

  // Handle time slot selection
  const handleTimeSlotSelect = (date: string, startTime: string, endTime: string) => {
    console.log("Selected time slot:", date, startTime, endTime)
    setSelectedDate(date)
    setSelectedTime(startTime)
    setEndTime(endTime)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Verificar si el formulario ya se ha enviado usando la referencia
    if (formSubmittedRef.current || isLoading) {
      console.log("Formulario ya enviado o cargando, ignorando clic")
      return
    }

    // Validar datos
    if (!selectedPatient && !isNewPatient) {
      toast({
        title: "Error",
        description: "Debe seleccionar un paciente",
        variant: "destructive",
      })
      return
    }

    if (!selectedDate || !selectedTime || !treatmentType || !doctor) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    // Añadir diálogo de confirmación antes de proceder
    const formattedDate = formatDateForDisplay(selectedDate)
    const confirmed = window.confirm(`¿Está seguro de crear esta cita para el ${formattedDate} a las ${selectedTime}?`)

    if (!confirmed) {
      return
    }

    // Marcar el formulario como enviado usando la referencia
    formSubmittedRef.current = true

    // Establecer el estado de carga
    setIsLoading(true)

    try {
      console.log("Form submission started")

      let patientId = selectedPatient?.id || null

      // Si es un paciente nuevo, crear primero
      if (isNewPatient) {
        if (
          !newPatientData.first_name ||
          !newPatientData.last_name ||
          !newPatientData.cedula ||
          !newPatientData.phone
        ) {
          throw new Error("Por favor complete todos los campos obligatorios del paciente")
        }

        const { data, error } = await supabase
          .from("patients")
          .insert([
            {
              first_name: newPatientData.first_name,
              last_name: newPatientData.last_name,
              cedula: newPatientData.cedula,
              phone: newPatientData.phone,
              email: newPatientData.email || null,
              // Añadir fecha de nacimiento con valor predeterminado
              date_birth: new Date().toISOString().split("T")[0],
            },
          ])
          .select()

        if (error) {
          console.error("Error creating patient:", error)
          throw new Error(`Error al crear paciente: ${error.message}`)
        }

        if (!data || data.length === 0) {
          throw new Error("No se pudo crear el paciente")
        }

        patientId = data[0].id
        console.log("New patient created with ID:", patientId)
      }

      // Formatear la fecha correctamente para la base de datos
      const formattedDateForDB = formatDateForDatabase(selectedDate)

      // Debug date information
      debugDate("Original selected date", selectedDate)
      debugDate("Formatted date for DB", formattedDateForDB)

      // Datos para la cita
      const appointmentData = {
        patient_id: patientId,
        appointment_date: formattedDateForDB,
        start_time: selectedTime,
        end_time: endTime,
        treatment_type: treatmentType,
        doctor: doctor,
        notes: notes || null,
        status: "scheduled",
        title: `${treatmentType} - ${selectedPatient?.first_name || newPatientData.first_name} ${selectedPatient?.last_name || newPatientData.last_name}`,
      }

      console.log("Final appointment data being saved:", appointmentData)

      // Insertar la cita directamente con supabase
      const { data, error } = await supabase.from("appointments").insert([appointmentData]).select()

      if (error) {
        console.error("Error creating appointment:", error)
        throw new Error(`Error al crear cita: ${error.message}`)
      }

      console.log("Appointment created successfully:", data)

      // Mostrar éxito
      toast({
        title: "Éxito",
        description: "Cita creada correctamente",
      })

      // Marcar como exitoso solo después de que la cita se haya guardado correctamente
      setIsSuccess(true)

      // Redirigir después de mostrar el mensaje
      setTimeout(() => {
        router.push("/citas")
        router.refresh() // Forzar actualización de la página
      }, 2000)
    } catch (error: any) {
      console.error("Error in handleSubmit:", error)
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear la cita",
        variant: "destructive",
      })
      // Restablecer el estado de envío del formulario en caso de error
      formSubmittedRef.current = false
      setIsLoading(false)
    }
  }

  // Si la cita se creó con éxito, mostrar mensaje de confirmación
  if (isSuccess) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">¡Cita creada con éxito!</h3>
          <p className="text-muted-foreground mt-1 text-center">
            La cita ha sido registrada correctamente. Redirigiendo a la lista de citas...
          </p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => router.push("/citas")} className="bg-[#0051FF] text-white hover:bg-[#0051FF]/90">
              Ver todas las citas
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sección de Paciente */}
      <Card>
        <CardContent className="p-6">
          {showPatientSelector ? (
            <>
              <div className="flex items-center space-x-2 mb-4">
                <Button
                  type="button"
                  variant={!isNewPatient ? "default" : "outline"}
                  onClick={() => setIsNewPatient(false)}
                >
                  Paciente Existente
                </Button>
                <Button
                  type="button"
                  variant={isNewPatient ? "default" : "outline"}
                  onClick={() => setIsNewPatient(true)}
                >
                  Nuevo Paciente
                </Button>
              </div>

              {!isNewPatient ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patient-search">Buscar Paciente</Label>
                    <Input
                      id="patient-search"
                      placeholder="Buscar por nombre o cédula..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    {isLoadingPatients ? (
                      <div className="p-4 text-center">Cargando pacientes...</div>
                    ) : filteredPatients.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">No se encontraron pacientes</div>
                    ) : (
                      <div className="divide-y">
                        {filteredPatients.map((patient) => (
                          <div
                            key={patient.id}
                            className={`p-3 cursor-pointer hover:bg-muted ${
                              selectedPatient?.id === patient.id ? "bg-muted" : ""
                            }`}
                            onClick={() => handlePatientSelect(patient.id)}
                          >
                            <div className="font-medium">{`${patient.first_name} ${patient.last_name}`}</div>
                            <div className="text-sm text-muted-foreground">
                              <span>CI: {patient.cedula}</span>
                              {patient.phone && <span className="ml-3">Tel: {patient.phone}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="first_name">Nombres</Label>
                    <Input
                      id="first_name"
                      value={newPatientData.first_name}
                      onChange={(e) => setNewPatientData({ ...newPatientData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Apellidos</Label>
                    <Input
                      id="last_name"
                      value={newPatientData.last_name}
                      onChange={(e) => setNewPatientData({ ...newPatientData, last_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cedula">Cédula</Label>
                    <Input
                      id="cedula"
                      value={newPatientData.cedula}
                      onChange={(e) => setNewPatientData({ ...newPatientData, cedula: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newPatientData.phone}
                      onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newPatientData.email}
                      onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      onClick={() => {
                        if (
                          newPatientData.first_name &&
                          newPatientData.last_name &&
                          newPatientData.cedula &&
                          newPatientData.phone
                        ) {
                          setSelectedPatient({
                            id: "temp-id",
                            ...newPatientData,
                          } as Patient)
                          setShowPatientSelector(false)
                        } else {
                          toast({
                            title: "Error",
                            description: "Por favor complete todos los campos obligatorios del paciente",
                            variant: "destructive",
                          })
                        }
                      }}
                    >
                      Continuar
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Mostrar información del paciente seleccionado */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedPatient?.first_name} {selectedPatient?.last_name}
                  </h2>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span>CI: {selectedPatient?.cedula}</span>
                    <span className="ml-4">Tel: {selectedPatient?.phone}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPatientSelector(true)
                    setSelectedPatient(null)
                  }}
                >
                  Cambiar
                </Button>
              </div>

              <div className="mt-4">
                <Label htmlFor="doctor">Doctor</Label>
                <Select value={doctor} onValueChange={setDoctor} required>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Sección de Detalles de la Cita */}
      {!showPatientSelector && (
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
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Detalles adicionales sobre la cita..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                {selectedDate && selectedTime && treatmentType && (
                  <div className="p-4 border rounded-md bg-muted/50">
                    <h3 className="font-medium">Detalles Seleccionados</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      {selectedDate && <p>Fecha: {formatDateForDisplay(selectedDate)}</p>}
                      {selectedTime && (
                        <p>
                          Hora: {selectedTime} - {endTime}
                        </p>
                      )}
                      {treatmentType && (
                        <p>
                          Tratamiento: {TREATMENT_TYPES.find((t) => t.value === treatmentType)?.label || treatmentType}
                        </p>
                      )}
                      {doctor && <p>Doctor: {doctor}</p>}
                    </div>
                  </div>
                )}
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
      )}

      {/* Botones de acción */}
      {!showPatientSelector && (
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/citas")}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading || formSubmittedRef.current}
            className="bg-[#0051FF] text-white hover:bg-[#0051FF]/90"
            id="submit-appointment-button" // Añadir un ID para facilitar la depuración
          >
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                Guardando...
              </>
            ) : (
              "Crear Cita"
            )}
          </Button>
        </div>
      )}
    </form>
  )
}
