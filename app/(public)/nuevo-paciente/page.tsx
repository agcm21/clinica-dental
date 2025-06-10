"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { createPatient } from "./actions"

interface FormData {
  first_name: string
  last_name: string
  cedula: string
  date_birth: string
  gender: string
  phone: string
  email: string
  address: string
  occupation: string
  blood_type: string
  chronic_diseases: string
  medications: string
  allergies: string
  pregnant: string
  contagious_disease: string
}

export default function AgregarPacientePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    cedula: "",
    date_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    occupation: "",
    blood_type: "",
    chronic_diseases: "",
    medications: "",
    allergies: "",
    pregnant: "no",
    contagious_disease: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convertir los datos del formulario al formato esperado por la API
      const patientData = {
        ...formData,
        pregnant: formData.pregnant === "si", // Convertir string a boolean
      }

      // Usar el Server Action
      const result = await createPatient(patientData)

      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message || "Paciente guardado correctamente",
        })

        // Redirigir a la lista de pacientes
        router.push("/pacientes")
      } else {
        // Si hay un error, mostrar el mensaje
        console.error("Error al guardar:", result.error)
        toast({
          title: "Error",
          description: result.error || "Error al guardar el paciente",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      toast({
        title: "Error",
        description: "Error inesperado al guardar el paciente",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
        <Link href="/pacientes" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a Pacientes</span>
        </Link>
        <h1 className="text-xl font-semibold ml-4">Agregar Paciente</h1>
      </header>

      <main className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">1. Datos Personales</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="first_name">Nombres</Label>
                  <Input id="first_name" value={formData.first_name} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="last_name">Apellidos</Label>
                  <Input id="last_name" value={formData.last_name} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="cedula">Cédula</Label>
                  <Input id="cedula" value={formData.cedula} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="date_birth">Fecha de Nacimiento</Label>
                  <Input id="date_birth" type="date" value={formData.date_birth} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="gender">Género</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="occupation">Ocupación o Profesión</Label>
                  <Input id="occupation" value={formData.occupation} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">2. Antecedentes Médicos</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="blood_type">Tipo de Sangre</Label>
                  <Select
                    value={formData.blood_type}
                    onValueChange={(value) => handleSelectChange("blood_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo de sangre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="chronic_diseases">Enfermedad Crónica</Label>
                  <Select
                    value={formData.chronic_diseases}
                    onValueChange={(value) => handleSelectChange("chronic_diseases", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione enfermedad crónica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ninguna">Ninguna</SelectItem>
                      <SelectItem value="diabetes">Diabetes</SelectItem>
                      <SelectItem value="hipertension">Hipertensión Arterial</SelectItem>
                      <SelectItem value="cardiopatia">Cardiopatía</SelectItem>
                      <SelectItem value="artritis">Artritis Reumatoide</SelectItem>
                      <SelectItem value="lupus">Lupus</SelectItem>
                      <SelectItem value="insuficiencia_renal">Insuficiencia Renal</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="medications">Medicamentos Actuales</Label>
                  <Textarea
                    id="medications"
                    placeholder="Liste los medicamentos que toma actualmente..."
                    value={formData.medications}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="allergies">Alergias</Label>
                  <Select value={formData.allergies} onValueChange={(value) => handleSelectChange("allergies", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione alergia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ninguna">Ninguna</SelectItem>
                      <SelectItem value="penicilina">Penicilina</SelectItem>
                      <SelectItem value="latex">Látex</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="pregnant">¿Está embarazada?</Label>
                  <Select value={formData.pregnant} onValueChange={(value) => handleSelectChange("pregnant", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="si">Sí</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="contagious_disease">Enfermedad Contagiosa</Label>
                  <Select
                    value={formData.contagious_disease}
                    onValueChange={(value) => handleSelectChange("contagious_disease", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione enfermedad contagiosa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ninguna">Ninguna</SelectItem>
                      <SelectItem value="covid19">COVID-19</SelectItem>
                      <SelectItem value="hepatitis">Hepatitis</SelectItem>
                      <SelectItem value="tuberculosis">Tuberculosis</SelectItem>
                      <SelectItem value="vih">VIH</SelectItem>
                      <SelectItem value="herpes">Herpes</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.push("/pacientes")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Paciente"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
