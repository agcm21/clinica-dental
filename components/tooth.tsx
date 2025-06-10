"use client"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ToothProps {
  number: number
  status?: "healthy" | "completed" | "in-treatment" | "pending"
  onClick?: () => void
}

const toothImages: Record<number, string> = {
  11: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2011-9P5XdcFIxv5dySgpHtAlgzL3wL0LAC.png",
  12: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2012-sksV2qt3WecXqwDjbg6Vn32nu2Nmmi.png",
  13: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2013-ROZkUPDXPeWYnVGRniHGKa1sCXFnjO.png",
  14: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2014-3QsFGMZJdHv4vhXrIyII7LGzOglB5v.png",
  15: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2015-NGXyYf9u7jP35UAErtdAl249I6PBpM.png",
  16: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2016.jpg-BXXfvPijruhO0qlc5PaivrRy2MO7SI.jpeg",
  17: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2017-RmWg7YpXerAaLxeydRsdtrw3sTB9kd.png",
  18: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2018-zKyJgF5oCByPfeHAT0EY5gXzmx7Fu7.png",
  21: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2021-pIqoVehusDyMEf1TRNLYxo3dspLChS.png",
  22: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2022-ImdBtvDIpRCHmjYHBXb0D8XMBBESQ9.png",
  23: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2023-KXByBl0kmtgmoWtXZVx3oxXEF0NV8k.png",
  24: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2024-g2hjY3e4FFIahNoWXVyYZKreZYWZaV.png",
  25: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2025-HVr2myR8VcAxUU8mehehXQSSmAmj2R.png",
  26: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2026-OuO6AvoszrO0Z6W5RPiHYqt7dFMi95.png",
  27: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2027-3VwgH7ngh10tBhpUmmgKzEKbYwX3g1.png",
  28: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2028-JZsEsxPSj5XxofQYIK9YKPu3surjFG.png",
  31: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2031-ThOAy2GWE9xrLd395pfxL03pn2VHad.png",
  32: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2032-Jsklg6JaKtWiRhJBK9DnY6Yd7KfoLn.png",
  33: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2033-jIzROwxFe4dSApRxhNhuhYtIeBAfYC.png",
  34: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2034-YxdvlHWjQxaUrAtiMfRq894Nj1zoNW.png",
  35: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2035-LI3QqWUUgCOmpVaIWRNhQl3GSyLzXc.png",
  36: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2036-i323EhyhMsBncdlKhdvCSaamcUBNVs.png",
  37: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2037-SIOodn1XxgJDGRu89L00rcwsXDd0zx.png",
  38: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2038-pOSpzw33hBG902qrr1hNYXPiWUy9PD.png",
  41: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2041-pDvAdYf4yMSa03SK4rcaJ6apoyg8UQ.png",
  42: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2042-Fn1HokLTC5BpcEOQlD0KSZWjiqe5dq.png",
  43: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2043-0Gw9RXyKX5kvaRkMESaLxkAesgiEUL.png",
  44: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2044-7rubSVQ3zy3cJpbCxE3W3a19Sa9x9b.png",
  45: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2045-93LyNuZadHxgsXBhlVoHzrGncbTk9N.png",
  46: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2046-ZdQnMrbCPC2MJN7BGXYjxF3OEftTeO.png",
  47: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2047-0lISLUIgqZNF6UdrRwjTKINimSfpRf.png",
  48: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diente%2048-8kbolzzRrPXqEKtv8AbclVRYVoyyy6.png",
}

export function Tooth({ number, status = "healthy", onClick }: ToothProps) {
  const statusColors = {
    healthy: "from-green-500/50 to-green-400/50",
    completed: "from-blue-500/50 to-blue-400/50",
    "in-treatment": "from-yellow-500/50 to-yellow-400/50",
    pending: "from-red-500/50 to-red-400/50",
  }

  return (
    <div className="relative cursor-pointer group" onClick={onClick}>
      {/* Número del diente - Ahora siempre visible y en la capa superior */}
      <span className="absolute -top-1 right-0 text-sm font-medium text-gray-800 z-30 bg-white/50 px-1 rounded">
        {number}
      </span>

      {/* Contenedor principal */}
      <div className="relative h-16 w-16 flex items-center justify-center">
        {/* Imagen del diente */}
        {toothImages[number] ? (
          <Image
            src={toothImages[number] || "/placeholder.svg"}
            alt={`Diente ${number}`}
            width={56}
            height={56}
            className="object-contain z-10"
            crossOrigin="anonymous"
            priority
          />
        ) : (
          <div className="h-12 w-12 rounded-full border-2 border-gray-300 z-10"></div>
        )}

        {/* Círculo de estado con gradiente - Más pequeño y más transparente */}
        <div
          className={cn(
            "absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b z-20",
            statusColors[status],
          )}
        />
      </div>
    </div>
  )
}
