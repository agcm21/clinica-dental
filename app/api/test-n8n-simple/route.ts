import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { presupuestoId } = await request.json()

    if (!presupuestoId) {
      return NextResponse.json({ error: "presupuestoId es requerido" }, { status: 400 })
    }

    // 🔥 USA LA URL DE PRODUCCIÓN (no la de test)
    // Cambia esta URL por la que aparece en la pestaña "Production URL" de tu webhook
    const webhookUrl = "https://primary-production-46d3.up.railway.app/webhook/f91dd4a3-a4c2-4b87-afee-3ec1d66a737a"

    // Datos exactos que quieres probar
    const testData = {
      presupuestoId: presupuestoId,
      paciente: {
        nombre: "Jesus",
        apellido: "Nazareth",
        email: "totalautomatizacion@gmail.com",
        telefono: "584249094925",
      },
      presupuesto: {
        tratamiento: "limpieza",
        descripcion: "limpieza dental completa",
        monto: 75,
        imagen_url: "https://ejemplo.com/imagen.jpg",
      },
      metodo_envio: "whatsapp",
      callback_url: `http://localhost:3000/api/presupuestos/actualizar-estado/${presupuestoId}`,
    }

    console.log("=== PRUEBA N8N CON URL DE PRODUCCIÓN ===")
    console.log("URL del webhook (PRODUCCIÓN):", webhookUrl)
    console.log("Datos a enviar:", JSON.stringify(testData, null, 2))

    // Enviar a n8n
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Dental-App-Server/1.0",
      },
      body: JSON.stringify(testData),
    })

    console.log("Status de respuesta n8n:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error de n8n:", errorText)
      throw new Error(`Error en n8n: ${response.status} ${response.statusText}`)
    }

    let result
    try {
      result = await response.json()
    } catch (e) {
      result = await response.text()
    }

    console.log("Respuesta de n8n:", result)

    return NextResponse.json({
      success: true,
      message: "¡Datos enviados exitosamente a n8n!",
      n8nResponse: result,
      testData: testData,
    })
  } catch (error) {
    console.error("Error completo:", error)
    return NextResponse.json(
      {
        error: "Error al enviar a n8n: " + error.message,
      },
      { status: 500 },
    )
  }
}

