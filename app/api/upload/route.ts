import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo excede el tamaño máximo de 5MB" }, { status: 400 })
    }

    // Verificar tipos de archivo permitidos
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato de archivo no válido. Sólo se permiten imágenes JPG, PNG y WEBP" },
        { status: 400 },
      )
    }

    // Determinar la carpeta según el tipo
    const folder = type === "presupuesto" ? "presupuestos" : "general"

    // Generar nombre único para el archivo
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `${folder}/${uuidv4()}.${fileExt}`

    // Convertir el archivo a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage.from("media-files").upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error al subir archivo:", error)
      return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage.from("media-files").getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    })
  } catch (error) {
    console.error("Error en la carga de archivos:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud de carga de archivos" }, { status: 500 })
  }
}

