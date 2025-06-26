import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    console.log("=== API INTERNA: Recibiendo datos para enviar a n8n ===")
    console.log("Datos recibidos:", data)

    // Construir la URL base de la aplicación Next.js dinámicamente
    // Esto asegura que la callback_url siempre apunte al dominio correcto (local o desplegado)
    // Original: const appBaseUrl = new URL(request.url).origin

    // NUEVO CÓDIGO
    const host = request.headers.get("x-forwarded-host") || request.url.split("/")[2]
    const protocol = request.headers.get("x-forwarded-proto") || "http"
    const appBaseUrl = `${protocol}://${host}`

    // Modificar la callback_url en los datos antes de enviarlos a n8n
    // Asumiendo que el presupuestoId está en data.presupuestoId o data.id
    const presupuestoId = data.presupuestoId || data.id // Asegúrate de usar el campo correcto
    if (presupuestoId) {
      // Usamos 'actualizar-respuesta' como el endpoint correcto para la respuesta del cliente
      data.callback_url = `${appBaseUrl}/api/presupuestos/actualizar-respuesta?id=${presupuestoId}` // Cambiado a query param
    } else {
      console.warn("presupuestoId no encontrado en los datos, la callback_url podría ser incorrecta.")
      // Si no hay presupuestoId, podrías optar por no enviar callback_url o usar una genérica
      // Por ahora, la dejamos como está si no se puede construir dinámicamente
    }

    console.log("Datos a enviar a n8n (con callback_url corregida):", data)

    // URL del webhook de n8n (PRODUCCIÓN - URL CORRECTA)
    const n8nWebhookUrl = "https://primary-production-46d3.up.railway.app/webhook/f91dd4a3-a4c2-4b87-afee-3ec1d66a737a"

    console.log("Enviando a n8n URL (PRODUCCIÓN):", n8nWebhookUrl)

    // Crear AbortController para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Dental-App-Server/1.0",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("Response status de n8n:", n8nResponse.status)

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text()
        console.error("Error de n8n:", errorText)
        return NextResponse.json({ error: `Error de n8n: ${n8nResponse.status} - ${errorText}` }, { status: 500 })
      }

      let n8nResult
      try {
        const responseText = await n8nResponse.text()
        console.log("Response text de n8n:", responseText)

        if (responseText) {
          n8nResult = JSON.parse(responseText)
        } else {
          n8nResult = { message: "Workflow ejecutado exitosamente" }
        }
      } catch (parseError) {
        console.log("No se pudo parsear como JSON, usando respuesta como texto")
        n8nResult = { message: "Workflow ejecutado exitosamente" }
      }

      console.log("Respuesta exitosa de n8n:", n8nResult)

      return NextResponse.json({
        success: true,
        message: "Enviado exitosamente a n8n",
        n8nResponse: n8nResult,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("Timeout al conectar con n8n")
        return NextResponse.json({ error: "Timeout al conectar con n8n (30s)" }, { status: 504 })
      }

      console.error("Error de fetch a n8n:", fetchError)

      return NextResponse.json(
        {
          error: `Error de conectividad con n8n: ${fetchError instanceof Error ? fetchError.message : "Error desconocido"}`,
          details: fetchError instanceof Error ? fetchError.name : "Unknown",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error en API interna:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error inesperado",
        type: error instanceof Error ? error.name : "Unknown",
      },
      { status: 500 },
    )
  }
}
