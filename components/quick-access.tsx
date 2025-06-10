import Link from "next/link"
import { CalendarPlus, UserPlus, FileText, Settings, Wrench } from "lucide-react"

export function QuickAccess() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link href="/citas/nueva" className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted/50">
        <CalendarPlus className="h-6 w-6" />
        <span className="text-sm font-medium">Nueva Cita</span>
      </Link>
      <Link href="/nuevo-paciente" className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted/50">
        <UserPlus className="h-6 w-6" />
        <span className="text-sm font-medium">Nuevo Paciente</span>
      </Link>
      <Link href="/reportes" className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted/50">
        <FileText className="h-6 w-6" />
        <span className="text-sm font-medium">Reportes</span>
      </Link>
      <Link href="/configuracion" className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted/50">
        <Settings className="h-6 w-6" />
        <span className="text-sm font-medium">Configuración</span>
      </Link>
      <Link
        href="/diagnostico"
        className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted/50 col-span-2"
      >
        <Wrench className="h-6 w-6" />
        <span className="text-sm font-medium">Diagnóstico del Sistema</span>
      </Link>
    </div>
  )
}
