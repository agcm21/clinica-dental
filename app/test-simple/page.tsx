"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSimplePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const testN8nConnection = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      console.log("🚀 Iniciando prueba simple de n8n...")

      const response = await fetch("/api/test-n8n-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ presupuestoId: "123" }),
      })

      const data = await response.json()
      console.log("📋 Respuesta completa:", data)

      if (response.ok) {
        setResult(data)
        console.log("✅ ¡Éxito en la prueba!")
      } else {
        setError(data.error || "Error desconocido")
        console.error("❌ Error en la prueba:", data)
      }
    } catch (err) {
      setError("Error de conexión: " + err.message)
      console.error("❌ Error de fetch:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Prueba Simple de Conexión con n8n</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">
              <strong>Datos de prueba:</strong> Jesus Nazareth - totalautomatizacion@gmail.com - 584249094925
            </p>
          </div>

          <Button onClick={testN8nConnection} disabled={loading} className="w-full" size="lg">
            {loading ? "⏳ Enviando a n8n..." : "🚀 Probar Conexión con n8n"}
          </Button>

          {result && (
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">✅ ¡Éxito!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600 mb-2">{result.message}</p>
                <details>
                  <summary className="cursor-pointer text-sm text-gray-600">Ver detalles técnicos</summary>
                  <pre className="text-xs overflow-auto max-h-96 mt-2 bg-white p-2 rounded border">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
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
