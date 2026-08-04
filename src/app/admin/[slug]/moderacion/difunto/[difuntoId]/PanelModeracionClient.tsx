// src/app/admin/moderacion/[slug]/[difuntoId]/PanelModeracionClient.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { cambiarEstadoCondolencia } from '@/app/actions/condolencias';
import { EstadoCondolencia } from '@prisma/client';
import { pusherClient } from '@/lib/pusher/client';
import { Image as ImageIcon, X, Trash2 } from 'lucide-react';

interface Condolencia {
  id: string;
  nombreAutor: string;
  parentesco: string | null;
  mensaje: string;
  estado: EstadoCondolencia;
  fotoUrl: string | null;
  creadoEn: Date;
}

interface DifuntoModeracion {
  id: string;
  nombre: string;
  apellido: string;
  funeraria: {
    id?: string;
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

  // Estado para la imagen en pantalla completa (Lightbox modal)
  const [imagenModal, setImagenModal] = useState<string | null>(null);

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
  const conteoRechazados = condolencias.filter(
    (c) => c.estado === EstadoCondolencia.RECHAZADO
  ).length;
  const conteoEliminados = condolencias.filter(
    (c) => c.estado === EstadoCondolencia.ELIMINADO
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
              href={`/${difuntoInicial.funeraria.slug}/tv/${difuntoInicial.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl transition border border-slate-700/60"
            >
              📺 Ver Pantalla TV
            </a>
          </div>
        </div>

        {/* Filtros por Pestañas */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setFiltroEstado(EstadoCondolencia.PENDIENTE)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 shrink-0 ${
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
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 shrink-0 ${
              filtroEstado === EstadoCondolencia.APROBADO
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Aprobados ({conteoAprobados})
          </button>

          <button
            onClick={() => setFiltroEstado(EstadoCondolencia.RECHAZADO)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 shrink-0 ${
              filtroEstado === EstadoCondolencia.RECHAZADO
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Rechazados ({conteoRechazados})
          </button>

          <button
            onClick={() => setFiltroEstado(EstadoCondolencia.ELIMINADO)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-2 shrink-0 ${
              filtroEstado === EstadoCondolencia.ELIMINADO
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Eliminados ({conteoEliminados})
          </button>

          <button
            onClick={() => setFiltroEstado('TODOS')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition shrink-0 ${
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
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 transition hover:border-slate-700/80"
              >
                {/* Contenido principal */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-amber-100">
                      {item.nombreAutor}
                    </h3>
                    {item.parentesco && (
                      <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-md text-slate-400 border border-slate-700/50">
                        {item.parentesco}
                      </span>
                    )}
                    <span
                      className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                        item.estado === EstadoCondolencia.PENDIENTE
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : item.estado === EstadoCondolencia.APROBADO
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.estado === EstadoCondolencia.RECHAZADO
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {item.estado}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed italic font-light">
                    "{item.mensaje}"
                  </p>

                  {/* 📷 Previsualización de Imagen si existe */}
                  {item.fotoUrl && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setImagenModal(item.fotoUrl)}
                        className="group relative flex items-center gap-2 p-1.5 pr-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition text-left cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                          <img
                            src={item.fotoUrl}
                            alt="Adjunto"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                            Ver imagen adjunta
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Haz clic para ampliar
                          </span>
                        </div>
                      </button>
                    </div>
                  )}

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
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {item.estado !== EstadoCondolencia.APROBADO && (
                    <button
                      disabled={isPending}
                      onClick={() =>
                        handleAccion(item.id, EstadoCondolencia.APROBADO)
                      }
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs rounded-xl transition shadow-md shadow-emerald-950/20 active:scale-95 disabled:opacity-50 cursor-pointer"
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
                      className="px-4 py-2 bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-300 font-medium text-xs rounded-xl transition border border-slate-700/60 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      Rechazar ✕
                    </button>
                  )}

                  {item.estado !== EstadoCondolencia.ELIMINADO && (
                    <button
                      disabled={isPending}
                      onClick={() =>
                        handleAccion(item.id, EstadoCondolencia.ELIMINADO)
                      }
                      className="px-3 py-2 bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 font-medium text-xs rounded-xl transition border border-slate-800 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      title="Eliminar mensaje"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para ver la imagen en tamaño grande */}
      {imagenModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setImagenModal(null)}
        >
          <div 
            className="relative max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setImagenModal(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black text-white rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={imagenModal}
              alt="Imagen adjunta ampliada"
              className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto block"
            />
          </div>
        </div>
      )}
    </div>
  );
}