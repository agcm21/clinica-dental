import { createClient } from "@supabase/supabase-js"

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan variables de entorno para Supabase")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createBucket() {
  try {
    // Intentar obtener el bucket para ver si existe
    const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket("treatment-images")

    if (getBucketError) {
      console.log("El bucket no existe, intentando crearlo...")

      // Crear el bucket
      const { data, error } = await supabase.storage.createBucket("treatment-images", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (error) {
        console.error("Error al crear el bucket:", error)
      } else {
        console.log("Bucket creado exitosamente:", data)

        // Configurar políticas para el bucket
        await setupBucketPolicies()
      }
    } else {
      console.log("El bucket ya existe:", existingBucket)

      // Actualizar las políticas del bucket existente
      await setupBucketPolicies()
    }
  } catch (error) {
    console.error("Error inesperado:", error)
  }
}

async function setupBucketPolicies() {
  try {
    // Obtener políticas existentes
    const { data: policies, error: policiesError } = await supabase.rpc("get_policies", {
      table_name: "objects",
      schema_name: "storage",
    })

    if (policiesError) {
      console.error("Error al obtener políticas:", policiesError)
      return
    }

    console.log("Políticas existentes:", policies)

    // Aquí puedes agregar lógica para crear o actualizar políticas si es necesario

    console.log("Configuración de políticas completada")
  } catch (error) {
    console.error("Error al configurar políticas:", error)
  }
}

// Ejecutar la función principal
createBucket()
  .then(() => console.log("Proceso completado"))
  .catch((err) => console.error("Error en el proceso:", err))
