import Link from "next/link"

export function MainNav() {
  return (
    <nav className="flex items-center space-x-6">
      <Link href="/" className="text-xl font-bold">
        Clínica Dental
      </Link>
      <Link href="/panel-principal" className="text-sm font-medium">
        Panel Principal
      </Link>
      <Link href="/pacientes" className="text-sm font-medium text-muted-foreground">
        Pacientes
      </Link>
      <Link href="/citas" className="text-sm font-medium text-muted-foreground">
        Citas
      </Link>
      <Link href="/presupuestos" className="text-sm font-medium text-muted-foreground">
        Presupuestos
      </Link>
      <Link href="/tratamientos" className="text-sm font-medium text-muted-foreground">
        Tratamientos
      </Link>
      <Link href="/inventario" className="text-sm font-medium text-muted-foreground">
        Inventario
      </Link>
      <Link href="/facturacion" className="text-sm font-medium text-muted-foreground">
        Facturación
      </Link>
    </nav>
  )
}
