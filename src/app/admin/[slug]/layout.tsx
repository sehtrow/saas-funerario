import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import Link from "next/link";
import { LayoutDashboard, Users, Settings, Building2 } from "lucide-react";

export default async function AdminFunerariaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const funeraria = await prisma.funeraria.findUnique({
    where: { slug },
    select: { id: true, nombre: true, logoUrl: true, slug: true },
  });

  if (!funeraria) {
    notFound();
  }

  return (
    // CAMBIO CLAVE 1: 'h-screen' y 'overflow-hidden' para congelar el viewport
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* BARRA LATERAL / NAVEGACIÓN */}
      {/* CAMBIO CLAVE 2: 'h-full' y 'shrink-0' para que no empuje ni se deforme */}
      <aside className="w-full md:w-64 h-full shrink-0 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          {/* CABECERA VERTICAL */}
          <div className="flex flex-col items-center text-center px-2 py-4 border-b border-slate-800 space-y-3">
            <div className="w-full h-16 flex items-center justify-center overflow-hidden px-1">
              {funeraria.logoUrl ? (
                <img
                  src={funeraria.logoUrl}
                  alt={funeraria.nombre}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Building2 className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="space-y-0.5 w-full overflow-hidden">
              <h2 className="text-sm font-bold text-white truncate px-1">{funeraria.nombre}</h2>
              <p className="text-[11px] text-slate-400 capitalize">Panel de Control</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              href={`/admin/${slug}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              Inicio
            </Link>
            <Link
              href={`/admin/${slug}/difuntos`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <Users className="w-4 h-4 text-amber-400" />
              Difuntos / Servicios
            </Link>
            <Link
              href={`/admin/${slug}/configuracion`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              Configuración
            </Link>
          </nav>
        </div>

        {/* ÁREA INFERIOR */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <LogoutButton slug={slug} />
          <div className="text-[11px] text-slate-500 text-center">
            MemoriaDigital SaaS v1.0
          </div>
        </div>
      </aside>

      {/* CAMBIO CLAVE 3: 'h-full' e 'inset' de scroll independiente */}
      <main className="flex-1 h-full p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}