import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { to, subject, message } = await request.json()
    const apiKey = process.env.SENDGRID_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta la API Key de SendGrid en el servidor' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { 
          email: 'damianariascloud@gmail.com', 
          name: 'Webmail @itredspaprueba.cl' 
        },
        subject: subject,
        content: [{ type: 'text/plain', value: message }],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return NextResponse.json(
        { error: `Error de SendGrid: ${errorBody}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Correo enviado con éxito' })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}