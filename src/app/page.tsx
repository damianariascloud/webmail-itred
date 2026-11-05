'use client'

import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function WebmailHome() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [user, setUser] = useState<any>(null)

  // Estado para redacción de correo
  const [isComposing, setIsComposing] = useState(false)
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setUser(data.user)
    }
    setLoading(false)
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendStatus(null)

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, message }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSendStatus({ type: 'success', text: '¡Correo enviado con éxito!' })
        setTo('')
        setSubject('')
        setMessage('')
        setTimeout(() => setIsComposing(false), 2000)
      } else {
        setSendStatus({ type: 'error', text: data.error || 'Error al enviar el correo' })
      }
    } catch (err: any) {
      setSendStatus({ type: 'error', text: 'Error de conexión al enviar el correo' })
    } finally {
      setSending(false)
    }
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
              onClick={() => supabase.auth.signOut().then(() => setUser(null))}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Layout principal */}
        <div className="flex-1 flex p-6 gap-6 max-w-6xl w-full mx-auto">
          {/* Barra lateral */}
          <aside className="w-64 space-y-4">
            <button
              onClick={() => setIsComposing(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <span>✏️</span> Redactar Correo
            </button>

            <nav className="space-y-1 text-sm font-medium">
              <div className="bg-slate-900 text-indigo-400 px-4 py-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                <span>📥 Bandeja de Entrada</span>
                <span className="text-xs bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded-full text-indigo-300">0</span>
              </div>
              <div className="text-slate-400 hover:bg-slate-900 px-4 py-2.5 rounded-xl transition-colors cursor-pointer">
                📤 Enviados
              </div>
            </nav>
          </aside>

          {/* Vista principal de correo */}
          <section className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <p className="text-slate-400 text-sm">No hay mensajes recientes en tu bandeja de entrada.</p>
            <p className="text-xs text-slate-600 mt-2">Prueba enviando tu primer correo usando el botón "Redactar Correo".</p>
          </section>
        </div>

        {/* Modal de Redacción */}
        {isComposing && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <h3 className="font-semibold text-white text-base">Nuevo Mensaje</h3>
                <button
                  onClick={() => setIsComposing(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {sendStatus && (
                <div
                  className={`mb-4 p-3 rounded-lg text-xs border ${
                    sendStatus.type === 'success'
                      ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                      : 'bg-red-950/50 border-red-800 text-red-300'
                  }`}
                >
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
                  <button
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg text-xs transition-colors shadow-lg shadow-indigo-600/20"
                  >
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

        <div className="mt-6 text-center text-xs text-slate-500">
          Infraestructura impulsada por Next.js, Supabase y SendGrid
        </div>
      </div>
    </main>
  )
}