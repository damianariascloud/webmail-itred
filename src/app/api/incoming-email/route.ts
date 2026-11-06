import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicializar cliente de Supabase con service role o variables estándar
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    // Extraer campos enviados por SendGrid Inbound Parse
    const to = formData.get('to')?.toString() || ''
    const from = formData.get('from')?.toString() || ''
    const subject = formData.get('subject')?.toString() || '(Sin asunto)'
    const text = formData.get('text')?.toString() || formData.get('html')?.toString() || ''

    // Limpiar remitente y destinatario si contienen nombres (ej: "Juan <juan@mail.com>")
    const cleanRecipient = to.match(/<([^>]+)>/)?.[1] || to.trim()
    const cleanSender = from.match(/<([^>]+)>/)?.[1] || from.trim()

    // Buscar el user_id del usuario dueño del correo en Supabase
    // (Buscamos si existe un usuario registrado en auth.users o insertamos asociando el correo)
    const { data: userData } = await supabase
      .from('emails')
      .select('user_id')
      .ilike('sender', cleanRecipient)
      .limit(1)
      .single()

    const userId = userData?.user_id || null

    // Guardar el correo entrante en la tabla 'emails'
    const { error } = await supabase.from('emails').insert({
      user_id: userId,
      sender: cleanSender,
      recipient: cleanRecipient,
      subject: subject,
      message: text,
      folder: 'inbox',
    })

    if (error) {
      console.error('Error insertando correo entrante en Supabase:', error)
      return NextResponse.json({ error: 'Error guardando correo' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Correo recibido y procesado' })
  } catch (err: any) {
    console.error('Error en Webhook Inbound Parse:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}