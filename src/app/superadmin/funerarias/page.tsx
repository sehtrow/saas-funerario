import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { 
  Building2, 
  Plus, 
  Users, 
  ShieldAlert, 
  Globe, 
  ArrowUpRight, 
  Pencil, 
  Search, 
  CheckCircle2, 
  XCircle, 
  TrendingUp 
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuperAdminFunerariasPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const busqueda = typeof resolvedParams.q === "string" ? resolvedParams.q.toLowerCase() : "";
  const filtroEstado = typeof resolvedParams.estado === "string" ? resolvedParams.estado : "todos";

  // 1. Obtener todas las funerarias con el conteo de sus difuntos
  const funerariasRaw = await prisma.funeraria.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      _count: {
        select: { difuntos: true },
      },
    },
  });

  // 2. Métricas Avanzadas Globales
  const totalFunerarias = funerariasRaw.length;
  const totalActivas = funerariasRaw.filter(f => f.activo).length;
  const totalSuspendidas = totalFunerarias - totalActivas;
  const totalDifuntosGlobal = funerariasRaw.reduce((acc, f) => acc + f._count.difuntos, 0);
  
  // Funeraria con más actividad
  const funerariaMayorActividad = funerariasRaw.reduce((prev, current) => {
    return (prev?._count.difuntos || 0) > (current._count.difuntos || 0) ? prev : current;
  }, funerariasRaw[0]);

  // 3. Filtrado dinámico (Búsqueda y Estado)
  const funerarias = funerariasRaw.filter((f) => {
    const coincideTexto = f.nombre.toLowerCase().includes(busqueda) || f.slug.toLowerCase().includes(busqueda);
    
    if (filtroEstado === "activas") return coincideTexto && f.activo;
    if (filtroEstado === "suspendidas") return coincideTexto && !f.activo;
    if (filtroEstado === "moderacion") return coincideTexto && f.requiereModeracion;
    
    return coincideTexto;
  });

  return (
    <div className="space-y-8">
        
        {/* Header del Superadmin */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Panel de Superadministrador
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif">
              Gestión de Funerarias
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Monitoreo global de tenants, estados operativos y analíticas de la plataforma.
            </p>
          </div>

          <Link
            href="/superadmin/funerarias/nuevo"
            className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-600/20 text-sm"
          >
            <Plus className="w-5 h-5" />
            Nueva Funeraria
          </Link>
        </header>

        {/* Tarjetas de Métricas Avanzadas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Tenants */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Funerarias</p>
              <p className="text-xl font-bold text-white">{totalFunerarias}</p>
              <p className="text-[11px] text-emerald-400 mt-0.5">{totalActivas} activas / {totalSuspendidas} susp.</p>
            </div>
          </div>

          {/* Total Difuntos */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Difuntos (Global)</p>
              <p className="text-xl font-bold text-white">{totalDifuntosGlobal}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Registros totales</p>
            </div>
          </div>

          {/* Más Activa */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-400 font-medium">Mayor Actividad</p>
              <p className="text-sm font-bold text-white truncate">
                {funerariaMayorActividad ? funerariaMayorActividad.nombre : "N/A"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {funerariaMayorActividad ? `${funerariaMayorActividad._count.difuntos} difuntos` : ""}
              </p>
            </div>
          </div>

          {/* Tasa Operativa */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Salud del Sistema</p>
              <p className="text-xl font-bold text-white">
                {totalFunerarias > 0 ? Math.round((totalActivas / totalFunerarias) * 100) : 100}%
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Tenants operativos</p>
            </div>
          </div>

        </div>

        {/* Sección de Filtros y Búsqueda */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Buscador */}
          <form method="GET" className="w-full md:w-80 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={busqueda}
              placeholder="Buscar por nombre o slug..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/80 text-sm"
            />
            {filtroEstado !== "todos" && <input type="hidden" name="estado" value={filtroEstado} />}
          </form>

          {/* Pestañas de Filtro por Estado */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <Link
              href={`/superadmin/funerarias${busqueda ? `?q=${busqueda}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filtroEstado === "todos"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Todas ({totalFunerarias})
            </Link>
            <Link
              href={`/superadmin/funerarias?estado=activas${busqueda ? `&q=${busqueda}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filtroEstado === "activas"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Activas ({totalActivas})
            </Link>
            <Link
              href={`/superadmin/funerarias?estado=suspendidas${busqueda ? `&q=${busqueda}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filtroEstado === "suspendidas"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Suspendidas ({totalSuspendidas})
            </Link>
            <Link
              href={`/superadmin/funerarias?estado=moderacion${busqueda ? `&q=${busqueda}` : ""}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filtroEstado === "moderacion"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Con Moderación
            </Link>
          </div>

        </div>

        {/* Listado / Tabla de Funerarias */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-serif">
              Listado de Tenants
            </h2>
            <span className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full">
              Mostrando {funerarias.length} de {totalFunerarias} registros
            </span>
          </div>

          {funerarias.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-white font-medium">No se encontraron funerarias con los filtros actuales.</p>
              <p className="text-sm text-slate-400 mt-1">
                Intenta con otro término de búsqueda o cambia el filtro de estado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/80">
                    <th className="py-4 px-6">Funeraria</th>
                    <th className="py-4 px-6">Slug / Ruta</th>
                    <th className="py-4 px-6">Estado</th>
                    <th className="py-4 px-6">Moderación</th>
                    <th className="py-4 px-6 text-center">Difuntos</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {funerarias.map((f) => (
                    <tr
                      key={f.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-amber-500 border border-slate-700/50">
                            {f.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                              {f.nombre}
                            </p>
                            <p className="text-xs text-slate-500">
                              Creada el {new Date(f.creadoEn).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-700/40">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          /{f.slug}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {f.activo ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            Suspendida
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {f.requiereModeracion ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Activada
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            Desactivada
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="font-semibold text-white bg-slate-800/60 px-2.5 py-1 rounded-lg">
                          {f._count.difuntos}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/superadmin/funerarias/${f.id}/edit`}
                            title="Editar Funeraria"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700/50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/${f.slug}`}
                            target="_blank"
                            title="Ver Panel de Funeraria"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700/50"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      
    </div>
  );
}