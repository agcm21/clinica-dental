import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const toothNumber = searchParams.get("toothNumber")
    const limit = searchParams.get("limit")

    let query = supabase.from("dental_treatments").select("*")

    if (patientId) {
      query = query.eq("patient_id", patientId)
    }

    if (toothNumber) {
      query = query.eq("tooth_number", toothNumber)
    }

    // Always order by created_at to get the most recent treatments first
    query = query.order("created_at", { ascending: false })

    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      console.error("Error al obtener tratamientos:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Ensure all treatments have a status
    const treatmentsWithStatus = data.map((treatment: any) => ({
      ...treatment,
      status: treatment.status || "healthy",
    }))

    return NextResponse.json(treatmentsWithStatus)
  } catch (error) {
    console.error("Error al obtener tratamientos:", error)
    return NextResponse.json({ error: "Error al obtener tratamientos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const treatmentData = await request.json()
    console.log("Datos recibidos para crear tratamiento:", treatmentData)

    // Validar datos requeridos
    if (!treatmentData.patient_id || !treatmentData.tooth_number) {
      return NextResponse.json({ error: "Se requiere ID del paciente y número de diente" }, { status: 400 })
    }

    // Asegurarse de que images sea un array válido
    if (treatmentData.images && !Array.isArray(treatmentData.images)) {
      treatmentData.images = []
      console.warn("El campo images no es un array, se ha inicializado como array vacío")
    }

    console.log("Creating treatment with images:", treatmentData.images)

    // Asegurarse de que todos los campos requeridos estén presentes
    const treatment = {
      patient_id: treatmentData.patient_id,
      tooth_number: treatmentData.tooth_number,
      tooth_zone: treatmentData.tooth_zone || "",
      treatment_type: treatmentData.treatment_type || "",
      treatment_date: treatmentData.treatment_date || new Date().toISOString().split("T")[0],
      details: treatmentData.details || "",
      status: treatmentData.status || "healthy",
      images: treatmentData.images || [], // Asegurarse de que images sea un array
    }

    const { data, error } = await supabase.from("dental_treatments").insert([treatment]).select()

    if (error) {
      console.error("Error al crear tratamiento:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Treatment created successfully:", data[0])
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear tratamiento:", error)
    return NextResponse.json({ error: "Error al crear tratamiento" }, { status: 500 })
  }
}
