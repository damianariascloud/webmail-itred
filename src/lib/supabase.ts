import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl) {
  console.error("⚠️ Atención: La variable NEXT_PUBLIC_SUPABASE_URL está vacía.")
}

if (!supabaseAnonKey) {
  console.error("⚠️ Atención: La variable NEXT_PUBLIC_SUPABASE_ANON_KEY está vacía.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)