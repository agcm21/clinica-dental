import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Verificar si estamos en modo de prueba
const isTesting = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DISABLE_SUPABASE === "true"

if (isTesting) {
  console.log("Supabase initialization disabled for testing")
}

// Verificar que las variables de entorno estén definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Imprimir información de diagnóstico (solo en desarrollo)
if (process.env.NODE_ENV === "development") {
  console.log("Supabase URL definida:", !!supabaseUrl)
  console.log("Supabase Anon Key definida:", !!supabaseAnonKey)
}

// Crear cliente de Supabase con manejo de errores
let supabase: any

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key not set in environment variables")
  }

  // Crear cliente de Supabase
  supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Desactivar persistencia para evitar problemas
    },
  })

  // Verificar que el cliente se creó correctamente
  if (!supabase) {
    throw new Error("Failed to initialize Supabase client")
  }
  
  if (process.env.NODE_ENV === "development") {
    console.log("Cliente Supabase inicializado correctamente")
  }
} catch (error) {
  console.error("Error initializing Supabase:", error)

  // Crear un cliente mock para evitar errores en tiempo de ejecución
  supabase = {
    from: () => ({
      select: () => ({ data: null, error: new Error("Supabase not initialized") }),
      insert: () => ({ data: null, error: new Error("Supabase not initialized") }),
      update: () => ({ data: null, error: new Error("Supabase not initialized") }),
      delete: () => ({ data: null, error: new Error("Supabase not initialized") }),
    }),
    auth: {
      getSession: () => ({ data: null, error: new Error("Supabase not initialized") }),
    },
    storage: {
      from: () => ({
        upload: () => ({ data: null, error: new Error("Supabase not initialized") }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
  }
}

export { supabase }

// Función para crear un nuevo cliente de Supabase (útil para las API routes)
export function getSupabaseClient() {
  if (isTesting) {
    console.log("Creando cliente mock para testing")
    return supabase;
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("No se pueden obtener las credenciales de Supabase")
    return supabase;
  }
  
  try {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });
  } catch (error) {
    console.error("Error al crear nuevo cliente Supabase:", error);
    return supabase;
  }
}

// Función para verificar la configuración de Supabase
export async function verifyStorageSetup() {
  if (isTesting) {
    return false
  }

  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase URL or Anon Key not set in environment variables!")
      return false
    }

    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error connecting to Supabase:", error)
      return false
    }

    return true
  } catch (err) {
    console.error("Unexpected error verifying Supabase setup:", err)
    return false
  }
}
export const createClient = getSupabaseClient;


