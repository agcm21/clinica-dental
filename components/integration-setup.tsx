"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, ExternalLink, Settings } from "lucide-react"
import { getWebhookUrls, validateIntegrationConfig, integrationConfig } from "@/lib/integration-config"
import { toast } from "@/components/ui/use-toast"

export function IntegrationSetup() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const webhookUrls = getWebhookUrls()
  const configValidation = validateIntegrationConfig()

  const copyToClipboard = async (text: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemName)
      toast({
        title: "Copiado",
        description: `${itemName} copiado al portapapeles`,
      })
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Estado de la Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Configuración general</span>
              <Badge variant={configValidation.isValid ? "default" : "destructive"}>
                {configValidation.isValid ? "Válida" : "Incompleta"}
              </Badge>
            </div>

            {configValidation.errors.length > 0 && (
              <div className="text-sm text-red-600">
                <p className="font-medium">Errores de configuración:</p>
                <ul className="list-disc list-inside">
                  {configValidation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">URL de la App:</span>
                <p className="text-muted-foreground truncate">{integrationConfig.appUrl}</p>
              </div>
              <div>
                <span className="font-medium">Webhook n8n:</span>
                <p className="text-muted-foreground truncate">
                  {integrationConfig.n8nPresupuestoWebhook || "No configurado"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>URLs para Configurar en n8n</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">1. Webhook para recibir presupuestos desde la app:</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm">{webhookUrls.presupuestosReceiver}</code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrls.presupuestosReceiver, "URL del receptor")}
                >
                  {copiedItem === "URL del receptor" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Esta URL debe configurarse como webhook en n8n para recibir nuevos presupuestos
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">2. Endpoint para actualizar estados:</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm">PUT {webhookUrls.presupuestosStatusUpdate}</code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrls.presupuestosStatusUpdate, "URL de actualización")}
                >
                  {copiedItem === "URL de actualización" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Esta URL debe usarse en n8n para actualizar el estado de los presupuestos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Variables de Entorno</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">NEXT_PUBLIC_APP_URL</label>
              <p className="text-sm text-muted-foreground">URL base de tu aplicación. Ejemplos:</p>
              <ul className="text-xs text-muted-foreground list-disc list-inside mt-1">
                <li>Desarrollo: http://localhost:3000</li>
                <li>Producción: https://tu-clinica.vercel.app</li>
                <li>Dominio propio: https://clinica.tudominio.com</li>
              </ul>
            </div>

            <div>
              <label className="text-sm font-medium">NEXT_PUBLIC_N8N_PRESUPUESTO_WEBHOOK</label>
              <p className="text-sm text-muted-foreground">
                URL del webhook de n8n para recibir presupuestos. Ejemplo:
              </p>
              <code className="text-xs bg-muted p-1 rounded">https://tu-n8n.com/webhook/presupuesto-dental</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ejemplo de Flujo de Trabajo n8n</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Pasos para configurar el flujo en n8n:</p>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Crear un nuevo workflow en n8n</li>
              <li>Agregar un nodo "Webhook" con la URL que copiaste arriba</li>
              <li>Agregar nodos para procesar email y WhatsApp</li>
              <li>Agregar un nodo HTTP Request para actualizar el estado</li>
              <li>Probar el flujo completo</li>
            </ol>

            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => window.open("/api/integrations/n8n/workflow-example", "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver Ejemplo de Workflow Completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
