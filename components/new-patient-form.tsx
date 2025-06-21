"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface Patient {
  name: string
  gender: string
  blood_type: string
  // ... other patient properties
}

const NewPatientForm = () => {
  const [patient, setPatient] = useState<Patient>({
    name: "",
    gender: "",
    blood_type: "",
    // ... other patient properties
  })

  // Add the blood type options
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  // Add gender options
  const genderOptions = [
    { value: "male", label: "Masculino" },
    { value: "female", label: "Femenino" },
    { value: "other", label: "Otro" },
  ]

  return (
    <form className="space-y-6 p-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          type="text"
          value={patient.name}
          onChange={(e) => setPatient({ ...patient, name: e.target.value })}
          placeholder="Ingrese el nombre completo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Género</Label>
        <Select value={patient.gender} onValueChange={(value) => setPatient({ ...patient, gender: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione el género" />
          </SelectTrigger>
          <SelectContent>
            {genderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="blood-type">Grupo Sanguíneo</Label>
        <Select
          value={patient.blood_type || ""}
          onValueChange={(value) => setPatient({ ...patient, blood_type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione el grupo sanguíneo" />
          </SelectTrigger>
          <SelectContent>
            {bloodTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        Guardar Paciente
      </Button>
    </form>
  )
}

export default NewPatientForm
