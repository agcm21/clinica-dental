import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string): string {
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value
  return numValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")
}

// NUEVA FUNCIÓN: Usar la misma lógica que funciona en el odontograma
export async function uploadPresupuestoImage(file: File): Promise<string> {
  try {
    console.log("=== INICIANDO SUBIDA DE IMAGEN PRESUPUESTO ===")
    console.log("Archivo a subir:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Importar la función que SÍ funciona en el odontograma
    const { uploadTreatmentImage } = await import("@/lib/supabase-storage")

    // Usar la misma función pero con parámetros para presupuesto
    const result = await uploadTreatmentImage(file, "presupuesto", "presupuesto")

    console.log("=== IMAGEN SUBIDA EXITOSAMENTE ===")
    console.log("URL de la imagen:", result.url)

    return result.url
  } catch (error) {
    console.error("=== ERROR EN SUBIDA DE IMAGEN ===", error)
    throw error
  }
}

const treatments = [
  { value: "ortodoncia", label: "Ortodoncia" },
  { value: "implantes", label: "Implantes" },
  { value: "endodoncia", label: "Endodoncia" },
  { value: "estetica-dental", label: "Estética Dental" },
  { value: "periodoncia", label: "Periodoncia" },
  { value: "odontopediatria", label: "Odontopediatría" },
  { value: "protesis", label: "Prótesis" },
  { value: "cirugia-oral", label: "Cirugía Oral" },
  { value: "higiene-dental", label: "Higiene Dental" },
  { value: "radiografias-dentales", label: "Radiografías Dentales" },
  { value: "fluorizacion", label: "Fluorización" },
  { value: "selladores-dentales", label: "Selladores Dentales" },
  { value: "revision-dental", label: "Revisión Dental" },
  { value: "urgencias-dentales", label: "Urgencias Dentales" },
]

export function generatePresupuestoEmailContent(presupuesto: any, imageUrl?: string): string {
  const getTreatmentLabel = (value: string) => {
    const treatment = treatments.find((t) => t.value === value)
    return treatment ? treatment.label : value
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0051FF; margin-bottom: 10px;">Clínica Dental</h1>
        <p style="color: #777; font-size: 14px;">Su salud dental es nuestra prioridad</p>
      </div>
      
      <div style="margin-bottom: 25px;">
        <p style="margin-bottom: 10px;">Estimado/a <strong>${presupuesto.nombre} ${presupuesto.apellido}</strong>,</p>
        <p style="line-height: 1.5;">
          Nos complace presentarle el presupuesto solicitado para su tratamiento dental.
          A continuación encontrará los detalles del servicio y costos asociados.
        </p>
      </div>
      
      <div style="margin-bottom: 25px;">
        <h2 style="color: #0051FF; font-size: 18px; margin-bottom: 15px;">Detalles del presupuesto</h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 30%;">Tratamiento:</td>
              <td style="padding: 8px 0; font-weight: bold;">${getTreatmentLabel(presupuesto.tratamiento)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Descripción:</td>
              <td style="padding: 8px 0;">${presupuesto.descripcion || "No se proporcionó una descripción"}</td>
            </tr>
            ${
              imageUrl
                ? `
            <tr>
              <td colspan="2" style="padding: 15px 0;">
                <p style="color: #666; margin-bottom: 10px;">Imagen de referencia:</p>
                <img src="${imageUrl}" alt="Imagen de referencia" style="max-width: 100%; border-radius: 5px; border: 1px solid #eee;" />
              </td>
            </tr>
            `
                : ""
            }
            <tr>
              <td colspan="2" style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                <table style="width: 100%;">
                  <tr>
                    <td style="font-size: 18px; font-weight: bold;">Total:</td>
                    <td style="font-size: 18px; font-weight: bold; text-align: right;">$${formatCurrency(presupuesto.monto)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      </div>
      
      <div style="margin-bottom: 25px; line-height: 1.5;">
        <p>
          Este presupuesto tiene una validez de 30 días a partir de la fecha de emisión.
          Si tiene alguna pregunta o desea programar su tratamiento, no dude en contactarnos.
        </p>
      </div>
      
      <div style="text-align: center; font-size: 12px; color: #777; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="margin: 5px 0;">Clínica Dental</p>
        <p style="margin: 5px 0;">Dirección: Av. Principal #123</p>
        <p style="margin: 5px 0;">Teléfono: (123) 456-7890</p>
        <p style="margin: 5px 0;">Email: info@clinicadental.com</p>
      </div>
    </div>
  `
}

export function generatePresupuestoWhatsAppContent(presupuesto: any): string {
  const getTreatmentLabel = (value: string) => {
    const treatment = treatments.find((t) => t.value === value)
    return treatment ? treatment.label : value
  }

  return `🦷 *CLÍNICA DENTAL - PRESUPUESTO* 🦷

Hola *${presupuesto.nombre}*,

Le enviamos el presupuesto solicitado para su tratamiento dental:

*Tratamiento:* ${getTreatmentLabel(presupuesto.tratamiento)}
${presupuesto.descripcion ? `*Descripción:* ${presupuesto.descripcion}` : ""}
*Monto total:* $*${formatCurrency(presupuesto.monto)}*

Este presupuesto tiene una validez de 30 días. Para agendar su cita o más información, contáctenos al (123) 456-7890.

¡Gracias por confiar en nosotros!`
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
