"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { checkBucketExists, createBucketIfNotExists } from "@/lib/supabase-storage"
import { toast } from "@/components/ui/use-toast"

export function StorageDebugger() {
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const checkConnection = async () => {
    setIsLoading(true)
    addLog("Verificando conexión con Supabase...")

    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        addLog(`❌ Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`)
      } else {
        addLog("✅ Conexión establecida correctamente")
      }

      // Verificar URL y clave anónima
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      addLog(`URL de Supabase: ${url ? "✅ Configurada" : "❌ No configurada"}`)
      addLog(`Clave anónima: ${key ? "✅ Configurada" : "❌ No configurada"}`)
    } catch (error) {
      addLog(`❌ Error inesperado: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkStorage = async () => {
    setIsLoading(true)
    addLog("Verificando configuración de Storage...")

    try {
      // Listar buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        addLog(
          `❌ Error al listar buckets: ${bucketsError instanceof Error ? bucketsError.message : "Error desconocido"}`,
        )
        return
      }

      addLog(`Buckets disponibles: ${buckets.map((b: any) => b.name).join(", ") || "ninguno"}`)

      // Verificar bucket específico
      const bucket = buckets.find((b: any) => b.name === "treatment-images")

      if (bucket) {
        addLog(`✅ Bucket 'treatment-images' encontrado`)

        // Verificar acceso al bucket
        const { data: files, error: listError } = await supabase.storage.from("treatment-images").list()

        if (listError) {
          addLog(
            `❌ Error al acceder al bucket: ${listError instanceof Error ? listError.message : "Error desconocido"}`,
          )
        } else {
          addLog(`✅ Acceso al bucket correcto. Archivos: ${files.length}`)
        }
      } else {
        addLog(`❌ Bucket 'treatment-images' no encontrado`)

        // Intentar crear el bucket
        addLog("Intentando crear el bucket...")
        const created = await createBucketIfNotExists()

        if (created) {
          addLog("✅ Bucket creado exitosamente")
        } else {
          addLog("❌ No se pudo crear el bucket")
        }
      }
    } catch (error) {
      addLog(`❌ Error inesperado: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testUpload = async () => {
    setIsLoading(true)
    addLog("Probando carga de imagen...")

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
      const filePath = `test/test-${Date.now()}.png`

      addLog(`Subiendo archivo de prueba a: ${filePath}`)

      // Subir archivo
      const { data, error } = await supabase.storage.from("treatment-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        addLog(`❌ Error al subir: ${error instanceof Error ? error.message : "Error desconocido"}`)
      } else {
        addLog(`✅ Archivo subido exitosamente: ${data.path}`)

        // Obtener URL pública
        const { data: urlData } = supabase.storage.from("treatment-images").getPublicUrl(data.path)

        addLog(`URL pública: ${urlData.publicUrl}`)

        // Verificar acceso a la URL
        try {
          const response = await fetch(urlData.publicUrl, { method: "HEAD" })
          addLog(`Acceso a URL: ${response.ok ? "✅ OK" : "❌ Fallido"} (${response.status})`)
        } catch (fetchError) {
          addLog(`❌ Error al verificar URL: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`)
        }
      }
    } catch (error) {
      addLog(`❌ Error inesperado: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const fixBucketPermissions = async () => {
    setIsLoading(true)
    addLog("Intentando corregir permisos del bucket...")

    try {
      // Primero verificamos si el bucket existe
      const bucketExists = await checkBucketExists()

      if (!bucketExists) {
        addLog("El bucket no existe, intentando crearlo primero...")
        const created = await createBucketIfNotExists()

        if (!created) {
          addLog("❌ No se pudo crear el bucket")
          return
        }

        addLog("✅ Bucket creado exitosamente")
      }

      // Actualizar configuración del bucket para hacerlo público
      const { error: updateError } = await supabase.storage.updateBucket("treatment-images", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })

      if (updateError) {
        addLog(
          `❌ Error al actualizar bucket: ${updateError instanceof Error ? updateError.message : "Error desconocido"}`,
        )
      } else {
        addLog("✅ Configuración del bucket actualizada correctamente")

        // Mostrar toast de éxito
        toast({
          title: "Bucket actualizado",
          description: "La configuración del bucket ha sido actualizada correctamente",
        })
      }
    } catch (error) {
      addLog(`❌ Error inesperado: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Depurador de Supabase Storage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={checkConnection} disabled={isLoading}>
              Verificar Conexión
            </Button>
            <Button onClick={checkStorage} disabled={isLoading}>
              Verificar Storage
            </Button>
            <Button onClick={testUpload} disabled={isLoading}>
              Probar Subida
            </Button>
            <Button onClick={fixBucketPermissions} disabled={isLoading} variant="destructive">
              Corregir Permisos
            </Button>
            <Button onClick={clearLogs} disabled={isLoading} variant="outline">
              Limpiar Logs
            </Button>
          </div>

          <div className="h-64 overflow-auto rounded border p-2 bg-gray-50 font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-400">Los resultados aparecerán aquí...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="py-1">
                  {log}
                </div>
              ))
            )}
          </div>

          <div className="text-xs text-gray-500">
            <p>Nota: Si encuentras problemas con la carga de imágenes, prueba lo siguiente:</p>
            <ol className="list-decimal pl-4 space-y-1 mt-1">
              <li>Verifica que las variables de entorno de Supabase estén configuradas correctamente</li>
              <li>Asegúrate de que el bucket "treatment-images" exista y sea público</li>
              <li>Comprueba que las políticas RLS permitan operaciones en el bucket</li>
              <li>Verifica que no haya problemas de CORS</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
