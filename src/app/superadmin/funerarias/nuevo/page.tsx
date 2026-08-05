"use client";
import Link from "next/link";
import { ArrowLeft, Building2, ShieldAlert } from "lucide-react";
import { crearFuneraria } from "@/app/actions/superadmin"; // Ajusta la ruta si tus acciones están en otra carpeta

export default function NuevaFunerariaPage() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 p-4 md:p-8">
      {/* Botón de Retorno y Header */}
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
            Registrar Nueva Funeraria
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Crea un nuevo tenant en el sistema para habilitar su administración independiente y códigos QR.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
        {/* CORRECCIÓN: Pasamos directamente la Server Action sin envolverla en una función inline */}
        <form 
          action={async (formData) => {
            void crearFuneraria(formData);
          }} 
          className="space-y-6"
        >
          
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
                placeholder="Ej. Funeraria Paz Eterna"
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
                placeholder="paz-eterna"
                className="w-full bg-transparent px-3 py-3 text-white placeholder-slate-600 focus:outline-none text-sm font-mono"
              />
            </div>
            <p className="text-xs text-slate-500">
              Este texto se usará en la URL pública y del panel (ej. <code className="text-amber-400">/admin/paz-eterna</code>). Solo minúsculas y guiones.
            </p>
          </div>

          {/* Configuración de Moderación por Defecto */}
          <div className="pt-2">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1 flex items-center justify-between gap-4">
                <div>
                  <label htmlFor="requiereModeracion" className="font-medium text-white text-sm cursor-pointer">
                    Requerir moderación de condolencias por defecto
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Si está activado, los mensajes nuevos requerirán aprobación manual antes de mostrarse públicamente.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="requiereModeracion"
                  name="requiereModeracion"
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
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium transition-all shadow-lg shadow-amber-600/20 text-sm cursor-pointer"
            >
              Guardar Funeraria
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}