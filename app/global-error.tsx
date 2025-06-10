"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error global:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Error en la aplicación</h2>
            <p className="mb-6 text-muted-foreground">{error.message || "Ha ocurrido un error inesperado."}</p>
            <Button onClick={() => reset()}>Intentar de nuevo</Button>
          </div>
        </div>
      </body>
    </html>
  )
}
