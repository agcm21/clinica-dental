import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const accion = searchParams.get("accion")

    // LOGS PARA DIAGNOSTICAR
    console.log("=== ENDPOINT ACTUALIZAR-RESPUESTA ===")
    console.log("URL completa:", request.url)
    console.log("Parámetros recibidos:", { id, accion })

    // Validar parámetros (SIN TOKEN)
    if (!id || !accion) {
      console.log("ERROR: Faltan parámetros")
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    // Mapear acción a respuesta_cliente
    let respuestaCliente
    switch (accion) {
      case "aceptar":
        respuestaCliente = "aprobado"
        break
      case "rechazar":
        respuestaCliente = "pendiente"
        break
      case "no_aprobado":
        respuestaCliente = "rechazado"
        break
      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }

    console.log("Actualizando BD con:", { id, respuestaCliente })

    // Actualizar en Supabase
    const { data, error } = await supabase
      .from("presupuestos")
      .update({ respuesta_cliente: respuestaCliente })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error al actualizar respuesta:", error)
      return NextResponse.json({ error: "Error al actualizar la respuesta" }, { status: 500 })
    }

    console.log("BD actualizada exitosamente:", data)

    // Redirigir a una página de confirmación
    return NextResponse.redirect(
      new URL(`https://dental-clinic-test.loca.lt/presupuestos/respuesta-confirmada?accion=${accion}`, request.url),
    )
  } catch (error) {
    console.error("Error en el endpoint:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
