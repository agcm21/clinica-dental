import type React from "react"
import { PresupuestosVerificador } from "@/components/presupuestos-verificador"

export default function PresupuestosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PresupuestosVerificador />
      {children}
    </>
  )
}
