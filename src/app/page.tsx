// src/app/page.tsx
import Link from "next/link";
import { Tv, QrCode, BookOpen, ShieldCheck, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* HEADER / NAVEGACIÓN */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <span className="text-amber-400 font-bold text-lg">M</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-100">
              MemoriaDigital<span className="text-amber-400">.app</span>
            </span>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:border-slate-600"
          >
            Acceso Clientes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="pt-36 pb-20 px-6 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
            Plataforma SaaS B2B2C para Sector Funerario
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Condolencias y Muro Digital en Tiempo Real
          </h1>
          
          <p className="text-lg text-slate-400 leading-relaxed">
            Dota a tus salas velatorias de una experiencia moderna y respetuosa. 
            Permite a los asistentes compartir mensajes y recuerdos desde su móvil directo a la pantalla y entrega un álbum digital PDF a la familia.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg shadow-lg shadow-amber-500/10 transition-all text-center"
            >
              Iniciar Sesión Funerarias
            </Link>
          </div>
        </div>

        {/* CARACTERÍSTICAS CLAVE */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-xl space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Escaneo QR Sin Fricción</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Los asistentes escanean el código en la sala y envían su condolencia y foto al instante, sin necesidad de registrarse o instalar aplicaciones.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-xl space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Muro Digital en Vivo</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Proyección fluida y respetuosa en pantallas velatorias. Las fotos y mensajes recibidos se muestran en tiempo real con transiciones elegantes.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-xl space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white">Álbum de Recuerdos PDF</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Consolidación automática de todas las condolencias recopiladas en un documento PDF imprimible de alta calidad para entregar a la familia.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-8 px-6 bg-slate-950 text-slate-500 text-sm text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} MemoriaDigital. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Infraestructura Segura Multi-tenant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}