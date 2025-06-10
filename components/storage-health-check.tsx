"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyBucketAccess } from "@/lib/supabase-storage"
import { toast } from "@/components/ui/use-toast"

export function StorageHealthCheck() {
  const [isChecking, setIsChecking] = useState(false)
  const [status, setStatus] = useState<any>(null)

  const runHealthCheck = async () => {
    setIsChecking(true)
    try {
      const bucketStatus = await verifyBucketAccess()
      setStatus(bucketStatus)

      if (!bucketStatus.exists) {
        toast({
          title: "Error",
          description: "El bucket no existe. Por favor, ejecute el script de corrección de políticas.",
          variant: "destructive",
        })
      } else if (!bucketStatus.accessible) {
        toast({
          title: "Error",
          description: "El bucket existe pero no es accesible. Verifique las políticas de acceso.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Éxito",
          description: `Bucket verificado correctamente. ${bucketStatus.files} archivos encontrados.`,
        })
      }
    } catch (error) {
      console.error("Error en health check:", error)
      toast({
        title: "Error",
        description: "Error al verificar el estado del storage",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado del Storage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runHealthCheck} disabled={isChecking}>
            {isChecking ? "Verificando..." : "Verificar Storage"}
          </Button>

          {status && (
            <div className="mt-4 space-y-2">
              <p>Bucket: {status.exists ? "✅ Existe" : "❌ No existe"}</p>
              {status.exists && <p>Accesible: {status.accessible ? "✅ Sí" : "❌ No"}</p>}
              {status.error && <p className="text-red-500">Error: {status.error}</p>}
              {status.files !== undefined && <p>Archivos encontrados: {status.files}</p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
