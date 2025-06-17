"use client"

// Importar React explícitamente para poder usar React.use()
import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, ImageIcon, Upload, X, User, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooth } from "@/components/tooth"
import { toast } from "@/components/ui/use-toast"
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
import { uploadTreatmentImage } from "@/lib/supabase-storage"
import { verifyStorageSetup } from "@/lib/supabase"
import { checkBucketExists, createBucketIfNotExists } from "@/lib/bucket-utils"
// Importar el nuevo componente de diálogo de imágenes
import { TreatmentImagesDialog } from "@/components/treatment-images-dialog"

interface ToothState {
  [key: number]: string // número del diente -> estado
}

interface Treatment {
  id: string
  treatment_date: string
  tooth_number: number
  tooth_zone: string
  treatment_type: string
  details: string
  status: string
  images?: { path: string; url: string }[]
}

export default function OdontogramaPage({ params }: { params: { id: string } }) {
  // ✅ CORRECCIÓN: Acceso directo a params.id
  const patientId = params.id

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("healthy")
  const [toothStates, setToothStates] = useState<ToothState>({})
  const [patientData, setPatientData] = useState<any>(null)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [treatmentToDelete, setTreatmentToDelete] = useState<Treatment | null>(null)
  const [isEditingTreatment, setIsEditingTreatment] = useState<string | null>(null)

  // Estados para el formulario de tratamiento
  const [selectedZone, setSelectedZone] = useState<string>("")
  const [selectedTreatmentType, setSelectedTreatmentType] = useState<string>("")
  const [treatmentDate, setTreatmentDate] = useState<string>("")
  const [treatmentDetails, setTreatmentDetails] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  // States for image handling
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Agregar estos estados después de los estados existentes, cerca de la línea 40-50
  const [isImagesDialogOpen, setIsImagesDialogOpen] = useState(false)
  const [selectedTreatmentImages, setSelectedTreatmentImages] = useState<any[]>([])
  const [selectedTreatmentInfo, setSelectedTreatmentInfo] = useState<any>(null)

  useEffect(() => {
    // Verificar configuración de storage al cargar
    verifyStorageSetup().then((isReady) => {
      if (!isReady) {
        toast({
          title: "Advertencia",
          description: "El sistema de almacenamiento no está correctamente configurado",
          variant: "destructive",
        })
      }
    })
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // CAMBIO 2: Usar patientId en lugar de params.id
        // Fetch patient data
        const patientResponse = await fetch(`/api/patients/${patientId}`)
        if (!patientResponse.ok) throw new Error("Error al cargar datos del paciente")
        const patientData = await patientResponse.json()
        setPatientData(patientData)

        // Fetch treatments
        const treatmentsResponse = await fetch(`/api/dental-treatments?patientId=${patientId}`)
        if (!treatmentsResponse.ok) throw new Error("Error al cargar tratamientos")
        const treatmentsData = await treatmentsResponse.json()
        setTreatments(treatmentsData)

        // Update tooth states based on treatments
        const latestToothStates: { [key: number]: string } = {}
        treatmentsData.forEach((treatment: Treatment) => {
          const toothNumber = treatment.tooth_number
          if (
            !latestToothStates[toothNumber] ||
            new Date(treatment.treatment_date) > new Date(latestToothStates[toothNumber])
          ) {
            latestToothStates[toothNumber] = treatment.status
          }
        })
        setToothStates(latestToothStates)
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [patientId]) // CAMBIO 3: Usar patientId en la dependencia del useEffect

  const refreshTreatments = async () => {
    try {
      setIsLoading(true)
      // CAMBIO 4: Usar patientId en lugar de params.id
      // Fetch treatments
      const treatmentsResponse = await fetch(`/api/dental-treatments?patientId=${patientId}`)
      if (!treatmentsResponse.ok) throw new Error("Error al cargar tratamientos")
      const treatmentsData = await treatmentsResponse.json()
      setTreatments(treatmentsData)

      // Update tooth states based on treatments
      const latestToothStates: { [key: number]: string } = {}
      treatmentsData.forEach((treatment: Treatment) => {
        const toothNumber = treatment.tooth_number
        if (
          !latestToothStates[toothNumber] ||
          new Date(treatment.treatment_date) > new Date(latestToothStates[toothNumber])
        ) {
          latestToothStates[toothNumber] = treatment.status
        }
      })
      setToothStates(latestToothStates)

      toast({
        title: "Actualizado",
        description: "Los tratamientos han sido actualizados",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los tratamientos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTreatment = async () => {
    if (!treatmentToDelete) return

    try {
      const response = await fetch(`/api/dental-treatments/${treatmentToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar tratamiento")
      }

      toast({
        title: "Tratamiento eliminado",
        description: "El tratamiento ha sido eliminado exitosamente",
      })

      // Refresh treatments after deletion
      await refreshTreatments()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el tratamiento",
        variant: "destructive",
      })
    } finally {
      setTreatmentToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleEditTreatment = (treatment: Treatment) => {
    setSelectedTooth(treatment.tooth_number)
    setSelectedZone(treatment.tooth_zone || "")
    setSelectedTreatmentType(treatment.treatment_type || "")
    const formattedDate = treatment.treatment_date ? new Date(treatment.treatment_date).toISOString().split("T")[0] : ""
    setTreatmentDate(formattedDate)
    setTreatmentDetails(treatment.details || "")
    setSelectedStatus(treatment.status || "healthy")
    setIsEditingTreatment(treatment.id) // Set the ID of the treatment being edited
  }

  // Estados y sus colores
  const statusOptions = [
    { value: "healthy", label: "Saludable", color: "bg-green-500/70" },
    { value: "completed", label: "Completado", color: "bg-blue-500/70" },
    { value: "in-treatment", label: "En Tratamiento", color: "bg-yellow-500/70" },
    { value: "pending", label: "Sin tratamiento", color: "bg-red-500/70" },
  ]

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    if (selectedTooth) {
      setToothStates((prev) => ({
        ...prev,
        [selectedTooth]: value,
      }))
    }
  }

  // Actualizar la estructura de los dientes según el estándar
  const upperLeftTeeth = Array.from({ length: 8 }, (_, i) => 18 - i)
  const upperRightTeeth = Array.from({ length: 8 }, (_, i) => 21 + i)
  const lowerLeftTeeth = Array.from({ length: 8 }, (_, i) => 48 - i)
  const lowerRightTeeth = Array.from({ length: 8 }, (_, i) => 31 + i)

  const handleToothClick = (number: number) => {
    setSelectedTooth(number)
    setSelectedStatus(toothStates[number] || "healthy")
    // Reset the form
    setSelectedZone("")
    setSelectedTreatmentType("")
    setTreatmentDate("")
    setTreatmentDetails("")
    setSelectedImage(null)
    setImagePreview(null)
    setIsEditingTreatment(null) // Reset editing state
  }

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)

      // Validar tamaño de archivos (máximo 5MB por archivo)
      const oversizedFiles = newFiles.filter((file) => file.size > 5 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast({
          title: "Error",
          description: `${oversizedFiles.length} archivo(s) exceden el tamaño máximo de 5MB`,
          variant: "destructive",
        })

        // Filtrar archivos que cumplen con el tamaño
        const validFiles = newFiles.filter((file) => file.size <= 5 * 1024 * 1024)
        if (validFiles.length === 0) return

        setSelectedImages((prev) => [...prev, ...validFiles])

        // Crear URLs para previsualizaciones
        const newImageUrls = validFiles.map((file) => URL.createObjectURL(file))
        setImagePreviewUrls((prev) => [...prev, ...newImageUrls])
      } else {
        setSelectedImages((prev) => [...prev, ...newFiles])

        // Crear URLs para previsualizaciones
        const newImageUrls = newFiles.map((file) => URL.createObjectURL(file))
        setImagePreviewUrls((prev) => [...prev, ...newImageUrls])
      }

      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      e.target.value = ""
    }
  }

  // Remove an image
  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))

    // Revoke object URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index])
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // Agregar función para guardar el tratamiento
  const handleSaveTreatment = async () => {
    if (!selectedTooth) {
      toast({
        title: "Error",
        description: "Debe seleccionar un diente",
        variant: "destructive",
      })
      return
    }

    if (!selectedZone) {
      toast({
        title: "Error",
        description: "Debe seleccionar una zona del diente",
        variant: "destructive",
      })
      return
    }

    if (!selectedTreatmentType) {
      toast({
        title: "Error",
        description: "Debe seleccionar un tipo de tratamiento",
        variant: "destructive",
      })
      return
    }

    if (!treatmentDate) {
      toast({
        title: "Error",
        description: "Debe seleccionar una fecha",
        variant: "destructive",
      })
      return
    }

    // Check if we're creating a new treatment for a tooth/zone that already has one
    if (!isEditingTreatment) {
      const existingTreatment = treatments.find(
        (t) => t.tooth_number === selectedTooth && t.tooth_zone === selectedZone,
      )

      if (existingTreatment) {
        toast({
          title: "Advertencia",
          description: "Ya existe un tratamiento para este diente en la misma zona. Por favor edite el existente.",
          variant: "destructive",
        })
        return
      }
    }

    setIsSaving(true)

    try {
      const treatmentData = {
        // CAMBIO 5: Usar patientId en lugar de params.id
        patient_id: patientId,
        tooth_number: selectedTooth,
        tooth_zone: selectedZone,
        treatment_type: selectedTreatmentType,
        treatment_date: treatmentDate,
        details: treatmentDetails,
        status: selectedStatus,
        images: [] as { path: string; url: string }[],
      }

      // If we're editing an existing treatment, get its current images
      if (isEditingTreatment) {
        const existingTreatment = treatments.find((t) => t.id === isEditingTreatment)
        if (existingTreatment && existingTreatment.images) {
          treatmentData.images = [...existingTreatment.images]
        }
      }

      // Si hay imágenes seleccionadas, subirlas una por una
      if (selectedImages.length > 0) {
        // Verificar que no excedamos el límite de 5 imágenes
        const totalImages = treatmentData.images.length + selectedImages.length
        if (totalImages > 5) {
          toast({
            title: "Error",
            description: `No se pueden agregar más de 5 imágenes por tratamiento. Ya tiene ${treatmentData.images.length} y está intentando agregar ${selectedImages.length} más.`,
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }

        toast({
          title: "Subiendo imágenes",
          description: `Subiendo ${selectedImages.length} imágenes...`,
        })

        // Verificar que el bucket existe antes de subir
        const bucketExists = await checkBucketExists()
        if (!bucketExists) {
          const created = await createBucketIfNotExists()
          if (!created) {
            throw new Error("No se pudo crear el bucket para almacenar imágenes")
          }
        }

        for (let i = 0; i < selectedImages.length; i++) {
          const file = selectedImages[i]
          try {
            console.log(`Subiendo imagen ${i + 1}/${selectedImages.length}:`, file.name)

            const treatmentId = isEditingTreatment || "new"
            // CAMBIO 6: Usar patientId en lugar de params.id
            const uploadResult = await uploadTreatmentImage(file, patientId, treatmentId)

            console.log("Resultado de subida:", uploadResult)
            treatmentData.images.push(uploadResult)

            // Actualizar toast para mostrar progreso
            toast({
              title: "Progreso",
              description: `Subida ${i + 1} de ${selectedImages.length} completada`,
            })
          } catch (uploadError) {
            console.error(`Error al subir imagen ${i + 1}:`, uploadError)
            toast({
              title: "Error",
              description: `Error al subir imagen ${i + 1}: ${uploadError instanceof Error ? uploadError.message : "Error desconocido"}`,
              variant: "destructive",
            })
          }
        }
      }

      console.log("Datos del tratamiento a guardar:", treatmentData)

      let response
      let savedTreatment

      if (isEditingTreatment) {
        // Update existing treatment
        console.log(`Actualizando tratamiento existente ID: ${isEditingTreatment}`)
        response = await fetch(`/api/dental-treatments/${isEditingTreatment}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(treatmentData),
        })
      } else {
        // Create new treatment
        console.log("Creando nuevo tratamiento")
        response = await fetch("/api/dental-treatments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(treatmentData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error en respuesta del servidor:", errorData)
        throw new Error(errorData.error || `Error del servidor: ${response.status}`)
      }

      savedTreatment = await response.json()
      console.log("Tratamiento guardado exitosamente:", savedTreatment)

      // After successful save
      if (savedTreatment) {
        // Update the treatments list while preserving image data
        if (isEditingTreatment) {
          setTreatments(
            treatments.map((t) =>
              t.id === isEditingTreatment ? { ...t, ...savedTreatment, images: savedTreatment.images || t.images } : t,
            ),
          )
        } else {
          setTreatments([{ ...savedTreatment, images: treatmentData.images }, ...treatments])
        }

        // Limpiar las imágenes seleccionadas y previsualizaciones
        setSelectedImages([])
        setImagePreviewUrls([])

        // Limpiar URLs de previsualización para liberar memoria
        imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url))
      }

      // Update the tooth state in the odontogram
      setToothStates((prev) => ({
        ...prev,
        [selectedTooth]: selectedStatus,
      }))

      toast({
        title: "Éxito",
        description: isEditingTreatment
          ? "El tratamiento ha sido actualizado exitosamente"
          : "El tratamiento ha sido guardado exitosamente",
      })

      // Refrescar los tratamientos para asegurar que tenemos los datos más recientes
      setTimeout(() => {
        refreshTreatments()
      }, 1000)

      // Clear the form
      setSelectedZone("")
      setSelectedTreatmentType("")
      setTreatmentDate("")
      setTreatmentDetails("")
      setIsEditingTreatment(null) // Reset editing state
    } catch (error) {
      console.error("Error al guardar tratamiento:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar tratamiento",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setSelectedZone("")
    setSelectedTreatmentType("")
    setTreatmentDate("")
    setTreatmentDetails("")
    setSelectedStatus("healthy")
    setSelectedImage(null)
    setImagePreview(null)
    setIsEditingTreatment(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <Link href="/pacientes" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a Pacientes</span>
          </Link>
          <h1 className="ml-4 text-lg font-semibold">Odontograma</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-[1400px] space-y-6">
          {/* Panel lateral con información del paciente y último tratamiento */}
          <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
            {" "}
            {/* Aumentado de 350px a 400px */}
            <div className="space-y-6">
              {/* Información del Paciente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="text-center text-muted-foreground">Cargando datos del paciente...</div>
                  ) : patientData ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-muted-foreground shrink-0">Nombre:</span>
                        <span className="font-medium text-right">
                          {patientData.first_name} {patientData.last_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-muted-foreground shrink-0">Cédula:</span>
                        <span className="font-medium text-right">{patientData.cedula}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-muted-foreground shrink-0">Teléfono:</span>
                        <span className="font-medium text-right">{patientData.phone}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-muted-foreground shrink-0">Email:</span>
                        <span className="font-medium text-right break-all">{patientData.email || "-"}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">No se encontraron datos del paciente</div>
                  )}
                </CardContent>
              </Card>

              {/* Historial de Tratamientos */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Historial de Tratamientos</CardTitle>
                    <Button variant="outline" size="sm" onClick={refreshTreatments} disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                          Cargando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3 w-3"
                          >
                            <path d="M21 2v6h-6"></path>
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                            <path d="M3 22v-6h6"></path>
                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                          </svg>
                          Actualizar
                        </span>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {treatments.length === 0 ? (
                      <p className="text-center text-muted-foreground">No hay tratamientos registrados</p>
                    ) : (
                      treatments.map((treatment) => (
                        <div key={treatment.id} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {treatment.treatment_date
                                  ? new Date(treatment.treatment_date).toLocaleDateString("es-ES", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "Fecha no disponible"}
                              </span>
                            </div>
                            <span className="text-sm font-medium">Diente {treatment.tooth_number}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-sm text-muted-foreground">Zona tratada:</span>
                            <p className="text-sm font-medium">{treatment.tooth_zone}</p>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-sm">
                              {treatment.treatment_type}: {treatment.details}
                            </p>
                            <Badge
                              className={
                                treatment.status === "completed"
                                  ? "bg-blue-500"
                                  : treatment.status === "in-treatment"
                                    ? "bg-yellow-500"
                                    : treatment.status === "pending"
                                      ? "bg-red-500"
                                      : "bg-green-500"
                              }
                            >
                              {treatment.status === "completed"
                                ? "Completado"
                                : treatment.status === "in-treatment"
                                  ? "En Tratamiento"
                                  : treatment.status === "pending"
                                    ? "Pendiente"
                                    : "Saludable"}
                            </Badge>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {treatment.images && treatment.images.length > 0 ? (
                                <div className="flex items-center gap-2 overflow-x-auto">
                                  {treatment.images.map((image, idx) => (
                                    <div
                                      key={idx}
                                      className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border"
                                    >
                                      <img
                                        src={image.url || "/placeholder.svg"}
                                        alt={`Tratamiento del diente ${treatment.tooth_number} - imagen ${idx + 1}`}
                                        className="h-full w-full object-cover"
                                        crossOrigin="anonymous"
                                        onError={(e) => {
                                          console.error("Error cargando imagen:", image.url)
                                          const img = e.target as HTMLImageElement
                                          img.src = "/placeholder.svg"
                                        }}
                                      />
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (treatment.images && treatment.images.length > 0) {
                                        setSelectedTreatmentImages(treatment.images)
                                        setSelectedTreatmentInfo({
                                          toothNumber: treatment.tooth_number,
                                          date: new Date(treatment.treatment_date).toLocaleDateString("es-ES", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                          }),
                                          treatmentType: treatment.treatment_type,
                                        })
                                        setIsImagesDialogOpen(true)
                                      }
                                    }}
                                  >
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Ver imágenes ({treatment.images.length})
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center bg-gray-100 rounded border">
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-blue-500"
                                onClick={() => handleEditTreatment(treatment)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => {
                                  setTreatmentToDelete(treatment)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Contenido principal */}
            <div className="space-y-6">
              {/* Odontograma mejorado */}
              <div className="rounded-xl border bg-white p-6">
                <div className="space-y-12">
                  {/* Dientes superiores */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="grid grid-cols-8 gap-1">
                      {upperLeftTeeth.map((number) => (
                        <Tooth
                          key={number}
                          number={number}
                          onClick={() => handleToothClick(number)}
                          status={toothStates[number] || "healthy"}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {upperRightTeeth.map((number) => (
                        <Tooth
                          key={number}
                          number={number}
                          onClick={() => handleToothClick(number)}
                          status={toothStates[number] || "healthy"}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Dientes inferiores */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="grid grid-cols-8 gap-1">
                      {lowerLeftTeeth.map((number) => (
                        <Tooth
                          key={number}
                          number={number}
                          onClick={() => handleToothClick(number)}
                          status={toothStates[number] || "healthy"}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {lowerRightTeeth.map((number) => (
                        <Tooth
                          key={number}
                          number={number}
                          onClick={() => handleToothClick(number)}
                          status={toothStates[number] || "healthy"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de tratamiento */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{isEditingTreatment ? "Editar Tratamiento" : "Registro de Tratamiento"}</CardTitle>
                    {selectedTooth && (
                      <span className="rounded-full bg-primary/10 px-4 py-1.5 text-lg font-bold text-primary">
                        Diente {selectedTooth}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="zone">Zona del diente</Label>
                          <Select value={selectedZone} onValueChange={setSelectedZone}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione zona" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vestibular">Vestibular</SelectItem>
                              <SelectItem value="palatino">Palatino/Lingual</SelectItem>
                              <SelectItem value="mesial">Mesial</SelectItem>
                              <SelectItem value="distal">Distal</SelectItem>
                              <SelectItem value="oclusal">Oclusal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="treatment">Tipo de tratamiento</Label>
                          <Select value={selectedTreatmentType} onValueChange={setSelectedTreatmentType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione tratamiento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="X exodoncia">X exodoncia</SelectItem>
                              <SelectItem value="I_endodoncia">I endodoncia</SelectItem>
                              <SelectItem value="caries">Relleno de zona en rojo caries</SelectItem>
                              <SelectItem value="restauracion_azul">Relleno de zona en azul restauración</SelectItem>
                              <SelectItem value="O_corona">O corona</SelectItem>
                              <SelectItem value="tratamientos">Tratamientos</SelectItem>
                              <SelectItem value="restauracion">Restauración</SelectItem>
                              <SelectItem value="reconstruccion">Reconstrucción</SelectItem>
                              <SelectItem value="carillas">Carillas</SelectItem>
                              <SelectItem value="endodoncia_monorradicular">Endodoncia monorradicular</SelectItem>
                              <SelectItem value="endodoncia_multirradicular">Endodoncia multirradicular</SelectItem>
                              <SelectItem value="endodoncia_birradicular">Endodoncia birradicular</SelectItem>
                              <SelectItem value="exodoncia_simple">Exodoncia simple</SelectItem>
                              <SelectItem value="exodoncia_quirurgica">Exodoncia quirúrgica</SelectItem>
                              <SelectItem value="exodoncia_3ros_molares">Exodoncia 3ros molares</SelectItem>
                              <SelectItem value="protesis_total_superior">Prótesis total superior</SelectItem>
                              <SelectItem value="protesis_total_inferior">Prótesis total inferior</SelectItem>
                              <SelectItem value="protesis_parcial_acrilica_superior">
                                Prótesis parcial acrílica superior
                              </SelectItem>
                              <SelectItem value="protesis_parcial_acrilica_inferior">
                                Prótesis parcial acrílica inferior
                              </SelectItem>
                              <SelectItem value="protesis_parcial_flexible_superior">
                                Prótesis parcial flexible superior
                              </SelectItem>
                              <SelectItem value="protesis_parcial_flexible_inferior">
                                Prótesis parcial flexible inferior
                              </SelectItem>
                              <SelectItem value="protesis_metalica_superior">Prótesis metálica superior</SelectItem>
                              <SelectItem value="protesis_metalica_inferior">Prótesis metálica inferior</SelectItem>
                              <SelectItem value="corona_impresa_3d">Corona impresa 3D</SelectItem>
                              <SelectItem value="corona_zirconio">Corona zirconio</SelectItem>
                              <SelectItem value="incrustacion_indirecta">Incrustación indirecta</SelectItem>
                              <SelectItem value="diseno_sonrisa">Diseño de sonrisa</SelectItem>
                              <SelectItem value="blanqueamiento">Blanqueamiento</SelectItem>
                              <SelectItem value="tartrectomia_profilaxis">Tartrectomia y profilaxis</SelectItem>
                              <SelectItem value="frenilectomia">Frenilectomia</SelectItem>
                              <SelectItem value="gigivectomia">Gigivectomia</SelectItem>
                              <SelectItem value="ortodoncia">Ortodoncia</SelectItem>
                              <SelectItem value="implante_dental">Implante dental</SelectItem>
                              <SelectItem value="panoramica">Panorámica</SelectItem>
                              <SelectItem value="rx_periapical">Rx periapical</SelectItem>
                              <SelectItem value="escaneo_intraoral">Escaneo intraoral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date">Fecha</Label>
                          <Input
                            type="date"
                            id="date"
                            value={treatmentDate}
                            onChange={(e) => setTreatmentDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Estado</Label>
                          <Select value={selectedStatus} onValueChange={handleStatusChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem
                                  key={status.value}
                                  value={status.value}
                                  className={`${status.color} text-white`}
                                >
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="details">Detalles del tratamiento</Label>
                        <Textarea
                          id="details"
                          placeholder="Describa el tratamiento realizado..."
                          className="min-h-[100px]"
                          value={treatmentDetails}
                          onChange={(e) => setTreatmentDetails(e.target.value)}
                        />
                      </div>

                      {/* Image upload section */}
                      <div className="space-y-2">
                        <Label htmlFor="images">Imágenes del tratamiento</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Subir imágenes
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            id="images"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </div>

                        {/* Image previews */}
                        {imagePreviewUrls.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {imagePreviewUrls.map((url, index) => (
                              <div key={index} className="relative rounded-md overflow-hidden h-24 border">
                                <img
                                  src={url || "/placeholder.svg"}
                                  alt={`Vista previa ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                  onClick={() => handleRemoveImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Estado actual</Label>
                        <div className="mt-2">
                          {selectedStatus && (
                            <div
                              className={`w-full p-2 rounded-md text-center text-white ${
                                statusOptions.find((s) => s.value === selectedStatus)?.color
                              }`}
                            >
                              {statusOptions.find((s) => s.value === selectedStatus)?.label}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveTreatment} disabled={isSaving}>
                          {isSaving
                            ? "Guardando..."
                            : isEditingTreatment
                              ? "Actualizar Tratamiento"
                              : "Guardar Tratamiento"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Diálogo para visualizar imágenes */}
      <TreatmentImagesDialog
        images={selectedTreatmentImages}
        open={isImagesDialogOpen}
        onOpenChange={setIsImagesDialogOpen}
        treatmentInfo={selectedTreatmentInfo}
      />

      {/* Diálogo de confirmación para eliminar tratamiento */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este tratamiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el registro del tratamiento y sus imágenes asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTreatment} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}



























