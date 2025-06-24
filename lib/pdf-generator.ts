import { formatCurrency } from "./utils"
import { treatmentOptions } from "./treatment-prices"

export async function generatePresupuestoPDF(presupuesto: any): Promise<string> {
  try {
    // Importación dinámica para evitar errores de SSR
    const { jsPDF } = await import("jspdf")

    const pdf = new jsPDF()

    // Configuración de fuentes y colores
    const primaryColor = [0, 81, 255] // Azul de la clínica
    const grayColor = [128, 128, 128]
    const blackColor = [0, 0, 0]

    // Función helper para obtener el label del tratamiento
    const getTreatmentLabel = (value: string) => {
      const treatment = treatmentOptions.find((t) => t.value === value)
      return treatment ? treatment.label : value
    }

    // Header - Título principal
    pdf.setFontSize(20)
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.text("PRESUPUESTO DENTAL", 105, 25, { align: "center" })

    // Número de presupuesto
    pdf.setFontSize(10)
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    const presupuestoNum = presupuesto.id?.substring(0, 8) || "TEMP-" + Date.now().toString().substring(0, 8)
    pdf.text(`No. ${presupuestoNum}`, 105, 32, { align: "center" })

    // Línea separadora
    pdf.setDrawColor(grayColor[0], grayColor[1], grayColor[2])
    pdf.line(20, 40, 190, 40)

    // DATOS DEL PACIENTE
    let yPos = 55
    pdf.setFontSize(10)
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    pdf.text("DATOS DEL PACIENTE", 20, yPos)

    yPos += 8
    pdf.setTextColor(blackColor[0], blackColor[1], blackColor[2])
    pdf.setFontSize(9)
    pdf.text(`Nombre: ${presupuesto.nombre} ${presupuesto.apellido}`, 20, yPos)

    yPos += 6
    pdf.text(`Cédula: ${presupuesto.cedula}`, 20, yPos)

    yPos += 6
    pdf.text(`Teléfono: ${presupuesto.telefono}`, 20, yPos)

    if (presupuesto.email) {
      yPos += 6
      pdf.text(`Email: ${presupuesto.email}`, 20, yPos)
    }

    // DATOS DEL PRESUPUESTO (lado derecho)
    let yPosRight = 55
    pdf.setFontSize(10)
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    pdf.text("DATOS DEL PRESUPUESTO", 110, yPosRight)

    yPosRight += 8
    pdf.setTextColor(blackColor[0], blackColor[1], blackColor[2])
    pdf.setFontSize(9)
    pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, 110, yPosRight)

    yPosRight += 6
    pdf.text("Validez: 30 días", 110, yPosRight)

    yPosRight += 6
    pdf.text("Método de pago: Efectivo, tarjeta o transferencia", 110, yPosRight)

    // DETALLE DEL PRESUPUESTO
    yPos = Math.max(yPos, yPosRight) + 20
    pdf.setFontSize(10)
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    pdf.text("DETALLE DEL PRESUPUESTO", 20, yPos)

    // Tabla de presupuesto
    yPos += 10

    // Headers de la tabla
    pdf.setFillColor(240, 240, 240)
    pdf.rect(20, yPos, 170, 8, "F")
    pdf.setDrawColor(200, 200, 200)
    pdf.rect(20, yPos, 170, 8)
    pdf.rect(20, yPos, 70, 8)
    pdf.rect(90, yPos, 70, 8)
    pdf.rect(160, yPos, 30, 8)

    pdf.setFontSize(9)
    pdf.setTextColor(blackColor[0], blackColor[1], blackColor[2])
    pdf.text("Concepto", 22, yPos + 5)
    pdf.text("Descripción", 92, yPos + 5)
    pdf.text("Monto", 162, yPos + 5)

    // Fila de datos
    yPos += 8
    pdf.rect(20, yPos, 170, 10)
    pdf.rect(20, yPos, 70, 10)
    pdf.rect(90, yPos, 70, 10)
    pdf.rect(160, yPos, 30, 10)

    pdf.text(getTreatmentLabel(presupuesto.tratamiento), 22, yPos + 6)
    pdf.text(presupuesto.descripcion || "Tratamiento dental", 92, yPos + 6)
    pdf.text(`$${formatCurrency(presupuesto.monto)}`, 162, yPos + 6)

    // Fila total
    yPos += 10
    pdf.setFillColor(248, 248, 248)
    pdf.rect(20, yPos, 170, 10, "F")
    pdf.rect(20, yPos, 170, 10)
    pdf.rect(20, yPos, 130, 10)
    pdf.rect(150, yPos, 40, 10)

    pdf.setFont("helvetica", "bold")
    pdf.text("TOTAL", 22, yPos + 6)
    pdf.text(`$${formatCurrency(presupuesto.monto)}`, 152, yPos + 6)
    pdf.setFont("helvetica", "normal")

    // NOTAS
    yPos += 25
    pdf.setFontSize(10)
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    pdf.text("NOTAS", 20, yPos)

    yPos += 8
    pdf.setFontSize(8)
    pdf.setTextColor(blackColor[0], blackColor[1], blackColor[2])
    const notasText =
      "Este presupuesto no incluye tratamientos adicionales que pudieran ser necesarios durante el proceso. La tarifa puede variar si las condiciones del tratamiento cambian."
    const splitNotes = pdf.splitTextToSize(notasText, 170)
    pdf.text(splitNotes, 20, yPos)

    // Footer
    yPos = 270
    pdf.setDrawColor(grayColor[0], grayColor[1], grayColor[2])
    pdf.line(20, yPos, 190, yPos)

    yPos += 8
    pdf.setFontSize(8)
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    pdf.text("Clínica Dental - Av. Principal #123 - (123) 456-7890 - info@clinicadental.com", 105, yPos, {
      align: "center",
    })

    // Convertir a base64
    const pdfBase64 = pdf.output("datauristring")
    return pdfBase64
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

