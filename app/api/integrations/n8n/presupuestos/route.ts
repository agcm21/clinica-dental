import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    console.log("=== API INTERNA: Recibiendo datos para enviar a n8n ===")
    console.log("Datos recibidos:", data)

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
          error: `Error de conectividad con n8n: ${fetchError instanceof Error ? fetch(error instanceof Error ? error.message : "Error desconocido") : 'Error desconocido'}`,
          details: fetchError instanceof Error ? fetchError.name : 'Unknown',
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error en API interna:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? (error instanceof Error ? error.message : "Error desconocido") : "Error inesperado",
        type: error instanceof Error ? error.name : "Unknown",
      },
      { status: 500 },
    )
  }
}






