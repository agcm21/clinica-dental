"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function ClientNewPatientPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
        <Link href="/pacientes" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a Pacientes</span>
        </Link>
        <h1 className="text-xl font-semibold ml-4">Nuevo Paciente</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold">Formulario de Nuevo Paciente</h2>
          <div className="mt-4">
            <p>Página de prueba - Versión cliente</p>
          </div>
        </div>
      </main>
    </div>
  )
}
