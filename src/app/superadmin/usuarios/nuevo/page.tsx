import { prisma } from "@/lib/db/prisma";
import { crearUsuarioAction } from "./actions";
import Link from "next/link";
import { ArrowLeft, UserPlus, Shield, Building2, Mail, Lock, User } from "lucide-react";

export default async function NuevoUsuarioPage() {
  // Obtener la lista de funerarias para asociarlas al usuario si es necesario
  const funerarias = await prisma.funeraria.findMany({
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-3xl mx-auto">
      
      {/* Header y Botón de Retorno */}
      <div className="space-y-4">
        <Link
          href="/superadmin/usuarios"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la gestión de usuarios
        </Link>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Superadministrador
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif flex items-center gap-3 mt-1">
            <UserPlus className="w-8 h-8 text-amber-500" />
            Crear Nuevo Acceso de Usuario
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registra una nueva cuenta de usuario y asígnale un rol o una funeraria específica.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form action={crearUsuarioAction} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
        
        {/* Nombre */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" /> Nombre Completo
          </label>
          <input
            type="text"
            name="nombre"
            required
            placeholder="Ej: Pablo Martinez"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-500" /> Correo Electrónico (Login)
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="usuario@funeraria.cl"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Contraseña */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" /> Contraseña Temporal
          </label>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Rol */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" /> Rol del Sistema
          </label>
          <select
            name="rol"
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="FUNERARIA">Usuario de Funeraria</option>
            <option value="SUPERADMIN">Superadministrador (Acceso Global)</option>
          </select>
        </div>

        {/* Funeraria Asociada */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" /> Funeraria Asignada (Opcional si es Superadmin)
          </label>
          <select
            name="funerariaId"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="none">-- Sin funeraria (Acceso independiente) --</option>
            {funerarias.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre} (/{f.slug})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Si seleccionas un rol de Funeraria, asegúrate de vincularlo con su respectiva institución para que el sistema filtre sus datos correctamente.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800/80">
          <Link
            href="/superadmin/usuarios"
            className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-all shadow-lg shadow-amber-600/20"
          >
            Registrar Usuario
          </button>
        </div>

      </form>

    </div>
  );
}