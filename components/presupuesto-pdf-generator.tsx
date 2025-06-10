"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"

interface PresupuestoPdfGeneratorProps {
  presupuesto: any
}

export function PresupuestoPdfGenerator({ presupuesto }: PresupuestoPdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePdf = async () => {
    try {
      setIsGenerating(true)

      // En un entorno real, usaríamos una biblioteca como jsPDF, html2canvas,
      // o haríamos una petición a un servidor para generar el PDF

      // Simulamos la generación por ahora
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Esta es una simulación básica. En producción, se usaría una API
      // para generar el PDF o se generaría mediante bibliotecas como jsPDF
      const pdfBlob = new Blob(
        [
          `Presupuesto Dental\n\n` +
            `Cliente: ${presupuesto.nombre} ${presupuesto.apellido}\n` +
            `Cédula: ${presupuesto.cedula}\n` +
            `Tratamiento: ${presupuesto.tratamiento}\n` +
            `Monto: $${formatCurrency(presupuesto.monto)}\n`,
        ],
        { type: "application/pdf" },
      )

      // Crear una URL para descargar el blob
      const url = URL.createObjectURL(pdfBlob)

      // Crear un enlace y simular clic para descargar
      const link = document.createElement("a")
      link.href = url
      link.download = `Presupuesto-${presupuesto.id || "nuevo"}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Liberar la URL del objeto
      URL.revokeObjectURL(url)

      toast({
        title: "PDF generado",
        description: "El PDF del presupuesto ha sido generado correctamente",
      })
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el PDF del presupuesto",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={generatePdf} disabled={isGenerating} variant="outline" className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      {isGenerating ? "Generando..." : "Descargar PDF"}
    </Button>
  )
}
