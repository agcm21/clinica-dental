import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { deleteTreatmentImage } from "@/lib/supabase-storage"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase.from("dental_treatments").select("*").eq("id", params.id).single()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: "Treatment not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching dental treatment:", error)
    return NextResponse.json({ error: "Failed to fetch dental treatment" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("Datos recibidos para actualizar tratamiento:", body)

    // Validar los campos requeridos
    if (!body.tooth_number || !body.treatment_type || !body.treatment_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Asegurarse de que images sea un array válido
    if (body.images && !Array.isArray(body.images)) {
      body.images = []
      console.warn("El campo images no es un array, se ha inicializado como array vacío")
    }

    console.log("Updating treatment with images:", body.images)

    // Actualizar el tratamiento en la base de datos
    const { data, error } = await supabase
      .from("dental_treatments")
      .update({
        tooth_number: body.tooth_number,
        tooth_zone: body.tooth_zone || "",
        treatment_type: body.treatment_type,
        treatment_date: body.treatment_date,
        details: body.details || "",
        status: body.status || "healthy",
        images: body.images || [], // Asegurar que el array de imágenes se preserve
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()

    if (error) {
      console.error("Error updating treatment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Verificar que los datos se actualizaron correctamente
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No se pudo actualizar el tratamiento" }, { status: 404 })
    }

    console.log("Treatment updated successfully:", data[0])
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error updating dental treatment:", error)
    return NextResponse.json({ error: "Failed to update dental treatment" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Primero obtenemos el tratamiento para ver si tiene imágenes
    const { data: treatment, error: fetchError } = await supabase
      .from("dental_treatments")
      .select("images")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // Si el tratamiento tiene imágenes, las eliminamos del storage
    if (treatment && treatment.images && treatment.images.length > 0) {
      for (const image of treatment.images) {
        if (image.path) {
          try {
            await deleteTreatmentImage(image.path)
          } catch (error) {
            console.error("Error al eliminar imagen:", error)
            // Continuamos con la eliminación del tratamiento aunque falle la eliminación de alguna imagen
          }
        }
      }
    }

    // Eliminar el tratamiento de la base de datos
    const { error } = await supabase.from("dental_treatments").delete().eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting dental treatment:", error)
    return NextResponse.json({ error: "Failed to delete dental treatment" }, { status: 500 })
  }
}
