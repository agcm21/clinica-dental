"use client"

import { useEffect, useState } from "react"

export function PresupuestosVerificador() {
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const verificarTabla = async () => {
      try {
        // Intentamos hacer una operación simple en la tabla presupuestos
        const response = await fetch("/api/presupuestos/stats")

        if (!response.ok) {
          // Si hay un error, no mostramos nada al usuario para no interrumpir la experiencia
          console.error("Error al verificar estadísticas de presupuestos")
        }
      } catch (error) {
        console.error("Error al verificar tabla:", error)
      } finally {
        setIsVerifying(false)
      }
    }

    verificarTabla()
  }, [])

  return null
}
