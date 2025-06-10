import { NextResponse } from "next/server"
import { getWebhookUrls } from "@/lib/integration-config"

export async function GET() {
  const webhookUrls = getWebhookUrls()

  const workflowExample = {
    name: "Presupuestos Clínica Dental",
    nodes: [
      {
        parameters: {
          path: "presupuesto-dental",
          options: {},
        },
        id: "webhook1",
        name: "Webhook - Recibir Presupuesto",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [200, 300],
        webhookId: "presupuesto-dental",
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{$json["method"]}}',
                operation: "equal",
                value2: "email",
              },
            ],
          },
        },
        id: "if1",
        name: "¿Enviar por Email?",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [400, 200],
      },
      {
        parameters: {
          conditions: {
            string: [
              {
                value1: '={{$json["method"]}}',
                operation: "equal",
                value2: "whatsapp",
              },
            ],
          },
        },
        id: "if2",
        name: "¿Enviar por WhatsApp?",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [400, 400],
      },
      {
        parameters: {
          to: '={{$json["email"]}}',
          subject: '=Presupuesto Dental - {{$json["tratamiento"]}}',
          emailType: "html",
          message:
            '=<h2>Presupuesto Dental</h2><p>Estimado/a {{$json["nombre"]}},</p><p>Adjuntamos su presupuesto para {{$json["tratamiento"]}} por un total de ${{$json["monto"]}}.</p><p>Saludos cordiales,<br>Clínica Dental</p>',
        },
        id: "email1",
        name: "Enviar Email",
        type: "n8n-nodes-base.emailSend",
        typeVersion: 2,
        position: [600, 200],
      },
      {
        parameters: {
          url: `${webhookUrls.presupuestosStatusUpdate}`,
          sendBody: true,
          specifyBody: "json",
          jsonBody: '={"id": "{{$json["id"]}}", "estado": "enviado", "metodo_envio": "{{$json["method"]}}"}',
          options: {},
        },
        id: "http1",
        name: "Actualizar Estado",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 4.1,
        position: [800, 300],
      },
      {
        parameters: {
          respondWith: "json",
          responseBody: '={"success": true, "message": "Presupuesto procesado correctamente"}',
        },
        id: "respond1",
        name: "Responder",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1,
        position: [1000, 300],
      },
    ],
    connections: {
      "Webhook - Recibir Presupuesto": {
        main: [
          [
            {
              node: "¿Enviar por Email?",
              type: "main",
              index: 0,
            },
            {
              node: "¿Enviar por WhatsApp?",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
      "¿Enviar por Email?": {
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
              node: "Responder",
              type: "main",
              index: 0,
            },
          ],
        ],
      },
    },
  }

  return NextResponse.json({
    workflow: workflowExample,
    instructions: {
      "1": "Importa este JSON en n8n",
      "2": `Configura el webhook con la URL: ${webhookUrls.presupuestosReceiver}`,
      "3": "Configura tus credenciales de email",
      "4": "Activa el workflow",
      "5": "Prueba enviando un presupuesto desde la aplicación",
    },
    webhookUrls,
  })
}
