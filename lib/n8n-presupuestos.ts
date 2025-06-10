import { supabase } from "./supabase"

/**
 * Envía un presupuesto a n8n para su procesamiento
 * @param presupuestoId ID del presupuesto a enviar
 * @param method Método de envío: "email", "whatsapp" o "both"
 * @returns Respuesta de n8n
 */
export async function sendPresupuestoToN8n(presupuestoId: string, method: string) {
  try {
    // URL del webhook de n8n
    const n8nWebhookUrl =
      process.env.NEXT_PUBLIC_N8N_PRESUPUESTO_WEBHOOK || "https://n8n.example.com/webhook/presupuesto"

    // Si estamos en desarrollo, podemos simular el envío
    if (process.env.NODE_ENV === "development" || !n8nWebhookUrl.includes("webhook")) {
      console.log("Simulando envío a n8n:", { presupuestoId, method })

      // Actualizar el estado en la base de datos
      await supabase
        .from("presupuestos")
        .update({
          metodo_envio: method,
          fecha_envio: new Date().toISOString(),
        })
        .eq("id", presupuestoId)

      // Simular respuesta
      return {
        success: true,
        message: `[Simulación] Presupuesto ${presupuestoId} enviado por ${method}`,
      }
    }

    // Enviar a n8n
    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: presupuestoId,
        method: method,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Error al enviar a n8n: ${response.status} ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error al enviar presupuesto a n8n:", error)
    throw error
  }
}

/**
 * Configura un webhook para que n8n pueda actualizar el estado de los presupuestos
 * Este método devuelve la URL que se debe configurar en n8n
 */
export function getPresupuestoWebhookUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}/api/integrations/n8n/presupuestos`
}

/**
 * Genera una demostración de flujo de n8n para presupuestos
 * Esto es útil para mostrar al usuario cómo configurar n8n
 */
export function generateN8nWorkflowDemo() {
  return {
    name: "Procesar Presupuestos Dentales",
    nodes: [
      {
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        position: [200, 300],
        parameters: {
          path: "presupuesto",
          responseMode: "responseNode",
        },
      },
      {
        name: "Preparar Email",
        type: "n8n-nodes-base.set",
        position: [420, 200],
        parameters: {
          values: {
            string: [
              {
                name: "asunto",
                value: '=Presupuesto Dental - {{$json["tratamiento"]}}',
              },
              {
                name: "destinatario",
                value: '={{$json["email"]}}',
              },
            ],
          },
        },
      },
      {
        name: "Preparar WhatsApp",
        type: "n8n-nodes-base.set",
        position: [420, 400],
        parameters: {
          values: {
            string: [
              {
                name: "mensaje",
                value:
                  '=🦷 *CLÍNICA DENTAL*\nHola {{$json["nombre"]}}, adjuntamos el presupuesto para {{$json["tratamiento"]}} por un total de ${{$json["monto"]}}.',
              },
              {
                name: "telefono",
                value: '={{$json["telefono"]}}',
              },
            ],
          },
        },
      },
      {
        name: "Enviar Email",
        type: "n8n-nodes-base.emailSend",
        position: [640, 200],
        parameters: {
          to: '={{$node["Preparar Email"].json["destinatario"]}}',
          subject: '={{$node["Preparar Email"].json["asunto"]}}',
          text: '=Estimado/a {{$json["nombre"]}} {{$json["apellido"]}},\n\nAdjuntamos el presupuesto para {{$json["tratamiento"]}} por un total de ${{$json["monto"]}}.\n\nAtentamente,\nClínica Dental',
        },
      },
      {
        name: "Actualizar Estado",
        type: "n8n-nodes-base.httpRequest",
        position: [860, 300],
        parameters: {
          url: '={{$env["DENTAL_APP_URL"]}}/api/integrations/n8n/presupuestos',
          method: "PUT",
          jsonParameters: true,
          bodyParameters: {
            parameters: [
              {
                name: "id",
                value: '={{$json["id"]}}',
              },
              {
                name: "estado",
                value: "enviado",
              },
            ],
          },
        },
      },
      {
        name: "Respuesta",
        type: "n8n-nodes-base.respondToWebhook",
        position: [1080, 300],
        parameters: {
          responseBody: '={{ {success: true, message: "Presupuesto procesado"} }}',
          options: {},
        },
      },
    ],
    connections: {
      Webhook: {
        main: [
          [
            {
              node: "Preparar Email",
              type: "main",
              index: 0,
            },
            {
              node: "Preparar WhatsApp",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Preparar Email": {
        main: [
          [
            {
              node: "Enviar Email",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Preparar WhatsApp": {
        main: [
          [
            {
              node: "Actualizar Estado",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Enviar Email": {
        main: [
          [
            {
              node: "Actualizar Estado",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "Actualizar Estado": {
        main: [
          [
            {
              node: "Respuesta",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
    },
  }
}
