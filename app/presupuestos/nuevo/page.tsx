"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { treatmentPrices, treatmentOptions } from "@/lib/treatment-prices"
import { PresupuestoImageUploader } from "@/components/presupuesto-image-uploader"
import { uploadPresupuestoImage } from "@/lib/utils"

interface Patient {
  id: string
  first_name: string
  last_name: string
  cedula: string
  phone: string
  email: string | null
  address: string | null
  date_birth: string
  gender: string
  occupation: string | null
}

interface FormData {
  // Datos del paciente
  paciente_id?: string
  nombre: string
  apellido: string
  cedula: string
  fecha_nacimiento: string
  genero: string
  telefono: string
  email: string
  direccion: string
  ocupacion: string
  // Datos del presupuesto
  tratamiento: string
  descripcion: string
  monto: string
  imagen?: File | null
  imagen_url?: string | null
}

export default function NuevoPresupuestoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    cedula: "",
    fecha_nacimiento: "",
    genero: "",
    telefono: "",
    email: "",
    direccion: "",
    ocupacion: "",
    tratamiento: "",
    descripcion: "",
    monto: "",
    imagen: null,
    imagen_url: null,
  })
  const [isManualMonto, setIsManualMonto] = useState(false)

  // Buscar pacientes
  const searchPatients = async (term: string) => {
    if (term.length < 2) {
      setPatients([])
      return
    }

    try {
      const response = await fetch(`/api/patients?search=${encodeURIComponent(term)}`)
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      }
    } catch (error) {
      console.error("Error buscando pacientes:", error)
    }
  }

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchPatients(searchTerm)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Seleccionar paciente existente
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData((prev) => ({
      ...prev,
      paciente_id: patient.id,
      nombre: patient.first_name,
      apellido: patient.last_name,
      cedula: patient.cedula,
      fecha_nacimiento: patient.date_birth,
      genero: patient.gender,
      telefono: patient.phone,
      email: patient.email || "",
      direccion: patient.address || "",
      ocupacion: patient.occupation || "",
    }))
    setPatients([])
    setSearchTerm("")
  }

  // Actualizar el monto automáticamente cuando cambia el tratamiento
  useEffect(() => {
    if (formData.tratamiento && !isManualMonto) {
      const precio = treatmentPrices[formData.tratamiento] || 0
      setFormData((prev) => ({ ...prev, monto: precio.toString() }))
    }
  }, [formData.tratamiento, isManualMonto])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target

    // Si se está editando manualmente el monto, activar el flag
    if (id === "monto") {
      setIsManualMonto(true)
    }

    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleTreatmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tratamiento: value }))

    // Al cambiar el tratamiento, actualizar el monto automáticamente solo si no está en modo manual
    if (!isManualMonto) {
      const precio = treatmentPrices[value] || 0
      setFormData((prev) => ({ ...prev, tratamiento: value, monto: precio.toString() }))
    }
  }

  const handleResetMonto = () => {
    if (formData.tratamiento) {
      const precio = treatmentPrices[formData.tratamiento] || 0
      setFormData((prev) => ({ ...prev, monto: precio.toString() }))
      setIsManualMonto(false)
      toast({
        title: "Monto actualizado",
        description: "El monto ha sido actualizado según el tratamiento seleccionado",
      })
    }
  }

  const handleImageUpload = (file: File) => {
    setFormData((prev) => ({ ...prev, imagen: file }))
  }

  const handleImageRemove = () => {
    setFormData((prev) => ({ ...prev, imagen: null, imagen_url: null }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)

      console.log("=== INICIANDO GUARDADO DE PRESUPUESTO ===")
      console.log("Datos del formulario:", formData)

      // Validar campos obligatorios
      if (!formData.nombre || !formData.apellido || !formData.cedula || !formData.tratamiento || !formData.monto) {
        console.error("Campos faltantes:", {
          nombre: !formData.nombre,
          apellido: !formData.apellido,
          cedula: !formData.cedula,
          tratamiento: !formData.tratamiento,
          monto: !formData.monto,
        })

        toast({
          title: "Campos incompletos",
          description: "Por favor complete todos los campos obligatorios",
          variant: "destructive",
        })
        return
      }

      // Si hay una imagen, subirla primero
      let imagen_url = formData.imagen_url
      if (formData.imagen && !formData.imagen_url) {
        console.log("Subiendo imagen...")
        try {
          imagen_url = await uploadPresupuestoImage(formData.imagen)
          console.log("Imagen subida exitosamente:", imagen_url)
          console.log("imagen_url que se enviará a la API:", imagen_url)
        } catch (imageError) {
          console.error("Error subiendo imagen:", imageError)
          // Continuar sin imagen si falla la subida
        }
      }

      // Preparar datos para enviar a la API
      const presupuestoData = {
        nombre_paciente: formData.nombre.trim(),
        apellido_paciente: formData.apellido.trim(),
        cedula: formData.cedula.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        direccion: formData.direccion.trim(),
        tratamiento: formData.tratamiento,
        descripcion: formData.descripcion.trim(),
        monto: Number.parseFloat(formData.monto),
        imagen_url: imagen_url,
        estado: "pendiente",
      }

      console.log("Datos a enviar a la API:", presupuestoData)

      // Validar que el monto sea un número válido
      if (isNaN(presupuestoData.monto) || presupuestoData.monto <= 0) {
        toast({
          title: "Monto inválido",
          description: "Por favor ingrese un monto válido mayor a 0",
          variant: "destructive",
        })
        return
      }

      // Guardar presupuesto en la base de datos
      console.log("Enviando request a /api/presupuestos...")
      const response = await fetch("/api/presupuestos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(presupuestoData),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("Response text:", responseText)

      let savedPresupuesto
      try {
        savedPresupuesto = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Error parsing response:", parseError)
        throw new Error(`Error del servidor: ${response.status} - ${responseText}`)
      }

      if (!response.ok) {
        console.error("Error response:", savedPresupuesto)
        throw new Error(savedPresupuesto.error || `Error del servidor: ${response.status}`)
      }

      console.log("Presupuesto guardado exitosamente:", savedPresupuesto)

      toast({
        title: "¡Éxito!",
        description: "El presupuesto ha sido guardado exitosamente",
      })

      // Redirigir a la lista de presupuestos después de un breve delay
      setTimeout(() => {
        router.push("/presupuestos")
      }, 1000)
    } catch (error) {
      console.error("=== ERROR COMPLETO ===", error)
      toast({
        title: "Error al guardar",
        description: error instanceof Error ? error.message : "Error inesperado al guardar el presupuesto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
        <Link href="/presupuestos" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a Presupuestos</span>
        </Link>
        <h1 className="text-xl font-semibold ml-4">Nuevo Presupuesto</h1>
      </header>

      <main className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
          {/* Búsqueda de Paciente */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Buscar Paciente</h2>

              {!selectedPatient && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, apellido o cédula..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {patients.length > 0 && (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {patients.map((patient) => (
                        <div
                          key={patient.id}
                          className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                          onClick={() => handleSelectPatient(patient)}
                        >
                          <div className="font-medium">
                            {patient.first_name} {patient.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Cédula: {patient.cedula} | Teléfono: {patient.phone}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewPatientForm(true)}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Nuevo Paciente
                    </Button>
                  </div>
                </div>
              )}

              {selectedPatient && (
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Cédula: {selectedPatient.cedula} | Teléfono: {selectedPatient.phone}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(null)
                        setFormData((prev) => ({
                          ...prev,
                          paciente_id: "",
                          nombre: "",
                          apellido: "",
                          cedula: "",
                          fecha_nacimiento: "",
                          genero: "",
                          telefono: "",
                          email: "",
                          direccion: "",
                          ocupacion: "",
                        }))
                      }}
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datos del Cliente */}
          {(showNewPatientForm || selectedPatient) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Datos del Cliente</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="nombre">
                      Nombres <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      disabled={!!selectedPatient}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellido">
                      Apellidos <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      required
                      disabled={!!selectedPatient}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cedula">
                      Cédula <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      required
                      disabled={!!selectedPatient}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_nacimiento">
                      Fecha de Nacimiento <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fecha_nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      required
                      disabled={!!selectedPatient}
                    />
                  </div>
                  <div>
                    <Label htmlFor="genero">
                      Género <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.genero}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, genero: value }))}
                      disabled={!!selectedPatient}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Femenino</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="telefono">
                      Teléfono <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      disabled={!!selectedPatient}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!!selectedPatient}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ocupacion">Ocupación o Profesión</Label>
                    <Input
                      id="ocupacion"
                      value={formData.ocupacion}
                      onChange={handleChange}
                      disabled={!!selectedPatient}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      disabled={!!selectedPatient}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detalles del Presupuesto */}
          {(showNewPatientForm || selectedPatient) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Detalles del Presupuesto</h2>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="tratamiento">
                      Tratamiento <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.tratamiento} onValueChange={handleTreatmentChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tratamiento" />
                      </SelectTrigger>
                      <SelectContent>
                        {treatmentOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Detalles del tratamiento..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="monto">
                        Monto ($) <span className="text-red-500">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetMonto}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Actualizar monto
                      </Button>
                    </div>
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monto}
                      onChange={handleChange}
                      required
                      className={isManualMonto ? "border-yellow-500" : ""}
                    />
                    {isManualMonto && (
                      <p className="text-xs text-yellow-500 mt-1">
                        Monto editado manualmente. Puede actualizar al valor automático con el botón.
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Imagen de referencia (opcional)</Label>
                    <div className="mt-2">
                      <PresupuestoImageUploader
                        onImageUpload={handleImageUpload}
                        onImageRemove={handleImageRemove}
                        currentImage={formData.imagen_url}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones */}
          {(showNewPatientForm || selectedPatient) && (
            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" onClick={() => router.push("/presupuestos")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? "Guardando..." : "Guardar Presupuesto"}
              </Button>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}


