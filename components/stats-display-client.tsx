"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, Package, FileText } from "lucide-react"
import { PatientStats } from "@/components/patient-stats"
// Importa otros componentes de estadísticas si los tienes

interface PresupuestoStats {
  total: number
  aprobados: number
  pendientes: number
  rechazados: number
}

export function StatsDisplayClient() {
  const [stats, setStats] = useState<PresupuestoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/presupuestos/stats")

        if (!response.ok) {
          throw new Error("Error al cargar estadísticas")
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Error:", err)
        setError("No se pudieron cargar las estadísticas")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <>
      <PatientStats />
      {/* Otros componentes de estadísticas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">6 pendientes por confirmar</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Presupuestos Enviados</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-2xl font-bold animate-pulse">Cargando...</div>
          ) : error ? (
            <div className="text-sm text-red-500">{error}</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">
                  Aprobados: <span className="font-medium">{stats?.aprobados || 0}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Pendientes: <span className="font-medium">{stats?.pendientes || 0}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Rechazados: <span className="font-medium">{stats?.rechazados || 0}</span>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$24,780</div>
          <p className="text-xs text-muted-foreground">+8.2% desde el mes pasado</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado Inventario</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">92%</div>
          <p className="text-xs text-muted-foreground">3 items necesitan reorden</p>
        </CardContent>
      </Card>
    </>
  )
}












