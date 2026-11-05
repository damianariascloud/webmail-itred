import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Verificar si las variables están llegando al cliente
if (typeof window !== 'undefined') {
  console.log('Supabase URL detectada:', supabaseUrl ? 'OK' : 'VACÍA')
}

// Fallback de seguridad si la URL viene vacía para evitar que la librería explote
const validUrl = supabaseUrl && supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : 'https://placeholder.supabase.co'

export const supabase = createClient(validUrl, supabaseAnonKey)