"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

interface PresupuestoRespuestaSelectProps {
  presupuestoId: string
  defaultValue?: string
}

export function PresupuestoRespuestaSelect({
  presupuestoId,
  defaultValue = "Pendiente",
}: PresupuestoRespuestaSelectProps) {
  const [value, setValue] = useState(defaultValue)
  const [isLoading, setIsLoading] = useState(false)

  const handleValueChange = async (newValue: string) => {
    setIsLoading(true)
    setValue(newValue)

    try {
      const response = await fetch("/api/presupuestos/respuesta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          presupuestoId,
          respuesta: newValue,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la respuesta")
      }

      toast({
        title: "Respuesta actualizada",
        description: `El estado ha sido actualizado a "${newValue}"`,
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la respuesta",
        variant: "destructive",
      })
      setValue(defaultValue)
    } finally {
      setIsLoading(false)
    }
  }

  const getTriggerColorClass = (status: string) => {
    switch (status) {
      case "Aprobado":
        return "bg-green-100 text-green-800 border-green-200"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Rechazado":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return ""
    }
  }

  return (
    <Select value={value} onValueChange={handleValueChange} disabled={isLoading}>
      <SelectTrigger className={`w-[130px] ${getTriggerColorClass(value)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Aprobado" className="text-green-800 bg-green-100 hover:bg-green-200">
          Aprobado
        </SelectItem>
        <SelectItem value="Pendiente" className="text-yellow-800 bg-yellow-100 hover:bg-yellow-200">
          Pendiente
        </SelectItem>
        <SelectItem value="Rechazado" className="text-red-800 bg-red-100 hover:bg-red-200">
          Rechazado
        </SelectItem>
      </SelectContent>
    </Select>
  )
}


