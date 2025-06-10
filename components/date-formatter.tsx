"use client"

interface DateFormatterProps {
  date: string | Date
  format?: "short" | "medium" | "long"
}

export function DateFormatter({ date, format = "medium" }: DateFormatterProps) {
  if (!date) return <span>Fecha no disponible</span>

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date

    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return <span>Fecha inválida</span>
    }

    const options: Intl.DateTimeFormatOptions =
      format === "short"
        ? { day: "numeric", month: "short", year: "numeric" }
        : format === "long"
          ? { day: "numeric", month: "long", year: "numeric", weekday: "long" }
          : { day: "numeric", month: "short", year: "numeric" }

    return <span>{dateObj.toLocaleDateString("es-ES", options)}</span>
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return <span>Error en fecha</span>
  }
}
