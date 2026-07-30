// src/app/admin/moderacion/[slug]/[difuntoId]/PanelModeracionClient.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { cambiarEstadoCondolencia } from '@/app/actions/moderacion';
import { EstadoCondolencia } from '@prisma/client';
import { pusherClient } from '@/lib/pusher/client';

interface Condolencia {
  id: string;
  nombreAutor: string;
  parentesco: string | null;
  mensaje: string;
  estado: EstadoCondolencia;
  creadoEn: Date;
}

interface DifuntoModeracion {
  id: string;
  nombre: string;
  apellido: string;
  funeraria: {
    id?: string; // Necesario si filtramos por canal de funeraria
    nombre: string;
    slug: string;
  };
  condolencias: Condolencia[];
}

export default function PanelModeracionClient({
  difuntoInicial,
}: {
  difuntoInicial: DifuntoModeracion;
}) {
  const [condolencias, setCondolencias] = useState<Condolencia[]>(
    difuntoInicial.condolencias
  );
  const [filtroEstado, setFiltroEstado] = useState<EstadoCondolencia | 'TODOS'>(
    EstadoCondolencia.PENDIENTE
  );
  const [isPending, startTransition] = useTransition();

  // Escuchar mensajes entrantes en tiempo real mediante WebSockets
useEffect(() => {
  const canalId = `difunto-${difuntoInicial.id}`;
  const canal = pusherClient.subscribe(canalId);

  canal.bind('condolencia:creada', (nuevaCondolencia: any) => {
    setCondolencias((prev) => [
      {
        ...nuevaCondolencia,
        creadoEn: new Date(nuevaCondolencia.createdAt || nuevaCondolencia.creadoEn),
      },
      ...prev,
    ]);
  });

  return () => {
    canal.unbind_all();
    pusherClient.unsubscribe(canalId);
  };
}, [difuntoInicial.id]);

  const handleAccion = (id: string, nuevoEstado: EstadoCondolencia) => {
    // Actualización optimista en la interfaz
    setCondolencias((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estado: nuevoEstado } : item
      )
    );

    startTransition(async () => {
      const pathTv = `/tv/${difuntoInicial.funeraria.slug}/${difuntoInicial.id}`;
      await cambiarEstadoCondolencia(id, nuevoEstado, pathTv);
    });
  };

  const filtradas =
    filtroEstado === 'TODOS'
      ? condolencias
      : condolencias.filter((c) => c.estado === filtroEstado);

  const conteoPendientes = condolencias.filter(
    (c) => c.estado === EstadoCondolencia.PENDIENTE
  ).length;
  const conteoAprobados = condolencias.filter(
    (c) => c.estado === EstadoCondolencia.APROBADO
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cabecera del Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400/90 font-medium">
              Panel de Moderación • {difuntoInicial.funeraria.nombre}
            </span>
            <h1 className="text-2xl font-serif font-bold text-slate-100 mt-1">
              {difuntoInicial.nombre} {difuntoInicial.apellido}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/tv/${difuntoInicial.funeraria.slug}/${difuntoInicial.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl transition border border-slate-700/60"
            >
              📺 Ver Pantalla TV
            </a>
          </div>
        </div>

        {/* Filtros por Pestañas */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setFiltroEstado(EstadoCondolencia.PENDIENTE)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 ${
              filtroEstado === EstadoCondolencia.PENDIENTE
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Pendientes
            {conteoPendientes > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px]">
                {conteoPendientes}
              </span>
            )}
          </button>

          <button
            onClick={() => setFiltroEstado(EstadoCondolencia.APROBADO)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 ${
              filtroEstado === EstadoCondolencia.APROBADO
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Aprobados ({conteoAprobados})
          </button>

          <button
            onClick={() => setFiltroEstado(EstadoCondolencia.RECHAZADO)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              filtroEstado === EstadoCondolencia.RECHAZADO
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Rechazados
          </button>

          <button
            onClick={() => setFiltroEstado('TODOS')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              filtroEstado === 'TODOS'
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos
          </button>
        </div>

        {/* Lista de Mensajes */}
        <div className="space-y-4">
          {filtradas.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/30 border border-slate-800/60 rounded-2xl">
              <p className="text-sm text-slate-500">
                No hay mensajes en esta categoría.
              </p>
            </div>
          ) : (
            filtradas.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-slate-700/80"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-amber-100">
                      {item.nombreAutor}
                    </h3>
                    {item.parentesco && (
                      <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-md text-slate-400 border border-slate-700/50">
                        {item.parentesco}
                      </span>
                    )}
                    <span
                      className={`ml-auto sm:ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                        item.estado === EstadoCondolencia.PENDIENTE
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : item.estado === EstadoCondolencia.APROBADO
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {item.estado}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed italic font-light">
                    "{item.mensaje}"
                  </p>

                  <p className="text-[11px] text-slate-500" suppressHydrationWarning>
                    {new Date(item.creadoEn).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(item.creadoEn).toLocaleTimeString('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Acciones del Administrador */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {item.estado !== EstadoCondolencia.APROBADO && (
                    <button
                      disabled={isPending}
                      onClick={() =>
                        handleAccion(item.id, EstadoCondolencia.APROBADO)
                      }
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-xl transition shadow-md shadow-emerald-950/20 active:scale-95 disabled:opacity-50"
                    >
                      Aprobar ✓
                    </button>
                  )}

                  {item.estado !== EstadoCondolencia.RECHAZADO && (
                    <button
                      disabled={isPending}
                      onClick={() =>
                        handleAccion(item.id, EstadoCondolencia.RECHAZADO)
                      }
                      className="px-4 py-2 bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-300 font-medium text-xs rounded-xl transition border border-slate-700/60 active:scale-95 disabled:opacity-50"
                    >
                      Rechazar ✕
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}