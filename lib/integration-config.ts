// Configuración para integraciones externas

/**
 * Configuración de URLs y endpoints
 */
export const integrationConfig = {
  // URL base de la aplicación (se obtiene de variables de entorno)
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // URL del webhook de n8n para presupuestos
  n8nPresupuestoWebhook: process.env.NEXT_PUBLIC_N8N_PRESUPUESTO_WEBHOOK || "",

  // Endpoints internos de la aplicación
  endpoints: {
    presupuestos: "/api/presupuestos",
    presupuestosIntegration: "/api/integrations/n8n/presupuestos",
    upload: "/api/upload",
  },

  // Configuración de timeouts
  timeouts: {
    webhookTimeout: 30000, // 30 segundos
    emailTimeout: 60000, // 60 segundos
    whatsappTimeout: 45000, // 45 segundos
  },
}

/**
 * Genera las URLs completas para webhooks
 */
export function getWebhookUrls() {
  const baseUrl = integrationConfig.appUrl

  return {
    // URL que n8n debe llamar para recibir datos de presupuestos
    presupuestosReceiver: `${baseUrl}/api/integrations/n8n/presupuestos`,

    // URL que n8n debe llamar para actualizar estados
    presupuestosStatusUpdate: `${baseUrl}/api/integrations/n8n/presupuestos`,

    // URL que la aplicación llamará para enviar datos a n8n
    n8nPresupuestoSender: integrationConfig.n8nPresupuestoWebhook,
  }
}

/**
 * Valida la configuración de integraciones
 */
export function validateIntegrationConfig() {
  const errors: string[] = []

  if (!integrationConfig.appUrl) {
    errors.push("NEXT_PUBLIC_APP_URL no está configurada")
  }

  if (!integrationConfig.n8nPresupuestoWebhook) {
    errors.push("NEXT_PUBLIC_N8N_PRESUPUESTO_WEBHOOK no está configurada")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Configuración para desarrollo local
 */
export const developmentConfig = {
  simulateN8n: true, // Simular n8n en desarrollo
  logRequests: true, // Loggear todas las requests
  mockDelay: 2000, // Delay para simular requests reales
}
