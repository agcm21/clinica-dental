"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface PresupuestoImageUploaderProps {
  onImageUpload: (file: File) => void
  onImageRemove: () => void
  currentImage?: string | null
}

export function PresupuestoImageUploader({
  onImageUpload,
  onImageRemove,
  currentImage,
}: PresupuestoImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (file: File) => {
    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato no válido",
        description: "Por favor selecciona una imagen en formato JPG, PNG o WEBP",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Imagen demasiado grande",
        description: "El tamaño máximo permitido es 5MB",
        variant: "destructive",
      })
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Llamar al callback
    onImageUpload(file)
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageRemove()
  }

  return (
    <div className="w-full space-y-2">
      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("presupuesto-image")?.click()}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium">Arrastra y suelta una imagen o haz clic para seleccionarla</p>
            <p className="text-xs text-gray-500">Formatos: JPG, PNG, WEBP (máximo 5MB)</p>
          </div>
          <input
            id="presupuesto-image"
            type="file"
            accept="image/jpeg, image/png, image/jpg, image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative">
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img
              src={preview || "/placeholder.svg"}
              alt="Vista previa de imagen"
              className="w-full h-48 object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
