import { supabase } from "../lib/supabase"

async function fixTreatmentDates() {
  try {
    console.log("Iniciando corrección de fechas...")

    // Obtener todos los tratamientos
    const { data: treatments, error } = await supabase.from("dental_treatments").select("*")

    if (error) {
      throw error
    }

    console.log(`Encontrados ${treatments.length} tratamientos para procesar`)

    for (const treatment of treatments) {
      // Asegurarse de que la fecha está en UTC
      const treatmentDate = new Date(treatment.treatment_date)
      const utcDate = new Date(
        Date.UTC(treatmentDate.getUTCFullYear(), treatmentDate.getUTCMonth(), treatmentDate.getUTCDate()),
      )

      // Actualizar el registro con la fecha corregida
      const { error: updateError } = await supabase
        .from("dental_treatments")
        .update({
          treatment_date: utcDate.toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", treatment.id)

      if (updateError) {
        console.error(`Error al actualizar tratamiento ${treatment.id}:`, updateError)
        continue
      }

      console.log(`Tratamiento ${treatment.id} actualizado correctamente`)
    }

    console.log("Proceso de corrección de fechas completado")
  } catch (error) {
    console.error("Error al corregir fechas:", error)
  }
}

// Ejecutar la corrección
fixTreatmentDates()
  .then(() => console.log("Proceso completado"))
  .catch(console.error)
