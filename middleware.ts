import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Log para depuración
  console.log("Middleware ejecutándose en:", request.nextUrl.pathname)

  // Evitar redirecciones incorrectas
  if (request.nextUrl.pathname === "/presupuestos") {
    console.log("Accediendo a /presupuestos - NO redirigir")
    return NextResponse.next()
  }

  // Mantener el comportamiento original para rutas de pacientes
  if (request.nextUrl.pathname.startsWith("/pacientes")) {
    console.log("Accediendo a ruta de pacientes")
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/pacientes/:path*", "/presupuestos", "/presupuestos/:path*"],
}













