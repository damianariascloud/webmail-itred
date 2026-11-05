'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function WebmailHome() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [user, setUser] = useState<any>(null)

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

  if (user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-white">Bandeja de Entrada</h1>
              <p className="text-xs text-indigo-400">{user.email}</p>
            </div>
            <button
              onClick={() => supabase.auth.signOut().then(() => setUser(null))}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>

          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
            <p className="text-slate-400 text-sm">Sesión iniciada con éxito en @itredspaprueba.cl</p>
            <p className="text-xs text-slate-600 mt-2">Próximo paso: Cargar correos desde Supabase / SendGrid</p>
          </div>
        </div>
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