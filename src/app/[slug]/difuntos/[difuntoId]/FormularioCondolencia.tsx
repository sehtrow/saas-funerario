// src/app/condolencias/[slug]/[difuntoId]/FormularioCondolenciaClient.tsx
'use client';

import { useState } from 'react';
import { enviarCondolencia } from '@/app/actions/condolencias';

export default function FormularioCondolenciaClient({ difunto }: { difunto: any }) {
  const [nombreAutor, setNombreAutor] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombreAutor.trim() || !mensaje.trim()) {
      setError('Por favor completa los campos obligatorios.');
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      const res = await enviarCondolencia({
        funerariaId: difunto.funerariaId,
        difuntoId: difunto.id,
        nombreAutor,
        parentesco,
        mensaje,
      });

      setEnviando(false);

      if (res && res.success) {
        setEnviado(true);
      } else {
        setError(res?.error || 'No se pudo registrar la condolencia.');
      }
    } catch (err: any) {
      setEnviando(false);
      setError('Error de conexión con el servidor. Revisa tu red.');
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
            {difunto.funeraria.nombre}
          </p>
          <h1 className="text-2xl font-serif font-bold text-amber-100/90 mt-2">
            En memoria de {difunto.nombre} {difunto.apellido}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Envía tus palabras de afecto para acompañar a la familia.
          </p>
        </div>

        {enviado ? (
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-6 text-center shadow-xl">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h2 className="text-lg font-semibold text-amber-100 mb-2">
              Mensaje Recibido
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Muchas gracias. Tu palabra de aliento ha sido registrada.
            </p>
            <button
              onClick={() => {
                setEnviado(false);
                setMensaje('');
              }}
              className="mt-6 text-xs text-amber-400 underline underline-offset-4 hover:text-amber-300"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-sm"
          >
            {error && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-red-200 text-xs text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tu Nombre completo <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={nombreAutor}
                onChange={(e) => setNombreAutor(e.target.value)}
                placeholder="Ej. María Fernández"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Relación o Parentesco <span className="text-slate-500">(Opcional)</span>
              </label>
              <input
                type="text"
                value={parentesco}
                onChange={(e) => setParentesco(e.target.value)}
                placeholder="Ej. Amiga de la infancia, Primo"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mensaje de Condolencia <span className="text-amber-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe aquí tus palabras para la familia..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-500/50 focus:outline-none transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-slate-950 font-semibold text-sm rounded-xl transition shadow-lg active:scale-[0.98]"
            >
              {enviando ? 'Enviando...' : 'Enviar Condolencia'}
            </button>
          </form>
        )}
      </div>

      <footer className="mt-8 text-center text-[10px] text-slate-600">
        Plataforma de Condolencias Digitales
      </footer>
    </main>
  );
}