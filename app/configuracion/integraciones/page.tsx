import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { IntegrationSetup } from "@/components/integration-setup"

export default function IntegracionesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/panel-principal" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al Panel</span>
            </Link>
            <h1 className="text-lg font-semibold">Configuración de Integraciones</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Configuración de n8n</h2>
            <p className="text-muted-foreground">
              Configura las integraciones externas para automatizar el envío de presupuestos.
            </p>
          </div>

          <IntegrationSetup />
        </div>
      </main>
    </div>
  )
}
