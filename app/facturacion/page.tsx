import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function FacturacionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link href="/panel-principal" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Panel Principal</span>
          </Link>
          <h1 className="ml-4 text-lg font-semibold">Facturación</h1>
        </div>
      </header>
    </div>
  )
}
