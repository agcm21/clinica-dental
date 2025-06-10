"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function RespuestaConfirmadaPage() {
  const searchParams = useSearchParams()
  const accion = searchParams.get("accion")
  const [mensaje, setMensaje] = useState("")
  const [titulo, setTitulo] = useState("")

  useEffect(() => {
    // Configurar mensaje según la acción
    switch (accion) {
      case "aceptar":
        setTitulo("¡Gracias por aprobar el presupuesto!")
        setMensaje("Nos pondremos en contacto con usted a la brevedad para coordinar su cita.")
        break
      case "rechazar":
        setTitulo("Gracias por su respuesta")
        setMensaje("Entendemos que necesita más tiempo para decidir. El presupuesto seguirá vigente por 30 días.")
        break
      case "no_aprobado":
        setTitulo("Respuesta recibida")
        setMensaje(
          "Hemos registrado que no desea proceder con este presupuesto. Si desea una alternativa, no dude en contactarnos.",
        )
        break
      default:
        setTitulo("Respuesta registrada")
        setMensaje("Gracias por su respuesta.")
    }
  }, [accion])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{titulo}</h1>
          <p className="mt-2 text-gray-600">{mensaje}</p>
        </div>
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-4">Puede cerrar esta ventana con seguridad.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ir a la página principal
          </Link>
        </div>
      </div>
    </div>
  )
}
