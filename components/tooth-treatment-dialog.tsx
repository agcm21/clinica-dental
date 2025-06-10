"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TreatmentDialogProps {
  toothNumber: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ToothTreatmentDialog({ toothNumber, open, onOpenChange }: TreatmentDialogProps) {
  const [selectedZone, setSelectedZone] = useState("")
  const [selectedTreatment, setSelectedTreatment] = useState("")
  const [treatmentDate, setTreatmentDate] = useState("")
  const [details, setDetails] = useState("")

  const toothZones = ["Vestibular", "Palatino/Lingual", "Mesial", "Distal", "Oclusal"]

  const treatmentTypes = ["Limpieza", "Empaste", "Extracción", "Endodoncia", "Corona", "Puente", "Implante"]

  const handleSave = () => {
    // Aquí irá la lógica para guardar el tratamiento
    console.log({
      toothNumber,
      selectedZone,
      selectedTreatment,
      treatmentDate,
      details,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tratamiento del diente {toothNumber}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Tratamientos Previos</Label>
            <div className="rounded-md border p-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">2/23/2025</span>
              </div>
              <p className="mt-1 text-muted-foreground">Lado Este - Limpieza: se realizó limpieza</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="zone">Zona del diente</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione la zona" />
                </SelectTrigger>
                <SelectContent>
                  {toothZones.map((zone) => (
                    <SelectItem key={zone} value={zone.toLowerCase()}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="treatment">Tipo de tratamiento</Label>
              <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo de tratamiento" />
                </SelectTrigger>
                <SelectContent>
                  {treatmentTypes.map((treatment) => (
                    <SelectItem key={treatment} value={treatment.toLowerCase()}>
                      {treatment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input type="date" id="date" value={treatmentDate} onChange={(e) => setTreatmentDate(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="details">Detalles de tratamiento</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Ingrese los detalles del tratamiento..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Estado del diente</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="secondary" className="w-full bg-green-500/50 text-white hover:bg-green-600/50">
                  Saludable
                </Button>
                <Button variant="secondary" className="w-full bg-blue-500/50 text-white hover:bg-blue-600/50">
                  Completado
                </Button>
                <Button variant="secondary" className="w-full bg-yellow-500/50 text-white hover:bg-yellow-600/50">
                  En Tratamiento
                </Button>
                <Button variant="secondary" className="w-full bg-red-500/50 text-white hover:bg-red-600/50">
                  Sin tratamiento
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Guardar Tratamiento</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
