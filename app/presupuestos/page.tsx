"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Eye, Mail, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PresupuestoPreview } from "@/components/presupuesto-preview"
import { supabase } from "@/lib/supabase"

interface Presupuesto {
  id: string
  nombre_paciente: string
  apellido_paciente: string
  cedula: string
  telefono: string
  email: string
  direccion: string
  tratamiento: string
  descripcion: string
  monto: number
  imagen_url: string | null
  metodo_envio: string
  estado: string
  created_at: string
  updated_at: string
  respuesta_cliente: string | null
}

export default function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [filteredPresupuestos, setFilteredPresupuestos] = useState<Presupuesto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<Presupuesto | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Cargar presupuestos
  const fetchPresupuestos = async () => {
    try {
      console.log("Iniciando fetch de presupuestos...")
      setError(null)

      const response = await fetch("/api/presupuestos")
      console.log("Response status:", response.status)

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log("Datos recibidos:", data)

      if (Array.isArray(data)) {
        setPresupuestos(data)
        setFilteredPresupuestos(data)
      } else {
        console.error("Los datos recibidos no son un array:", data)
        setError("Formato de datos incorrecto")
      }
    } catch (error) {
      console.error("Error fetching presupuestos:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      toast({
        title: "Error",
        description: "Error de conexión al cargar presupuestos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPresupuestos()
  }, [])

  // Filtrar presupuestos
  useEffect(() => {
    if (searchTerm) {
      const filtered = presupuestos.filter(
        (presupuesto) =>
          presupuesto.nombre_paciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          presupuesto.apellido_paciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          presupuesto.cedula?.includes(searchTerm) ||
          presupuesto.tratamiento?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPresupuestos(filtered)
    } else {
      setFilteredPresupuestos(presupuestos)
    }
  }, [searchTerm, presupuestos])

  // Enviar presupuesto a n8n (usando API interna)
  const handleSendPresupuesto = async (presupuesto: Presupuesto, method: string) => {
    try {
      setSendingId(presupuesto.id)

      console.log(`=== CLIENTE: Enviando presupuesto ${presupuesto.id} por ${method} ===`)

      // Preparar datos para n8n en el formato que espera
      const n8nData = {
        presupuestoId: presupuesto.id,
        paciente: {
          nombre: presupuesto.nombre_paciente,
          apellido: presupuesto.apellido_paciente,
          email: presupuesto.email,
          telefono: presupuesto.telefono,
        },
        presupuesto: {
          tratamiento: presupuesto.tratamiento,
          descripcion: presupuesto.descripcion,
          monto: presupuesto.monto,
          imagen_url: presupuesto.imagen_url,
        },
        metodo_envio: method,
        callback_url: `https://dental-clinic-test.loca.lt/api/presupuestos/actualizar-estado/${presupuesto.id}`,
      }

      console.log("Datos a enviar:", n8nData)

      // Enviar a nuestra API interna (que luego envía a n8n)
      const response = await fetch("/api/integrations/n8n/presupuestos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(n8nData),
      })

      console.log("Response status de API interna:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error de API interna:", errorData)
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()
      console.log("Respuesta exitosa:", result)

      // NUEVA FUNCIONALIDAD: Actualizar estado en la base de datos
      try {
        // Solo actualizar a "enviado" si el estado actual no es "enviado"
        if (presupuesto.estado !== "enviado") {
          const { error: updateError } = await supabase
            .from("presupuestos")
            .update({
              estado: "enviado",
              metodo_envio: method,
            })
            .eq("id", presupuesto.id)

          if (updateError) {
            console.error("Error al actualizar estado en BD:", updateError)
            // No lanzamos error aquí para no interrumpir el flujo, solo logueamos
          } else {
            console.log("Estado actualizado exitosamente en BD")
          }
        }
      } catch (dbError) {
        console.error("Error de conexión con BD:", dbError)
        // No interrumpimos el flujo por errores de BD
      }

      // Actualizar el estado del presupuesto localmente
      setPresupuestos((prev) =>
        prev.map((p) => (p.id === presupuesto.id ? { ...p, metodo_envio: method, estado: "enviado" } : p)),
      )

      toast({
        title: "¡Enviado exitosamente!",
        description: `El presupuesto ha sido enviado por ${method === "email" ? "correo electrónico" : method === "whatsapp" ? "WhatsApp" : "ambos medios"}`,
      })
    } catch (error) {
      console.error("Error enviando presupuesto:", error)
      toast({
        title: "Error al enviar",
        description: error instanceof Error ? error.message : "Error inesperado al enviar el presupuesto",
        variant: "destructive",
      })
    } finally {
      setSendingId(null)
    }
  }

  // Abrir vista previa
  const handleViewPresupuesto = (presupuesto: Presupuesto) => {
    setSelectedPresupuesto(presupuesto)
    setIsPreviewOpen(true)
  }

  // Manejar envío desde vista previa
  const handleSendFromPreview = async (method: string) => {
    if (selectedPresupuesto) {
      await handleSendPresupuesto(selectedPresupuesto, method)
      setIsPreviewOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("es-ES")
    } catch (e) {
      return "Fecha inválida"
    }
  }

  const formatCurrency = (value: number): string => {
    if (value === undefined || value === null) return "$0.00"
    return `$${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`
  }

  const getEstadoBadge = (estado: string) => {
    if (!estado) return <Badge variant="secondary">Pendiente</Badge>

    switch (estado.toLowerCase()) {
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      case "enviado":
        return <Badge variant="default">Enviado</Badge>
      case "aprobado":
        return (
          <Badge variant="default" className="bg-green-500">
            Aprobado
          </Badge>
        )
      case "rechazado":
        return <Badge variant="destructive">Rechazado</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const getRespuestaClienteBadge = (respuesta: string | null) => {
    if (!respuesta) return <Badge variant="secondary">Pendiente</Badge>

    switch (respuesta.toLowerCase()) {
      case "aprobado":
        return (
          <Badge variant="default" className="bg-green-500">
            Aprobado
          </Badge>
        )
      case "rechazado":
        return <Badge variant="destructive">Rechazado</Badge>
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>
      default:
        return <Badge variant="outline">{respuesta}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
          <h1 className="text-xl font-semibold">Presupuestos</h1>
        </header>
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando presupuestos...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
        <Link href="/panel-principal" className="text-muted-foreground hover:text-foreground">
          ← Volver al Panel
        </Link>
        <h1 className="text-xl font-semibold ml-4">Presupuestos</h1>
        <div className="ml-auto">
          <Link href="/presupuestos/nuevo">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Presupuesto
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Barra de búsqueda */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar presupuestos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de presupuestos */}
          <Card>
            <CardHeader>
              <CardTitle>Listado de Presupuestos</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPresupuestos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No se encontraron presupuestos</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Nombre</th>
                        <th className="text-left p-2">Cédula</th>
                        <th className="text-left p-2">Tratamiento</th>
                        <th className="text-left p-2">Fecha</th>
                        <th className="text-left p-2">Monto</th>
                        <th className="text-left p-2">Estado</th>
                        <th className="text-left p-2">Acciones</th>
                        <th className="text-left p-2">Respuesta cliente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPresupuestos.map((presupuesto) => (
                        <tr key={presupuesto.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-sm">{presupuesto.id?.substring(0, 8)}...</td>
                          <td className="p-2">
                            {presupuesto.nombre_paciente} {presupuesto.apellido_paciente}
                          </td>
                          <td className="p-2">{presupuesto.cedula}</td>
                          <td className="p-2">{presupuesto.tratamiento}</td>
                          <td className="p-2">{formatDate(presupuesto.created_at)}</td>
                          <td className="p-2 font-semibold">{formatCurrency(presupuesto.monto)}</td>
                          <td className="p-2">{getEstadoBadge(presupuesto.estado)}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {/* Botón Ver */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPresupuesto(presupuesto)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Ver
                              </Button>

                              {/* Menú de envío */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    disabled={sendingId === presupuesto.id}
                                    className="flex items-center gap-1"
                                  >
                                    <Send className="h-3 w-3" />
                                    {sendingId === presupuesto.id ? "Enviando..." : "Enviar"}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => handleSendPresupuesto(presupuesto, "email")}
                                    className="flex items-center gap-2"
                                  >
                                    <Mail className="h-4 w-4" />
                                    Por Correo
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleSendPresupuesto(presupuesto, "whatsapp")}
                                    className="flex items-center gap-2"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                    Por WhatsApp
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleSendPresupuesto(presupuesto, "both")}
                                    className="flex items-center gap-2"
                                  >
                                    <Send className="h-4 w-4" />
                                    Por Ambos
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                          <td className="p-2">{getRespuestaClienteBadge(presupuesto.respuesta_cliente)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Vista previa del presupuesto */}
      {isPreviewOpen && selectedPresupuesto && (
        <PresupuestoPreview
          presupuesto={{
            nombre: selectedPresupuesto.nombre_paciente,
            apellido: selectedPresupuesto.apellido_paciente,
            cedula: selectedPresupuesto.cedula,
            telefono: selectedPresupuesto.telefono,
            email: selectedPresupuesto.email,
            direccion: selectedPresupuesto.direccion,
            tratamiento: selectedPresupuesto.tratamiento,
            descripcion: selectedPresupuesto.descripcion,
            monto: selectedPresupuesto.monto?.toString() || "0",
            imagen_url: selectedPresupuesto.imagen_url,
          }}
          onSend={handleSendFromPreview}
          onClose={() => setIsPreviewOpen(false)}
          isOpen={isPreviewOpen}
        />
      )}
    </div>
  )
}






