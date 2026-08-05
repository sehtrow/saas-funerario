import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, ShieldAlert, Power } from "lucide-react";
import { actualizarFuneraria } from "@/app/actions/superadmin";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarFunerariaPage({ params }: PageProps) {
  const { id } = await params;

  // Buscar la funeraria en la base de datos
  const funeraria = await prisma.funeraria.findUnique({
    where: { id },
  });

  if (!funeraria) {
    notFound();
  }

  // Vincular el ID con la Server Action usando bind o una función envolvente
  const actualizarConId = actualizarFuneraria.bind(null, funeraria.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header y Retorno */}
        <div className="space-y-4">
          <Link
            href="/superadmin/funerarias"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la lista de funerarias
          </Link>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Superadministrador
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif mt-1">
              Editar Funeraria: {funeraria.nombre}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Modifica los parámetros de configuración y el estado de acceso de este tenant.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
          <form action={actualizarConId} className="space-y-6">
            
            {/* Nombre de la Funeraria */}
            <div className="space-y-2">
              <label 
                htmlFor="nombre" 
                className="block text-sm font-medium text-slate-300"
              >
                Nombre de la Funeraria <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building2 className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  defaultValue={funeraria.nombre}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all text-sm"
                />
              </div>
            </div>

            {/* Slug / Identificador URL */}
            <div className="space-y-2">
              <label 
                htmlFor="slug" 
                className="block text-sm font-medium text-slate-300"
              >
                Identificador URL (Slug) <span className="text-amber-500">*</span>
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 focus-within:border-amber-500/80 focus-within:ring-1 focus-within:ring-amber-500/80 transition-all">
                <span className="flex items-center pl-4 pr-1 text-xs text-slate-500 font-mono bg-slate-900/80 border-r border-slate-800">
                  /admin/
                </span>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  defaultValue={funeraria.slug}
                  className="w-full bg-transparent px-3 py-3 text-white placeholder-slate-600 focus:outline-none text-sm font-mono"
                />
              </div>
              <p className="text-xs text-slate-500">
                Cambiar esto alterará la ruta de acceso al panel de administración de esta funeraria.
              </p>
            </div>

            {/* Configuración de Estado y Moderación */}
            <div className="space-y-4 pt-2">
              
              {/* Estado Activo / Suspendido */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg mt-0.5">
                  <Power className="w-5 h-5" />
                </div>
                <div className="flex-1 flex items-center justify-between gap-4">
                  <div>
                    <label htmlFor="activo" className="font-medium text-white text-sm cursor-pointer">
                      Funeraria Activa
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Si se desmarca, el tenant quedará suspendido y se impedirá el acceso a su panel y servicios.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="activo"
                    name="activo"
                    defaultChecked={funeraria.activo}
                    className="w-5 h-5 accent-amber-600 rounded bg-slate-950 border-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              {/* Moderación por defecto */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1 flex items-center justify-between gap-4">
                  <div>
                    <label htmlFor="requiereModeracion" className="font-medium text-white text-sm cursor-pointer">
                      Requerir moderación de condolencias
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Los mensajes nuevos requerirán aprobación manual antes de mostrarse públicamente.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="requiereModeracion"
                    name="requiereModeracion"
                    defaultChecked={funeraria.requiereModeracion}
                    className="w-5 h-5 accent-amber-600 rounded bg-slate-950 border-slate-800 cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
              <Link
                href="/superadmin/funerarias"
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium transition-all shadow-lg shadow-amber-600/20 text-sm"
              >
                Guardar Cambios
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}