"use client"

import { useState } from "react"
import {
  FormField,
  FormLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select"

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
    <form>
      <FormField>
        <FormLabel>Nombre</FormLabel>
        <input type="text" value={patient.name} onChange={(e) => setPatient({ ...patient, name: e.target.value })} />
      </FormField>

      {/* Update the gender select component to use the options */}
      <FormField>
        <FormLabel>Género</FormLabel>
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
      </FormField>

      {/* Add blood type select component with options */}
      <FormField>
        <FormLabel>Grupo Sanguíneo</FormLabel>
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
      </FormField>

      {/* ... other form fields */}
      <button type="submit">Guardar</button>
    </form>
  )
}

export default NewPatientForm
