import { createClient } from "@supabase/supabase-js"

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno para Supabase")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySupabaseConfig() {
  console.log("Verificando configuración de Supabase...")

  // 1. Verificar conexión
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error("Error de conexión con Supabase:", error)
    } else {
      console.log("Conexión con Supabase establecida correctamente")
    }
  } catch (error) {
    console.error("Error inesperado al verificar conexión:", error)
  }

  // 2. Verificar buckets de storage
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error("Error al listar buckets:", error)
    } else {
      console.log(
        "Buckets disponibles:",
        buckets.map((b) => b.name),
      )

      // Verificar si existe el bucket treatment-images
      const treatmentBucket = buckets.find((b) => b.name === "treatment-images")

      if (treatmentBucket) {
        console.log("Bucket treatment-images encontrado:", treatmentBucket)
      } else {
        console.log("El bucket treatment-images no existe, intentando crearlo...")

        // Crear el bucket
        const { data, error } = await supabase.storage.createBucket("treatment-images", {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        })

        if (error) {
          console.error("Error al crear el bucket:", error)
        } else {
          console.log("Bucket creado exitosamente:", data)
        }
      }
    }
  } catch (error) {
    console.error("Error inesperado al verificar buckets:", error)
  }

  // 3. Verificar RLS en la tabla dental_treatments
  try {
    const { data, error } = await supabase.rpc("get_rls_enabled", {
      table_name: "dental_treatments",
      schema_name: "public",
    })

    if (error) {
      console.error("Error al verificar RLS:", error)
    } else {
      console.log("Estado de RLS para dental_treatments:", data)
    }
  } catch (error) {
    console.error("Error inesperado al verificar RLS:", error)
  }

  console.log("Verificación completada")
}

// Ejecutar la función principal
verifySupabaseConfig()
  .then(() => console.log("Proceso completado"))
  .catch((err) => console.error("Error en el proceso:", err))
