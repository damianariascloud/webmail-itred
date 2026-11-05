'tsx'
import React from 'react';

export default function WebmailHome() {
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

        <form className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Correo electrónico</label>
            <input 
              type="email" 
              placeholder="usuario@itredspaprueba.cl"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-lg shadow-indigo-600/20 mt-2"
          >
            Acceder al Buzón
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Infraestructura impulsada por Next.js, Supabase y SendGrid
        </div>
      </div>
    </main>
  );
}