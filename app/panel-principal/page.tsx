import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { AppointmentList } from "@/components/appointment-list"
import { QuickAccess } from "@/components/quick-access"
import { AppointmentStats } from "@/components/appointment-stats"

export default function PanelPrincipal() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav />
        </div>
      </header>

      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="grid gap-4 md:grid-cols-5">
          <div className="col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Total Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <div className="text-xs text-muted-foreground mt-1">Año actual: 12</div>
                <div className="text-xs text-muted-foreground">Últimos 3 meses: 7</div>
                <div className="text-xs text-muted-foreground">Mayo: 1</div>
                <div className="text-xs text-muted-foreground">Abril: 1</div>
                <div className="text-xs text-muted-foreground">Marzo: 5</div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1">
            <AppointmentStats />
          </div>

          <div className="col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Presupuestos Enviados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4</div>
                <div className="text-xs text-muted-foreground mt-1">Aprobados: 2</div>
                <div className="text-xs text-muted-foreground">Pendientes: 1</div>
                <div className="text-xs text-muted-foreground">Rechazados: 1</div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Ingresos Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$24,780</div>
                <div className="text-xs text-muted-foreground mt-1">+8.2% desde el mes pasado</div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Estado Inventario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">92%</div>
                <div className="text-xs text-muted-foreground mt-1">3 items requieren reorden</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Citas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentList />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Acceso Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickAccess />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
