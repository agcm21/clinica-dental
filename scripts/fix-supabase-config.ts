import { createClient } from "@supabase/supabase-js"

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan variables de entorno para Supabase")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixSupabaseConfig() {
  console.log("Iniciando corrección de configuración de Supabase...")

  try {
    // 1. Verificar conexión
    console.log("Verificando conexión con Supabase...")
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error de conexión con Supabase:", error)
      return
    }

    console.log("Conexión con Supabase establecida correctamente")

    // 2. Verificar y crear bucket si no existe
    console.log("Verificando bucket 'treatment-images'...")

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error al listar buckets:", bucketsError)
      return
    }

    const bucket = buckets.find((b) => b.name === "treatment-images")

    if (!bucket) {
      console.log("Bucket 'treatment-images' no encontrado, creando...")

      const { data: newBucket, error: createError } = await supabase.storage.createBucket("treatment-images", {
        public: true,
        fileSizeLimit: 5242880,
      })

      if (createError) {
        console.error("Error al crear bucket:", createError)
        return
      }

      console.log("Bucket creado exitosamente:", newBucket)
    } else {
      console.log("Bucket 'treatment-images' ya existe")

      // Actualizar configuración del bucket
      const { error: updateError } = await supabase.storage.updateBucket("treatment-images", {
        public: true,
        fileSizeLimit: 5242880,
      })

      if (updateError) {
        console.error("Error al actualizar bucket:", updateError)
      } else {
        console.log("Configuración del bucket actualizada correctamente")
      }
    }

    console.log("Configuración de Supabase corregida exitosamente")
  } catch (error) {
    console.error("Error inesperado:", error)
  }
}

// Ejecutar la función
fixSupabaseConfig()
  .then(() => console.log("Proceso completado"))
  .catch((err) => console.error("Error en el proceso:", err))
