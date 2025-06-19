"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestN8nPage() {
  const [presupuestoId, setPresupuestoId] = useState("123")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testN8nConnection = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/test-n8n", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ presupuestoId }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Error desconocido")
      }
    } catch (err) {
      setError("Error de conexión: " + (err instanceof Error ? err.message : "Error desconocido"))
    } finally {
      setLoading(false)
    }
  }

  const testDirectN8n = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    // Datos exactos que quieres probar
    const testData = {
      presupuestoId: "123",
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
      callback_url: "https://tu-app.com/api/presupuestos/actualizar-estado/123",
    }

    try {
      // Probar directamente con n8n
      const webhookUrl =
        "https://primary-production-46d3.up.railway.app/webhook-test/f91dd4a3-a4c2-4b87-afe4-3ec1d66a7379"

      console.log("Enviando directamente a n8n:", testData)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      if (response.ok) {
        const result = await response.json()
        setResult({
          success: true,
          message: "Enviado directamente a n8n",
          data: testData,
          n8nResponse: result,
        })
      } else {
        const errorText = await response.text()
        setError(`Error en n8n: ${response.status} - ${errorText}`)
      }
    } catch (err) {
      setError("Error enviando a n8n: ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Prueba de Conexión con n8n</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="presupuestoId">ID del Presupuesto (para prueba)</Label>
            <Input
              id="presupuestoId"
              value={presupuestoId}
              onChange={(e) => setPresupuestoId(e.target.value)}
              placeholder="123"
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={testN8nConnection} disabled={loading} variant="outline">
              {loading ? "Enviando..." : "Probar vía API interna"}
            </Button>

            <Button onClick={testDirectN8n} disabled={loading}>
              {loading ? "Enviando..." : "Probar directamente n8n"}
            </Button>
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Datos de prueba que se enviarán:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(
                {
                  presupuestoId: "123",
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
                  callback_url: "https://tu-app.com/api/presupuestos/actualizar-estado/123",
                },
                null,
                2,
              )}
            </pre>
          </div>

          {result && (
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">✅ Éxito</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">❌ Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

