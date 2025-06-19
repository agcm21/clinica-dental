"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Plus, Search, Calendar, FileText, ImageIcon, Pencil, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
import { useRouter } from "next/navigation"
// Añadir esta importación al inicio del archivo, junto con las demás importaciones
import { TreatmentImagesDialog } from "@/components/treatment-images-dialog"

interface Patient {
  id: string
  cedula: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  status: string
  created_at: string
}

interface PatientDetails {
  nextAppointment?: {
    date: string
    treatment: string
  }
  financial?: {
    total: number
    paid: number
    pending: number
  }
  recentTreatments?: Array<{
    id: string
    date: string
    treatment: string
    tooth: string
    zone: string
    details: string
    status: string
    statusLabel: string
    images: Array<{
      url: string
    }>
  }>
  documents?: Array<{
    id: string
    name: string
    url: string
  }>
}

// Función de debounce para mejorar rendimiento de búsqueda
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const statusLabels = {
  en_proceso: "En Proceso",
  terminado: "Terminado",
  presupuesto: "Presupuesto Enviado",
}

// Colores para los estados de los dientes
const statusColors: { [key: string]: string } = {
  healthy: "bg-green-500/70 text-white",
  completed: "bg-blue-500/70 text-white",
  "in-treatment": "bg-yellow-500/70 text-white",
  pending: "bg-red-500/70 text-white",
}

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const debouncedSearch = useRef(
    debounce((value: string) => {
      setDebouncedSearchTerm(value)
    }, 300),
  ).current
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [isImagesDialogOpen, setIsImagesDialogOpen] = useState(false)
  const [selectedTreatmentImages, setSelectedTreatmentImages] = useState<any[]>([])
  const [selectedTreatmentInfo, setSelectedTreatmentInfo] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/patients")
        if (!response.ok) {
          throw new Error(`Error al cargar pacientes: ${response.status}`)
        }
        const data = await response.json()
        
        // Verificar que data sea un array
        if (!Array.isArray(data)) {
          console.error("La respuesta de la API no es un array:", data)
          setPatients([])
          return
        }
        
        // Asignar un estado por defecto si no existe
        const patientsWithStatus = data.map((p: any) => ({
          ...p,
          status: p.status || "en_proceso",
        }))
        setPatients(patientsWithStatus)
      } catch (error) {
        console.error("Error:", error)
        toast.error("No se pudieron cargar los pacientes")
        setPatients([]) // Establecer un array vacío en caso de error
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const patientDetailsEffect = useCallback(() => {
    const fetchPatientDetails = async () => {
      if (!selectedPatient) {
        setPatientDetails(null)
        return
      }

      setIsLoadingDetails(true)

      try {
        const controller = new AbortController()
        const signal = controller.signal

        const response = await fetch(`/api/patients/${selectedPatient.id}/details`, { signal })

        if (!response.ok) {
          throw new Error("Error al cargar detalles del paciente")
        }

        const data = await response.json()
        setPatientDetails(data)
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return
        }

        console.error("Error:", error)
        setPatientDetails({})
        toast.error("No se pudieron cargar los detalles del paciente")
      } finally {
        setIsLoadingDetails(false)
      }
    }

    fetchPatientDetails()

    return () => {
      // Cleanup function
    }
  }, [selectedPatient])

  useEffect(patientDetailsEffect, [patientDetailsEffect])

  // Filtrar pacientes según el término de búsqueda debounceado
  const filteredPatients = patients.filter((patient) => {
    const searchString = debouncedSearchTerm.toLowerCase()
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
    const cedula = patient.cedula?.toLowerCase() || ""
    const email = patient.email?.toLowerCase() || ""
    const phone = patient.phone?.toLowerCase() || ""

    return (
      fullName.includes(searchString) ||
      cedula.includes(searchString) ||
      email.includes(searchString) ||
      phone.includes(searchString)
    )
  })

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient)
  }

  const updatePatientStatus = async (patientId: string, newStatus: string) => {
    try {
      // En producción, esto debería ser una llamada a la API
      // const response = await fetch(`/api/patients/${patientId}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ status: newStatus }),
      // })

      // if (!response.ok) {
      //   throw new Error('Error al actualizar el estado del paciente')
      // }

      // Actualizar el estado localmente
      setPatients(patients.map((p) => (p.id === patientId ? { ...p, status: newStatus } : p)))

      if (selectedPatient?.id === patientId) {
        setSelectedPatient({ ...selectedPatient, status: newStatus })
      }

      toast.success(`El estado del paciente ha sido actualizado a ${statusLabels[newStatus as keyof typeof statusLabels]}`)
    } catch (error) {
      console.error("Error:", error)
      toast.error("No se pudo actualizar el estado del paciente")
    }
  }

  const handleDeletePatient = async () => {
    if (!patientToDelete) return

    try {
      const response = await fetch(`/api/patients/${patientToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el paciente")
      }

      // Remove the patient from the list
      setPatients(patients.filter((p) => p.id !== patientToDelete.id))

      // If the deleted patient was selected, clear the selection
      if (selectedPatient?.id === patientToDelete.id) {
        setSelectedPatient(null)
        setPatientDetails(null)
      }

      toast.success("El paciente ha sido eliminado exitosamente")
    } catch (error) {
      console.error("Error:", error)
      toast.error("No se pudo eliminar el paciente")
    } finally {
      setPatientToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Lista principal */}
      <div className="flex-1 flex flex-col">
        <header className="border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Link href="/panel-principal" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Panel</span>
              </Link>
              <h1 className="text-lg font-semibold">Pacientes</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-[#0051FF] text-white hover:bg-[#0051FF]/90">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Link href="/nuevo-paciente">
                <Button className="bg-[#0051FF] text-white hover:bg-[#0051FF]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Paciente
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pacientes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    debouncedSearch(e.target.value)
                  }}
                />
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="grid w-full grid-cols-12 gap-4 p-4 font-medium bg-muted/50">
                <div className="col-span-1">Cédula</div>
                <div className="col-span-2">Nombre</div>
                <div className="col-span-2">Teléfono</div>
                <div className="col-span-2">Correo</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-1">Odontograma</div>
                <div className="col-span-2">Acciones</div>
              </div>

              {isLoading ? (
                <div className="p-8 text-center">Cargando pacientes...</div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-8 text-center">No se encontraron pacientes</div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`grid w-full grid-cols-12 gap-4 border-t p-4 hover:bg-muted/30 transition-colors ${
                      selectedPatient?.id === patient.id ? "bg-muted/40" : ""
                    }`}
                  >
                    <div className="col-span-1 truncate cursor-pointer" onClick={() => handlePatientClick(patient)}>
                      {patient.cedula}
                    </div>
                    <div className="col-span-2 truncate cursor-pointer" onClick={() => handlePatientClick(patient)}>
                      {`${patient.first_name} ${patient.last_name}`}
                    </div>
                    <div className="col-span-2 truncate cursor-pointer" onClick={() => handlePatientClick(patient)}>
                      {patient.phone}
                    </div>
                    <div className="col-span-2 truncate cursor-pointer" onClick={() => handlePatientClick(patient)}>
                      {patient.email || "-"}
                    </div>
                    <div className="col-span-2">
                      <Select value={patient.status} onValueChange={(value) => updatePatientStatus(patient.id, value)}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_proceso">En Proceso</SelectItem>
                          <SelectItem value="terminado">Terminado</SelectItem>
                          <SelectItem value="presupuesto">Presupuesto Enviado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/pacientes/${patient.id}/odontograma`}>Ver</Link>
                      </Button>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 text-blue-500" asChild>
                        <Link href={`/pacientes/editar/${patient.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => {
                          setPatientToDelete(patient)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Panel lateral */}
      <div className="w-80 border-l bg-muted/10 p-6">
        <div className="space-y-6">
          {!selectedPatient ? (
            <div className="text-center text-muted-foreground p-4">Seleccione un paciente para ver sus detalles</div>
          ) : isLoadingDetails ? (
            <div className="text-center text-muted-foreground p-4">Cargando información del paciente...</div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Próxima Cita</CardTitle>
                </CardHeader>
                <CardContent>
                  {patientDetails?.nextAppointment ? (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{patientDetails.nextAppointment.date}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{patientDetails.nextAppointment.treatment}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Información por definir</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado Financiero</CardTitle>
                </CardHeader>
                <CardContent>
                  {patientDetails?.financial && patientDetails.financial.total > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Tratamientos:</span>
                        <span className="font-medium">${patientDetails.financial.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pagado:</span>
                        <span className="font-medium text-green-600">${patientDetails.financial.paid}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pendiente:</span>
                        <span className="font-medium text-red-600">${patientDetails.financial.pending}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Información por definir</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Últimos Tratamientos</CardTitle>
                </CardHeader>
                <CardContent>
                  {patientDetails?.recentTreatments?.length ? (
                    <div className="space-y-4">
                      {/* Show only the most recent treatment */}
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{patientDetails.recentTreatments[0].date}</span>
                          </div>
                          <span className="text-sm font-medium">Diente {patientDetails.recentTreatments[0].tooth}</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm text-muted-foreground">Zona tratada:</span>
                          <p className="text-sm font-medium">{patientDetails.recentTreatments[0].zone}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm">
                            {patientDetails.recentTreatments[0].treatment}: {patientDetails.recentTreatments[0].details}
                          </p>
                          <Badge className={statusColors[patientDetails.recentTreatments[0].status] || "bg-gray-500"}>
                            {patientDetails.recentTreatments[0].statusLabel}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          {patientDetails?.recentTreatments?.[0]?.images &&
                          patientDetails.recentTreatments[0].images.length > 0 ? (
                            <>
                              <div className="relative h-16 w-16 overflow-hidden rounded border">
                                <img
                                  src={patientDetails.recentTreatments[0].images[0].url || "/placeholder.svg"}
                                  alt="Tratamiento previo"
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement
                                    img.src = "/placeholder.svg"
                                  }}
                                />
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (patientDetails.recentTreatments?.[0]?.images?.length) {
                                    setSelectedTreatmentImages(patientDetails.recentTreatments[0].images)
                                    setSelectedTreatmentInfo({
                                      toothNumber: patientDetails.recentTreatments[0].tooth,
                                      date: patientDetails.recentTreatments[0].date,
                                      treatmentType: patientDetails.recentTreatments[0].treatment,
                                    })
                                    setIsImagesDialogOpen(true)
                                  }
                                }}
                              >
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Ver imagen
                              </Button>
                            </>
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center bg-gray-100 rounded border">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay tratamientos registrados</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documentos</CardTitle>
                </CardHeader>
                <CardContent>
                  {patientDetails?.documents?.length ? (
                    <div className="space-y-2">
                      {patientDetails.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover:underline"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc.name}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Información por definir</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a este paciente, incluyendo
              tratamientos, citas y facturas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Diálogo para visualizar imágenes - Renderizado condicional */}
      {isImagesDialogOpen && (
        <TreatmentImagesDialog
          images={selectedTreatmentImages}
          open={isImagesDialogOpen}
          onOpenChange={setIsImagesDialogOpen}
          treatmentInfo={selectedTreatmentInfo}
        />
      )}
    </div>
  )
}