import { createClient } from "@supabase/supabase-js"

// Crear una única instancia del cliente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Desactivar la persistencia de sesión para evitar problemas
  },
})
