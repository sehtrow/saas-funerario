// src/app/[slug]/difuntos/[difuntoId]/FormularioCondolencia.tsx
'use client'; // o 'use client' según corresponda

import { useState } from 'react';
import { enviarCondolencia } from '@/app/actions/condolencias';

interface DifuntoType {
  id: string;
  funerariaId: string;
  nombre: string;
  apellido: string;
  funeraria: {
    nombre: string;
  };
}

interface FormularioCondolenciaProps {
  difunto: DifuntoType; // <-- Ahora es un objeto, no un string
  slug: string;
}

export default function FormularioCondolencia({ difunto, slug }: FormularioCondolenciaProps) {
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
    <div>
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
          {difunto.funeraria.nombre}
        </p>
        <h1 className="text-2xl font-serif font-bold text-slate-900 mt-2">
          En memoria de {difunto.nombre} {difunto.apellido}
        </h1>
      </div>

      {enviado ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Mensaje Recibido</h2>
          <p className="text-sm text-slate-600">Muchas gracias. Tu mensaje ha sido registrado.</p>
          <button
            onClick={() => {
              setEnviado(false);
              setMensaje('');
            }}
            className="mt-4 text-xs text-slate-900 underline"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tu Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombreAutor}
              onChange={(e) => setNombreAutor(e.target.value)}
              placeholder="Ej. María Fernández"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Relación o Parentesco <span className="text-slate-400">(Opcional)</span>
            </label>
            <input
              type="text"
              value={parentesco}
              onChange={(e) => setParentesco(e.target.value)}
              placeholder="Ej. Amiga de la infancia"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Mensaje de Condolencia <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe aquí tus palabras..."
              className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl transition shadow-sm"
          >
            {enviando ? 'Enviando...' : 'Enviar Condolencia'}
          </button>
        </form>
      )}
    </div>
  );
}