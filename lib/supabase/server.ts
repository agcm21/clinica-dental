import { createClient as supabaseCreateClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Exportar la misma función que ya usas en otros lugares
export const createClient = () => {
  return supabaseCreateClient(supabaseUrl, supabaseKey)
}

// Por compatibilidad, exportar también como default
export default createClient
