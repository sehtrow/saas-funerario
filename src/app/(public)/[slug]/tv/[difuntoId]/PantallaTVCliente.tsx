'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { obtenerMilisegundosRotacion } from '@/lib/utils-rotacion';
import { TiempoRotacion } from '@prisma/client';
import { createClient } from '@/lib/supabase/client';

interface Condolencia {
  id: string;
  difuntoId?: string;
  nombreAutor: string;
  parentesco: string | null;
  mensaje: string;
  fotoUrl: string | null;
  creadoEn: Date;
  estado?: string;
}

interface ConfigPantalla {
  tiempoRotacion: TiempoRotacion;
  mostrarFotos: boolean;
  mensajeBienvenida: string | null;
}

interface Funeraria {
  nombre: string;
  logoUrl: string | null;
  colorPrimario: string;
}

interface DifuntoConDetalles {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date | null;
  fechaFallecimiento: Date;
  fotoPerfilUrl: string | null;
  biografia: string | null;
  funeraria: Funeraria;
  configPantalla: ConfigPantalla | null;
  condolencias: Condolencia[];
}

export default function PantallaTvClient({
  difuntoInicial,
  urlPublicaCondolencias,
}: {
  difuntoInicial: DifuntoConDetalles;
  urlPublicaCondolencias: string;
}) {
  console.log("👉 PantallaTvClient se renderizó para el difunto:", difuntoInicial.id);

  const [indiceActual, setIndiceActual] = useState(0);
  
  // 1. Estado local reactivo para las condolencias (Escalable y sin refrescos de servidor)
  const [condolencias, setCondolencias] = useState<Condolencia[]>(
    difuntoInicial.condolencias || []
  );

  const config = difuntoInicial.configPantalla;
  const msRotacion = obtenerMilisegundosRotacion(config?.tiempoRotacion);

  // 2. Efecto para la rotación automática del carrusel
  useEffect(() => {
    if (condolencias.length <= 1) return;

    const interval = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % condolencias.length);
    }, msRotacion);

    return () => clearInterval(interval);
  }, [condolencias.length, msRotacion]);

  // Si el índice actual se pasa del límite al eliminarse elementos, lo reajustamos de forma segura
  useEffect(() => {
    if (indiceActual >= condolencias.length && condolencias.length > 0) {
      setIndiceActual(0);
    }
  }, [condolencias.length, indiceActual]);

  // 3. Efecto para escuchar WebSockets en tiempo real con Supabase (Blindado y directo)
  useEffect(() => {
    const supabase = createClient();
    console.log("🔌 Inicializando canal de Supabase en tiempo real para el difunto:", difuntoInicial.id);

    const channel = supabase
      .channel(`realtime-condolencias-${difuntoInicial.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'condolencias',
        },
        (payload) => {
          console.log('🎉 Evento recibido de Supabase en tiempo real:', payload);

          const nuevo = payload.new as Condolencia & { difuntoId?: string };
          const viejo = payload.old as Condolencia & { difuntoId?: string };

          // 1. Verificamos si el registro nuevo o viejo pertenece a este difunto
          const esDeEsteDifunto = 
            nuevo?.difuntoId === difuntoInicial.id || 
            viejo?.difuntoId === difuntoInicial.id;

          // 2. Si el payload no traía el difuntoId explícito (común en algunos UPDATE de Supabase),
          // verificamos si el ID de la condolencia afectada ya existe en nuestra pantalla actual.
          const estaEnPantallaActual = condolencias.some(
            (item) => item.id === nuevo?.id || item.id === viejo?.id
          );

          if (!esDeEsteDifunto && !estaEnPantallaActual && payload.eventType !== 'INSERT') {
            return; // Si no es de este difunto ni está en pantalla, lo ignoramos
          }

          // Actualizamos el estado local según la acción ejecutada
          if (payload.eventType === 'INSERT') {
            if (nuevo?.difuntoId === difuntoInicial.id && (nuevo.estado === 'APROBADO' || !nuevo.estado)) {
              setCondolencias((prev) => [...prev, nuevo]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setCondolencias((prev) => {
              // Si fue rechazado u ocultado, lo removemos de la pantalla de la TV
              if (nuevo.estado && nuevo.estado !== 'APROBADO') {
                return prev.filter((item) => item.id !== nuevo.id);
              }

              const existe = prev.some((item) => item.id === nuevo.id);
              if (existe) {
                return prev.map((item) => (item.id === nuevo.id ? nuevo : item));
              } else if (nuevo.difuntoId === difuntoInicial.id && nuevo.estado === 'APROBADO') {
                return [...prev, nuevo];
              }
              return prev;
            });
          } else if (payload.eventType === 'DELETE') {
            setCondolencias((prev) => prev.filter((item) => item.id !== viejo?.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado de la conexión Realtime:', status);
      });

    return () => {
      console.log("🧹 Desmontando PantallaTvClient - Cerrando canal...");
      supabase.removeChannel(channel);
    };
  }, [difuntoInicial.id, condolencias]);

  const condolenciaActual = condolencias[indiceActual];
  const mostrarFotoMensaje = config?.mostrarFotos ?? true;
  const tieneFoto = Boolean(mostrarFotoMensaje && condolenciaActual?.fotoUrl);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Columna Izquierda: Información del Difunto y QR */}
      <div className="flex w-1/3 flex-col justify-between border-r border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {difuntoInicial.funeraria.logoUrl ? (
            <img
              src={difuntoInicial.funeraria.logoUrl}
              alt={difuntoInicial.funeraria.nombre}
              className="h-12 w-auto object-contain"
            />
          ) : (
            <div className="text-xl font-semibold tracking-wide text-slate-300">
              {difuntoInicial.funeraria.nombre}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center text-center">
          {difuntoInicial.fotoPerfilUrl ? (
            <img
              src={difuntoInicial.fotoPerfilUrl}
              alt={`${difuntoInicial.nombre} ${difuntoInicial.apellido}`}
              className="mb-6 h-48 w-48 rounded-full border-4 border-slate-700/50 object-cover shadow-2xl"
            />
          ) : (
            <div className="mb-6 flex h-48 w-48 items-center justify-center rounded-full border-4 border-slate-700/50 bg-slate-800 text-5xl font-light text-slate-400">
              {difuntoInicial.nombre[0]}
              {difuntoInicial.apellido[0]}
            </div>
          )}

          <h1 className="text-3xl font-serif font-bold tracking-tight text-amber-100/90">
            {difuntoInicial.nombre} {difuntoInicial.apellido}
          </h1>

          <p className="mt-2 text-sm tracking-widest text-slate-400 uppercase">
            {difuntoInicial.fechaNacimiento
              ? new Date(difuntoInicial.fechaNacimiento).getFullYear()
              : ''}{' '}
            — {new Date(difuntoInicial.fechaFallecimiento).getFullYear()}
          </p>

          {config?.mensajeBienvenida && (
            <p className="mt-6 text-xs italic text-slate-400 max-w-xs leading-relaxed">
              "{config.mensajeBienvenida}"
            </p>
          )}
        </div>

        <div className="flex flex-col items-center rounded-2xl bg-slate-800/50 p-6 border border-slate-700/40 text-center">
          <div className="rounded-xl bg-white p-3 shadow-lg">
            <QRCodeSVG value={urlPublicaCondolencias} size={140} level="M" />
          </div>
          <p className="mt-4 text-xs font-medium text-amber-200/90">
            Escanea el código QR con tu celular
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Para enviar tus palabras de condolencia a la familia
          </p>
        </div>
      </div>

      {/* Columna Derecha: Carrusel de Condolencias */}
      <div className="relative flex w-2/3 flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {condolencias.length > 0 ? (
          <div className="my-auto flex flex-col justify-center transition-all duration-700 ease-in-out w-full">
            <span className="text-6xl text-amber-500/20 font-serif leading-none select-none">
              “
            </span>

            <div className={`flex flex-col ${tieneFoto ? 'lg:flex-row lg:items-center lg:gap-8' : ''} px-6`}>
              <div className={`flex-1 ${tieneFoto ? 'lg:max-w-[60%]' : 'w-full'}`}>
                <p className="text-xl lg:text-3xl font-light italic leading-relaxed text-slate-200">
                  {condolenciaActual?.mensaje}
                </p>
              </div>

              {tieneFoto && condolenciaActual?.fotoUrl && (
                <div className="mt-6 lg:mt-0 flex-shrink-0 flex justify-center">
                  <div className="relative p-2 bg-slate-900/80 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-sm max-w-[280px] max-h-[320px]">
                    <img
                      src={condolenciaActual.fotoUrl}
                      alt="Adjunto de condolencia"
                      className="rounded-xl object-contain max-h-[280px] w-auto mx-auto shadow-inner"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-800/80 pt-6 px-6">
              <div>
                <h3 className="text-lg font-semibold text-amber-100/90">
                  {condolenciaActual?.nombreAutor}
                </h3>
                {condolenciaActual?.parentesco && (
                  <p className="text-sm text-slate-400">
                    {condolenciaActual.parentesco}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="my-auto text-center">
            <p className="text-xl font-light text-slate-400">
              Aún no hay mensajes compartidos.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Sé el primero en enviar tu saludo escaneando el código QR.
            </p>
          </div>
        )}

        {condolencias.length > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            {condolencias.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === indiceActual
                    ? 'w-8 bg-amber-400/80'
                    : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}