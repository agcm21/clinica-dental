"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface TreatmentImagesDialogProps {
  images: Array<{ url: string; path: string }>
  open: boolean
  onOpenChange: (open: boolean) => void
  initialIndex?: number
  treatmentInfo?: {
    toothNumber: number
    date: string
    treatmentType: string
  }
}

export function TreatmentImagesDialog({
  images,
  open,
  onOpenChange,
  initialIndex = 0,
  treatmentInfo,
}: TreatmentImagesDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  if (!images || images.length === 0) {
    return null
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
        <DialogHeader className="absolute top-0 right-0 z-10 m-2">
          <DialogTitle className="sr-only">
            {treatmentInfo 
              ? `Imágenes del tratamiento para diente ${treatmentInfo.toothNumber}` 
              : "Imágenes del tratamiento"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </DialogHeader>

        {treatmentInfo && (
          <div className="absolute top-0 left-0 z-10 m-4 bg-black/50 text-white p-2 rounded-md">
            <p className="text-sm">Diente {treatmentInfo.toothNumber}</p>
            <p className="text-xs">
              {treatmentInfo.date} - {treatmentInfo.treatmentType}
            </p>
          </div>
        )}

        <div className="relative w-full h-[80vh]">
          <Image
            src={images[currentIndex]?.url || "/placeholder.svg"}
            alt={`Imagen ${currentIndex + 1} de ${images.length} - Tratamiento dental`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 800px"
            crossOrigin="anonymous"
            onError={(e) => {
              const img = e.target as HTMLImageElement
              img.src = "/placeholder.svg"
            }}
          />

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={handlePrevious}
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={handleNext}
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Ver imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}