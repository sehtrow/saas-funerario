// src/app/page.tsx
import Link from "next/link";
import { Tv, QrCode, BookOpen, ShieldCheck, ArrowRight, Check, Zap, Shield, Crown } from "lucide-react";

export default function LandingPage() {
  const planes = [
    {
      nombre: "Básico",
      precio: "$29.990",
      periodo: "mes",
      descripcion: "Ideal para funerarias independientes que buscan digitalizar su gestión básica.",
      limite: "Hasta 20 servicios / mes",
      icon: Zap,
      destacado: false,
      features: [
        "Registro de difuntos y esquelas",
        "Gestión de salas velatorias",
        "1 Usuario Administrador",
        "Soporte por correo electrónico",
      ],
    },
    {
      nombre: "Profesional",
      precio: "$69.990",
      periodo: "mes",
      descripcion: "La opción preferida por funerarias consolidadas con alto flujo operativo.",
      limite: "Hasta 60 servicios / mes",
      icon: Shield,
      destacado: true,
      features: [
        "Todo lo del plan Básico",
        "Control de pagos y caja diaria",
        "Plantillas avanzadas y esquelas pro",
        "Hasta 5 operadores activos",
        "Soporte prioritario",
      ],
    },
    {
      nombre: "Enterprise",
      precio: "$129.990",
      periodo: "mes",
      descripcion: "Diseñado para cadenas de funerarias o empresas con múltiples sucursales.",
      limite: "Servicios ilimitados",
      icon: Crown,
      destacado: false,
      features: [
        "Todo lo del plan Profesional",
        "Multi-sucursal centralizada",
        "Usuarios y operadores ilimitados",
        "Reportes gerenciales globales",
        "Gestor de cuenta dedicado",
      ],
    },
  ];

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
      <main className="pt-36 pb-20 px-6 max-w-7xl mx-auto flex-1 flex flex-col justify-center w-full">
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

        {/* SECCIÓN DE PLANES Y PRECIOS */}
        <div className="mt-32 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Planes y Precios Transparentes
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-serif text-white tracking-tight">
              Elige el plan ideal para potenciar tu funeraria
            </h2>
            <p className="text-slate-400 text-base">
              Soluciones tecnológicas escalables diseñadas para optimizar la administración y el servicio a las familias.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {planes.map((plan, idx) => {
              const Icon = plan.icon;
              return (
                <div 
                  key={idx}
                  className={`relative flex flex-col justify-between rounded-2xl p-8 transition-all duration-300 ${
                    plan.destacado 
                      ? "bg-slate-900/90 border-2 border-amber-500/80 shadow-2xl shadow-amber-600/10 lg:-translate-y-2 z-10" 
                      : "bg-slate-900/40 border border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  {plan.destacado && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-md">
                      Más Popular
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${plan.destacado ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-300"}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                        {plan.limite}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold font-serif text-white">{plan.nombre}</h3>
                      <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.descripcion}</p>
                    </div>

                    <div className="flex items-baseline gap-1 pt-2 border-t border-slate-800/80">
                      <span className="text-3xl font-extrabold font-serif text-white">{plan.precio}</span>
                      <span className="text-sm text-slate-400 font-medium">CLP / {plan.periodo}</span>
                    </div>

                    <ul className="space-y-3.5 pt-2 text-sm text-slate-300">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8 mt-8 border-t border-slate-800/80">
                    <Link
                      href="/login"
                      className={`w-full flex items-center justify-center py-3 rounded-xl font-medium transition-all text-sm ${
                        plan.destacado
                          ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-500/10"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      }`}
                    >
                      Contratar Plan
                    </Link>
                  </div>
                </div>
              );
            })}
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