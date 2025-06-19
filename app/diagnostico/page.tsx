"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { StorageDebugger } from "@/components/storage-debugger"
import { supabase } from "@/lib/supabase"

export default function DiagnosticoPage() {
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || "No configurado")
  const [supabaseKey, setSupabaseKey] = useState(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configurado (oculto)" : "No configurado")
  const [connectionStatus, setConnectionStatus] = useState("Verificando...")
  const [errorMessage, setErrorMessage] = useState("")
  const [rawResponse, setRawResponse] = useState("")

  useEffect(() => {
    async function checkConnection() {
      try {
        console.log("Verificando conexión a Supabase...")
        
        // Intenta una operación simple para verificar la conexión
        const { data, error } = await supabase.from("patients").select("count").single()
        
        console.log("Respuesta:", { data, error })
        
        if (error) {
          setConnectionStatus("Error de conexión")
          setErrorMessage((error instanceof Error ? error.message : "Error desconocido"))
          setRawResponse(JSON.stringify({ data, error }, null, 2))
        } else {
          setConnectionStatus("Conectado correctamente")
          setRawResponse(JSON.stringify({ data, error }, null, 2))
        }
      } catch (error) {
        console.error("Error al verificar conexión:", error)
        setConnectionStatus("Error")
        if (error instanceof Error) {
          setErrorMessage((error instanceof Error ? error.message : "Error desconocido"))
        } else {
          setErrorMessage("Error desconocido")
        }
        setRawResponse(JSON.stringify(error, null, 2))
      }
    }
    
    checkConnection()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
        <Link href="/panel-principal" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al Panel Principal</span>
        </Link>
        <h1 className="text-xl font-semibold ml-4">Diagnóstico de Supabase</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Configuración de Supabase</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">URL de Supabase:</div>
                  <div className={supabaseUrl !== "No configurado" ? "text-green-600" : "text-red-600"}>
                    {supabaseUrl}
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">Clave Anónima:</div>
                  <div className={supabaseKey !== "No configurado" ? "text-green-600" : "text-red-600"}>
                    {supabaseKey}
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">Estado de Conexión:</div>
                  <div className={
                    connectionStatus === "Conectado correctamente" 
                      ? "text-green-600" 
                      : connectionStatus === "Verificando..." 
                        ? "text-blue-600" 
                        : "text-red-600"
                  }>
                    {connectionStatus}
                  </div>
                </div>
              </div>
              
              {errorMessage && (
                <div className="p-4 border rounded-lg bg-red-50">
                  <div className="font-medium mb-2 text-red-600">Error:</div>
                  <div className="text-red-600">{errorMessage}</div>
                </div>
              )}
              
              {rawResponse && (
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">Respuesta completa:</div>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                    {rawResponse}
                  </pre>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Pasos para solucionar problemas</h2>
            
            <ol className="list-decimal pl-5 space-y-2">
              <li>Verifica que el archivo <code>.env.local</code> exista en la raíz del proyecto</li>
              <li>Asegúrate de que contenga las variables <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
              <li>Reinicia el servidor después de modificar el archivo <code>.env.local</code></li>
              <li>Verifica que las tablas necesarias existan en tu proyecto de Supabase</li>
              <li>Asegúrate de que las políticas de RLS (Row Level Security) permitan el acceso anónimo</li>
            </ol>
          </div>
          
          <StorageDebugger />
        </div>
      </main>
    </div>
  )
}

