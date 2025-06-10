import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AppointmentForm } from "@/components/appointment-form"

export default function NewAppointmentPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
        <Link href="/citas" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a Citas</span>
        </Link>
        <h1 className="text-xl font-semibold ml-4">Nueva Cita</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          <AppointmentForm />
        </div>
      </main>
    </div>
  )
}
