import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Obtener información del paciente
    const { data: patient, error: patientError } = await supabase.from("patients").select("*").eq("id", id).single()

    if (patientError) {
      return NextResponse.json({ error: patientError.message }, { status: 500 })
    }

    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    }

    // Obtener los tratamientos del paciente
    const { data: treatments, error: treatmentsError } = await supabase
      .from("dental_treatments")
      .select("*")
      .eq("patient_id", id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (treatmentsError) {
      console.error("Error al obtener tratamientos:", treatmentsError)
    }

    // Obtener las citas del paciente
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", id)
      .gte("appointment_date", new Date().toISOString().split("T")[0]) // Solo citas futuras
      .order("appointment_date", { ascending: true })
      .limit(1) // Solo la próxima cita

    if (appointmentsError) {
      console.error("Error al obtener citas:", appointmentsError)
    }

    // Obtener información financiera del paciente
    const { data: invoices, error: invoicesError } = await supabase.from("invoices").select("*").eq("patient_id", id)

    if (invoicesError) {
      console.error("Error al obtener facturas:", invoicesError)
    }

    // Obtener documentos del paciente
    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select("*")
      .eq("patient_id", id)
      .order("created_at", { ascending: false })

    if (documentsError) {
      console.error("Error al obtener documentos:", documentsError)
    }

    // Calcular información financiera
    let financial = null
    if (invoices && invoices.length > 0) {
      const total = invoices.reduce((sum: number, invoice: any) => sum + invoice.total_amount, 0)
      const paid = invoices.reduce((sum: number, invoice: any) => sum + invoice.paid_amount, 0)
      const pending = total - paid

      financial = {
        total,
        paid,
        pending,
      }
    }

    // Mapeo de estados a etiquetas legibles
    const statusLabels: { [key: string]: string } = {
      healthy: "Saludable",
      completed: "Completado",
      "in-treatment": "En Tratamiento",
      pending: "Sin tratamiento",
    }

    // Formatear los tratamientos recientes
    const recentTreatments =
      treatments?.map((treatment: any) => ({
        id: treatment.id,
        date: new Date(treatment.created_at).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        treatment: treatment.treatment_type || "Tratamiento sin especificar",
        details: treatment.details || "",
        tooth: treatment.tooth_number,
        zone: treatment.tooth_zone || "",
        status: treatment.status || "healthy",
        statusLabel: statusLabels[treatment.status || "healthy"] || "Saludable",
        images: treatment.images || [],
      })) || []

    // Formatear la próxima cita
    let nextAppointment = null
    if (appointments && appointments.length > 0) {
      const appointment = appointments[0]
      nextAppointment = {
        id: appointment.id,
        date: new Date(appointment.appointment_date).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        time: appointment.appointment_time,
        treatment: appointment.treatment_type,
      }
    }

    // Formatear los documentos
    const formattedDocuments =
      documents?.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        url: doc.url,
        type: doc.type,
      })) || []

    return NextResponse.json({
      nextAppointment,
      financial,
      recentTreatments,
      documents: formattedDocuments,
    })
  } catch (error) {
    console.error("Error al obtener detalles del paciente:", error)
    return NextResponse.json({ error: "Error al obtener detalles del paciente" }, { status: 500 })
  }
}
