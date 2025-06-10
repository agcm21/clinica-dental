"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface PatientStats {
  totalPatients: number
  currentYearPatients: number
  last3MonthsPatients: number
  monthlyBreakdown: Record<string, number>
  percentageGrowth: string
}

export function PatientStats() {
  const [stats, setStats] = useState<PatientStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // Añadir timestamp para evitar caché
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/patients/stats?t=${timestamp}`)

        if (!response.ok) {
          throw new Error("Error al cargar estadísticas de pacientes")
        }

        const data = await response.json()
        console.log("Datos de pacientes recibidos:", data)
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-2xl font-bold animate-pulse">Cargando...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : (
          <>
            <div className="text-2xl font-bold">{stats?.totalPatients}</div>
            <div className="flex flex-col mt-1">
              <div className="text-xs text-muted-foreground">
                Año actual: <span className="font-medium">{stats?.currentYearPatients}</span>
              </div>
              <div className="text-xs text-muted-foreground">Últimos 3 meses:</div>
              {stats?.monthlyBreakdown && Object.keys(stats.monthlyBreakdown).length > 0 ? (
                <div className="flex flex-col ml-4">
                  {Object.entries(stats.monthlyBreakdown).map(([month, count]) => (
                    <div key={month} className="flex justify-between text-xs text-muted-foreground">
                      <span>{month}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground ml-4">No hay datos disponibles</div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}





