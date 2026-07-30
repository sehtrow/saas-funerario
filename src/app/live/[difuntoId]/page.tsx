// src/app/live/[difuntoId]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Quote, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface LiveWallProps {
  params: Promise<{ difuntoId: string }>;
}

interface Condolencia {
  id: string;
  nombreAutor: string;
  parentesco?: string | null;
  mensaje: string;
  creadoEn: string;
}

interface Difunto {
  id: string;
  nombre: string;
  apellido: string;
  fotoPerfilUrl?: string | null;
  funeraria: {
    nombre: string;
  };
}

export default function LiveWallPage({ params }: LiveWallProps) {
  const resolvedParams = use(params);
  const difuntoId = resolvedParams.difuntoId;

  const [difunto, setDifunto] = useState<Difunto | null>(null);
  const [condolencias, setCondolencias] = useState<Condolencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotacionSegundos] = useState(8);

  // URL absoluta para generar el código QR apuntando al formulario del móvil
  const hostUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const qrUrl = `${hostUrl}/q/${difuntoId}`;

  // 1. Cargar datos del difunto y condolencias reales
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/condolencias/${difuntoId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.difunto) setDifunto(data.difunto);
        if (data.condolencias) setCondolencias(data.condolencias);
      }
    } catch (err) {
      console.error("Error al cargar los datos en vivo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Carga inicial y polling periódico cada 10 segundos
  useEffect(() => {
    fetchData();
    const pollInterval = setInterval(fetchData, 10000);
    return () => clearInterval(pollInterval);
  }, [difuntoId]);

  // 3. Rotación automática de tarjetas en pantalla
  useEffect(() => {
    if (condolencias.length === 0) return;

    const rotationInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % condolencias.length);
    }, rotacionSegundos * 1000);

    return () => clearInterval(rotationInterval);
  }, [condolencias, rotacionSegundos]);

  const currentItem = condolencias[currentIndex];

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none font-sans">
      {/* FONDO AMBIENTAL SUAVE */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ENCABEZADO DE LA PANTALLA */}
      <header className="flex justify-between items-center z-10 border-b border-slate-900 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {difunto?.funeraria?.nombre || "Muro de Recuerdos"}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            En Memoria de {difunto ? `${difunto.nombre} ${difunto.apellido}` : "Nuestro Ser Querido"}
          </h1>
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-400">Mensajes transmitidos en tiempo real</p>
          <p className="text-xs font-semibold text-amber-400/90">Sala de Velación</p>
        </div>
      </header>

      {/* ÁREA PRINCIPAL DIVIDIDA EN 2 COLUMNAS */}
      <main className="my-auto py-4 z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-[calc(100vh-180px)]">
        
        {/* COLUMNA IZQUIERDA: FOTO DEL DIFUNTO + CÓDIGO QR SIEMPRE VISIBLE */}
        <div className="md:col-span-4 lg:col-span-4 bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center text-center h-full space-y-4">
          
          {/* FOTO DE PERFIL DEL DIFUNTO (ÚNICA IMAGEN) */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-slate-950 flex-shrink-0">
            {difunto?.fotoPerfilUrl ? (
              <Image
                src={difunto.fotoPerfilUrl}
                alt={`${difunto.nombre} ${difunto.apellido}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-amber-400 font-serif text-3xl font-bold">
                {difunto?.nombre?.[0] || "M"}
              </div>
            )}
          </div>

          {/* CÓDIGO QR GENERADO DINÁMICAMENTE */}
          <div className="bg-white p-3 rounded-2xl shadow-2xl border border-amber-500/20 my-2">
            <QRCodeSVG value={qrUrl} size={140} level="M" />
          </div>

          <div className="space-y-1 max-w-[220px]">
            <p className="text-xs font-semibold text-amber-300">Escanea el código QR</p>
            <p className="text-[11px] text-slate-400 leading-tight">
              Apunta con la cámara de tu teléfono para enviar tus palabras de afecto.
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: CARRUSEL DE CONDOLENCIAS */}
        <div className="md:col-span-8 lg:col-span-8 flex items-center justify-center h-full">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-sm">Cargando condolencias...</p>
            </div>
          ) : condolencias.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 p-12 rounded-3xl text-center space-y-3 max-w-lg">
              <Heart className="w-10 h-10 text-slate-600 mx-auto" />
              <h2 className="text-xl font-semibold text-white">Aún no hay mensajes compartidos</h2>
              <p className="text-sm text-slate-400">
                Sé el primero en escanear el código QR a la izquierda para acompañar a la familia con tus palabras.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {currentItem && (
                <motion.div
                  key={currentItem.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full bg-slate-900/60 border border-slate-800/80 p-8 sm:p-12 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-black/50 flex flex-col justify-between min-h-[360px]"
                >
                  <div className="space-y-6">
                    <Quote className="w-10 h-10 text-amber-500/30" />
                    <p className="text-xl sm:text-2xl md:text-3xl font-light text-slate-100 leading-relaxed italic font-serif">
                      "{currentItem.mensaje}"
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-6">
                    <div>
                      <h3 className="text-lg font-bold text-amber-400">
                        {currentItem.nombreAutor}
                      </h3>
                      {currentItem.parentesco && (
                        <p className="text-xs text-slate-400 font-medium">
                          {currentItem.parentesco}
                        </p>
                      )}
                    </div>

                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(currentItem.creadoEn).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* FOOTER: INDICADORES Y BRANDING */}
      <footer className="z-10 flex justify-between items-center pt-4 border-t border-slate-900">
        <div className="flex items-center gap-2">
          {condolencias.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-500 ${
                idx === currentIndex ? "w-8 bg-amber-400" : "w-2 bg-slate-800"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>Powered by</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500/80" />
          <span className="text-slate-400 font-semibold tracking-wide">
            MemoriaDigital
          </span>
        </div>
      </footer>
    </div>
  );
}