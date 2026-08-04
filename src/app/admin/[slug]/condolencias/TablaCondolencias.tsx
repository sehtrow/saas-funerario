'use client';

import { useState, useTransition } from 'react';
import {
  cambiarEstadoCondolencia,
  eliminarCondolencia,
  cambiarConfiguracionModeracion,
} from '@/app/actions/condolencias';

interface CondolenciaConDifunto {
  id: string;
  nombreAutor: string;
  mensaje: string;
  parentesco?: string | null;
  estado: EstadoCondolencia;
  creadoEn: Date;
  difunto: {
    id: string;
    nombre: string;
    funeraria: {
      id: string;
      slug: string;
      nombre: string;
      requiereModeracion: boolean;
    };
  };
}

export default function TablaCondolencias({
  condolencias,
  funeraria,
}: {
  condolencias: CondolenciaConDifunto[];
  funeraria: {
    id: string;
    requiereModeracion: boolean;
  };
}) {
  const [filtro, setFiltro] = useState<'TODOS' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'>('PENDIENTE');
  const [requiereModeracion, setRequiereModeracion] = useState(funeraria.requiereModeracion);
  const [isPending, startTransition] = useTransition();

  const condolenciasFiltradas = condolencias.filter((c) => {
    if (filtro === 'TODOS') return true;
    return c.estado === filtro;
  });

  const handleToggleModeracion = (nuevoValor: boolean) => {
    setRequiereModeracion(nuevoValor);
    startTransition(async () => {
      await cambiarConfiguracionModeracion(funeraria.id, nuevoValor);
    });
  };

  const handleEstado = (c: CondolenciaConDifunto, nuevoEstado: 'APROBADO' | 'RECHAZADO') => {
    startTransition(async () => {
      await cambiarEstadoCondolencia(
        c.id,
        nuevoEstado,
        c.difunto.funeraria.slug,
        c.difunto.id
      );
    });
  };

  const handleEliminar = (c: CondolenciaConDifunto) => {
    if (!confirm('¿Deseas eliminar permanentemente esta condolencia?')) return;

    startTransition(async () => {
      await eliminarCondolencia(c.id, c.difunto.funeraria.slug, c.difunto.id);
    });
  };

  return (
    <div className="space-y-6">
      {/* TARJETA DE CONFIGURACIÓN DE MODERACIÓN */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="font-semibold text-slate-900 text-base">
            Modo de Moderación Previa
          </h3>
          <p className="text-sm text-slate-500">
            {requiereModeracion
              ? 'Activado: Las condolencias requieren aprobación antes de mostrarse en la TV.'
              : 'Desactivado: Las condolencias publicadas se aprueban automáticamente en tiempo real.'}
          </p>
        </div>

        {/* Interruptor Toggle */}
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={requiereModeracion}
            disabled={isPending}
            onChange={(e) => handleToggleModeracion(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {/* Pestañas de Filtro */}
      <div className="flex gap-2 border-b border-slate-200">
        {(['PENDIENTE', 'APROBADO', 'RECHAZADO', 'TODOS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFiltro(tab)}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              filtro === tab
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'TODOS' ? 'Todos' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Lista / Tabla de Condolencias */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {condolenciasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic">
            No hay condolencias en este estado.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {condolenciasFiltradas.map((c) => (
              <div
                key={c.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900">{c.nombreAutor}</span>
                    {c.parentesco && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {c.parentesco}
                      </span>
                    )}
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      Para: <strong className="text-slate-700">{c.difunto.nombre}</strong>
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">{c.mensaje}</p>

                  <div className="text-xs text-slate-400 flex items-center gap-3 pt-1">
                    <span>
                      {new Date(c.creadoEn).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase ${
                        c.estado === 'APROBADO'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.estado === 'RECHAZADO'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {c.estado}
                    </span>
                  </div>
                </div>

                {/* Acciones de Moderación */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {c.estado !== 'APROBADO' && (
                    <button
                      onClick={() => handleEstado(c, 'APROBADO')}
                      disabled={isPending}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                  )}

                  {c.estado !== 'RECHAZADO' && (
                    <button
                      onClick={() => handleEstado(c, 'RECHAZADO')}
                      disabled={isPending}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  )}

                  <button
                    onClick={() => handleEliminar(c)}
                    disabled={isPending}
                    className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    title="Eliminar registro"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}