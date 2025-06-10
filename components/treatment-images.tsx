"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface TreatmentImagesProps {
  images: Array<{
    url: string
    path: string
    name: string
  }>
  onImagesChange?: (images: File[]) => Promise<void>
  maxImages?: number
  disabled?: boolean
}

export function TreatmentImages({
  images = [],
  onImagesChange,
  maxImages = 5,
  disabled = false,
}: TreatmentImagesProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !onImagesChange) return

    const files = Array.from(event.target.files)
    const currentCount = images.length
    const remainingSlots = maxImages - currentCount

    if (files.length > remainingSlots) {
      toast({
        title: "Error",
        description: `Solo puedes subir ${remainingSlots} imagen${remainingSlots !== 1 ? "es" : ""} más`,
        variant: "destructive",
      })
      return
    }

    // Validar tamaño de archivos
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast({
        title: "Error",
        description: "Algunos archivos exceden el tamaño máximo de 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      await onImagesChange(files)
      toast({
        title: "Éxito",
        description: "Imágenes subidas correctamente",
      })
    } catch (error) {
      console.error("Error al subir imágenes:", error)
      toast({
        title: "Error",
        description: "Error al subir las imágenes",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Limpiar el input
      event.target.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Imágenes ({images.length}/{maxImages})
        </h3>
        {onImagesChange && !disabled && images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Subiendo...
              </span>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir imagen
              </>
            )}
          </Button>
        )}
        <input
          id="image-upload"
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          disabled={disabled || isUploading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image, index) => (
          <div key={image.path} className="relative aspect-square">
            <Image
              src={image.url || "/placeholder.svg"}
              alt={image.name || `Imagen ${index + 1}`}
              fill
              className="rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
              onClick={() => {
                // Implementar eliminación de imagen
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
