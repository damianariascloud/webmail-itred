'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface EmailItem {
  id: string
  sender: string
  recipient: string
  subject: string
  message: string
  folder: string
  created_at: string
}

export default function WebmailHome() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [user, setUser] = useState<any>(null)

  // Navegación de carpetas e historial
  const [currentFolder, setCurrentFolder] = useState<'inbox' | 'sent'>('inbox')
  const [emailsList, setEmailsList] = useState<EmailItem[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null)

  // Estado para redacción de correo
  const [isComposing, setIsComposing] = useState(false)
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Control de Sesión
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setCheckingAuth(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setCheckingAuth(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Cargar correos según carpeta seleccionada
  const fetchEmails = async () => {
    if (!user) return
    setLoadingEmails(true)

    let query = supabase.from('emails').select('*').order('created_at', { ascending: false })

    if (currentFolder === 'sent') {
      query = query.eq('user_id', user.id).eq('folder', 'sent')
    } else {
      query = query.or(`recipient.eq.${user.email},and(folder.eq.inbox,user_id.eq.${user.id})`)
    }

    const { data, error } = await query

    if (!error && data) {
      setEmailsList(data as EmailItem[])
    }
    setLoadingEmails(false)
  }

  useEffect(() => {
    if (user) {
      fetchEmails()
    }
  }, [user, currentFolder])

  // Login & Logout
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setUser(data.user)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Envío y Guardado de Correo
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendStatus(null)

    try {
      // 1. Enviar vía SendGrid API
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, message }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // 2. Guardar en base de datos Supabase
        await supabase.from('emails').insert({
          user_id: user.id,
          sender: user.email,
          recipient: to,
          subject,
          message,
          folder: 'sent',
        })

        setSendStatus({ type: 'success', text: '¡Correo enviado y registrado con éxito!' })
        setTo('')
        setSubject('')
        setMessage('')
        
        // Refrescar lista si estamos en enviados
        if (currentFolder === 'sent') {
          fetchEmails()
        }

        setTimeout(() => setIsComposing(false), 1500)
      } else {
        setSendStatus({ type: 'error', text: data.error || 'Error al enviar el correo' })
      }
    } catch {
      setSendStatus({ type: 'error', text: 'Error de conexión al enviar el correo' })
    } finally {
      setSending(false)
    }
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">Verificando sesión...</p>
        </div>
      </main>
    )
  }

  if (user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Navbar */}
        <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-800/50">
              @itredspaprueba.cl
            </span>
            <h1 className="text-lg font-bold text-white">Webmail Central</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Layout principal */}
        <div className="flex-1 flex p-6 gap-6 max-w-6xl w-full mx-auto">
          {/* Sidebar */}
          <aside className="w-64 space-y-4">
            <button
              onClick={() => setIsComposing(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <span>✏️</span> Redactar Correo
            </button>

            <nav className="space-y-1 text-sm font-medium">
              <button
                onClick={() => { setCurrentFolder('inbox'); setSelectedEmail(null); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl border flex justify-between items-center transition-colors ${
                  currentFolder === 'inbox'
                    ? 'bg-slate-900 text-indigo-400 border-slate-800'
                    : 'text-slate-400 border-transparent hover:bg-slate-900'
                }`}
              >
                <span>📥 Bandeja de Entrada</span>
              </button>

              <button
                onClick={() => { setCurrentFolder('sent'); setSelectedEmail(null); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl border flex justify-between items-center transition-colors ${
                  currentFolder === 'sent'
                    ? 'bg-slate-900 text-indigo-400 border-slate-800'
                    : 'text-slate-400 border-transparent hover:bg-slate-900'
                }`}
              >
                <span>📤 Enviados</span>
              </button>
            </nav>
          </aside>

          {/* Panel de Correos */}
          <section className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h2 className="text-sm font-semibold text-slate-300 mb-4 capitalize">
              {currentFolder === 'inbox' ? 'Bandeja de Entrada' : 'Correos Enviados'}
            </h2>

            {loadingEmails ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                Cargando mensajes...
              </div>
            ) : selectedEmail ? (
              /* Vista Detalle del Correo */
              <div className="space-y-4 flex-1 flex flex-col">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1 self-start"
                >
                  ← Volver a la lista
                </button>
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-lg font-bold text-white">{selectedEmail.subject}</h3>
                  <div className="text-xs text-slate-400 mt-1 flex justify-between">
                    <span>De: {selectedEmail.sender} | Para: {selectedEmail.recipient}</span>
                    <span>{new Date(selectedEmail.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-sm text-slate-300 whitespace-pre-wrap flex-1">
                  {selectedEmail.message}
                </div>
              </div>
            ) : emailsList.length === 0 ? (
              /* Estado Vacío */
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-slate-400 text-sm">No hay mensajes en {currentFolder === 'inbox' ? 'tu bandeja de entrada' : 'enviados'}.</p>
                <p className="text-xs text-slate-600 mt-1">
                  {currentFolder === 'sent' ? 'Los correos que envíes aparecerán listados aquí.' : 'Los correos entrantes aparecerán aquí.'}
                </p>
              </div>
            ) : (
              /* Lista de Correos */
              <div className="space-y-2 overflow-y-auto">
                {emailsList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEmail(item)}
                    className="p-3.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer transition-colors flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-indigo-300">
                        {currentFolder === 'sent' ? `Para: ${item.recipient}` : `De: ${item.sender}`}
                      </div>
                      <div className="text-sm text-slate-200 font-medium">{item.subject}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{item.message}</div>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap ml-4">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Modal de Redacción */}
        {isComposing && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <h3 className="font-semibold text-white text-base">Nuevo Mensaje</h3>
                <button onClick={() => setIsComposing(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
              </div>

              {sendStatus && (
                <div className={`mb-4 p-3 rounded-lg text-xs border ${
                  sendStatus.type === 'success' ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300' : 'bg-red-950/50 border-red-800 text-red-300'
                }`}>
                  {sendStatus.text}
                </div>
              )}

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Para:</label>
                  <input
                    type="email"
                    required
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="destino@ejemplo.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Asunto:</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Prueba de envío Webmail"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Mensaje:</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tu correo aquí..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsComposing(false)} className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={sending} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors shadow-lg shadow-indigo-600/20">
                    {sending ? 'Enviando...' : 'Enviar Correo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    )
  }

  // Formulario de Login
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-800/50">
            @itredspaprueba.cl
          </span>
          <h1 className="text-2xl font-bold mt-4 text-white">Webmail Central</h1>
          <p className="text-sm text-slate-400 mt-1">Inicia sesión para acceder a tu bandeja</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@itredspaprueba.cl"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-lg shadow-indigo-600/20 mt-2"
          >
            {loading ? 'Verificando...' : 'Acceder al Buzón'}
          </button>
        </form>
      </div>
    </main>
  )
}