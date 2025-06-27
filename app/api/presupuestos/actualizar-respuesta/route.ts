import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET - Actualizar un presupuesto (usado por n8n para el callback)
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const accion = searchParams.get("accion")

    // LOGS PARA DIAGNOSTICAR
    console.log("=== ENDPOINT ACTUALIZAR-RESPUESTA (GET) ===")
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
        respuestaCliente = "Pendiente" // Corregido a 'P' mayúscula
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
      return NextResponse.json({ error: "Error al actualizar la respuesta en la base de datos" }, { status: 500 })
    }

    // Si no se encontró ninguna fila para actualizar (data está vacío)
    if (!data || data.length === 0) {
      console.log("ADVERTENCIA: No se encontró el presupuesto con ID:", id, "para actualizar.")
      return NextResponse.json({ error: "Presupuesto no encontrado o ya actualizado" }, { status: 404 })
    }

    console.log("BD actualizada exitosamente:", data)

    // Obtener la URL base de la aplicación desde las variables de entorno
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || new URL(request.url).origin
    console.log("Redirigiendo a URL base:", appBaseUrl)
    // Redirigir a una página de confirmación
    return NextResponse.redirect(new URL(`/presupuestos/respuesta-confirmada?accion=${accion}`, appBaseUrl))
  } catch (error) {
    console.error("Error en el endpoint:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Actualizar un presupuesto (añadido para compatibilidad con n8n)
export async function POST(request: NextRequest) {
  try {
    // Obtener parámetros del cuerpo de la solicitud (si se envían como JSON)
    // O de los query parameters si n8n los envía así en POST
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const accion = searchParams.get("accion")

    // Si no vienen en query params, intentar leer del cuerpo JSON
    let requestBody: { id?: string; accion?: string } = {}
    try {
      requestBody = await request.json()
    } catch (e) {
      // No hay cuerpo JSON o no es válido, se ignorará
      console.log("No se pudo parsear el cuerpo JSON para POST, usando solo query params.")
    }

    const finalId = id || requestBody.id
    const finalAccion = accion || requestBody.accion

    console.log("=== ENDPOINT ACTUALIZAR-RESPUESTA (POST) ===")
    console.log("URL completa:", request.url)
    console.log("Parámetros recibidos (query):", { id, accion })
    console.log("Cuerpo de la solicitud (JSON):", requestBody)
    console.log("Parámetros finales:", { finalId, finalAccion })

    // Validar parámetros
    if (!finalId || !finalAccion) {
      console.log("ERROR: Faltan parámetros")
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    // Mapear acción a respuesta_cliente
    let respuestaCliente
    switch (finalAccion) {
      case "aceptar":
        respuestaCliente = "aprobado"
        break
      case "rechazar":
        respuestaCliente = "Pendiente" // Corregido a 'P' mayúscula
        break
      case "no_aprobado":
        respuestaCliente = "rechazado"
        break
      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }

    console.log("Actualizando BD con:", { finalId, respuestaCliente })

    // Actualizar en Supabase
    const { data, error } = await supabase
      .from("presupuestos")
      .update({ respuesta_cliente: respuestaCliente })
      .eq("id", finalId)
      .select()

    if (error) {
      console.error("Error al actualizar respuesta:", error)
      return NextResponse.json({ error: "Error al actualizar la respuesta en la base de datos" }, { status: 500 })
    }

    // Si no se encontró ninguna fila para actualizar (data está vacío)
    if (!data || data.length === 0) {
      console.log("ADVERTENCIA: No se encontró el presupuesto con ID:", finalId, "para actualizar.")
      return NextResponse.json({ error: "Presupuesto no encontrado o ya actualizado" }, { status: 404 })
    }

    console.log("BD actualizada exitosamente:", data)

    // Obtener la URL base de la aplicación desde las variables de entorno
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || new URL(request.url).origin
    console.log("Redirigiendo a URL base:", appBaseUrl)
    // Redirigir a una página de confirmación
    return NextResponse.redirect(new URL(`/presupuestos/respuesta-confirmada?accion=${finalAccion}`, appBaseUrl))
  } catch (error) {
    console.error("Error en el endpoint:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
