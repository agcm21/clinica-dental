"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { checkBucketExists, createBucketIfNotExists } from "@/lib/supabase-storage"

export function DebugPanel() {
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setResults((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const checkBucket = async () => {
    setIsLoading(true)
    addResult("Verificando bucket...")

    try {
      const exists = await checkBucketExists()
      addResult(`Bucket exists: ${exists}`)

      if (!exists) {
        addResult("Intentando crear bucket...")
        const created = await createBucketIfNotExists()
        addResult(`Bucket created: ${created}`)
      }
    } catch (error) {
      addResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testImageUpload = async () => {
    setIsLoading(true)
    addResult("Probando carga de imagen...")

    try {
      // Crear una imagen de prueba
      const canvas = document.createElement("canvas")
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "red"
        ctx.fillRect(0, 0, 100, 100)
      }

      // Convertir a blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png")
      })

      // Crear archivo
      const file = new File([blob], "test-image.png", { type: "image/png" })

      // Subir directamente con supabase
      addResult("Subiendo imagen de prueba...")
      const { data, error } = await supabase.storage
        .from("treatment-images")
        .upload(`test/test-${Date.now()}.png`, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (error) {
        addResult(`Error al subir: ${error.message}`)
      } else {
        addResult(`Subida exitosa: ${JSON.stringify(data)}`)

        // Obtener URL
        const { data: urlData } = supabase.storage.from("treatment-images").getPublicUrl(data.path)

        addResult(`URL generada: ${urlData.publicUrl}`)

        // Verificar acceso
        const response = await fetch(urlData.publicUrl, { method: "HEAD" })
        addResult(`Acceso a URL: ${response.ok ? "OK" : "Fallido"} (${response.status})`)
      }
    } catch (error) {
      addResult(`Error inesperado: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Panel de Depuración</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={checkBucket} disabled={isLoading}>
              Verificar Bucket
            </Button>
            <Button onClick={testImageUpload} disabled={isLoading}>
              Probar Carga de Imagen
            </Button>
          </div>

          <div className="h-64 overflow-auto rounded border p-2 bg-gray-50 font-mono text-xs">
            {results.length === 0 ? (
              <p className="text-gray-400">Los resultados aparecerán aquí...</p>
            ) : (
              results.map((result, i) => (
                <div key={i} className="py-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
