import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { presupuestoId } = await request.json()

    if (!presupuestoId) {
      return NextResponse.json({ error: "presupuestoId es requerido" }, { status: 400 })
    }

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
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/presupuestos/actualizar-estado/${presupuestoId}`,
    }

    console.log("Variables de entorno disponibles:")
    console.log("NEXT_PUBLIC_N8N_PRESUPUESTO_WEBHOOK:", process.env.NEXT_PUBLIC_N8N_PRESUPUESTO_WEBHOOK)
    console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL)

    if (!process.env.NEXT_PUBLIC_N8N_PRESUPUESTO_WEBHOOK) {
      return NextResponse.json(
        {
          error: "NEXT_PUBLIC_N8N_PRESUPUESTO_WEBHOOK no está configurado",
          availableEnvVars: Object.keys(process.env).filter((key) => key.startsWith("NEXT_PUBLIC")),
          testData: testData,
        },
        { status: 500 },
      )
    }

    console.log("Enviando datos de prueba a n8n:", JSON.stringify(testData, null, 2))

    // Enviar a n8n
    const response = await fetch(process.env.NEXT_PUBLIC_N8N_PRESUPUESTO_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error en n8n: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: "Datos enviados exitosamente a n8n",
      n8nResponse: result,
      testData: testData,
    })
  } catch (error) {
    console.error("Error en prueba de n8n:", error)
    return NextResponse.json(
      {
        error: "Error al enviar a n8n: " + error.message,
        details: error.stack,
      },
      { status: 500 },
    )
  }
}

