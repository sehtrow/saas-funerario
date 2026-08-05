import { prisma } from "@/lib/db/prisma";
import { Users,UserPlus, Shield, Building2, UserCheck, Mail, Calendar } from "lucide-react";
import Link from "next/link";

export default async function SuperAdminUsuariosPage() {
  // 1. Obtener todos los usuarios de la base de datos junto con su funeraria asignada (si aplica)
  const usuarios = await prisma.usuario.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      funeraria: true, // Asumiendo que tu relación en el modelo se llama 'funeraria'
    },
  });

  const totalUsuarios = usuarios.length;
  const superAdmins = usuarios.filter(u => u.rol === "SUPERADMIN").length;
  const usuariosFunerarias = usuarios.filter(u => u.rol !== "SUPERADMIN").length;

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* Header de la sección */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Superadministrador
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-500" />
            Gestión de Usuarios del Sistema
            </h1>
            <p className="text-sm text-slate-400 mt-1">
            Administra las cuentas de acceso, roles y asignaciones de funerarias para cada usuario registrado.
            </p>
        </div>

        <Link
            href="/superadmin/usuarios/nuevo"
            className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-600/20 text-sm"
        >
            <UserPlus className="w-5 h-5" />
            Crear Nuevo Usuario
        </Link>
        </header>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total de Usuarios</p>
            <p className="text-2xl font-bold text-white">{totalUsuarios}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Superadministradores</p>
            <p className="text-2xl font-bold text-white">{superAdmins}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Usuarios de Funerarias</p>
            <p className="text-2xl font-bold text-white">{usuariosFunerarias}</p>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-serif">
            Listado de Cuentas Registradas
          </h2>
          <span className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full">
            {totalUsuarios} registros
          </span>
        </div>

        {usuarios.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-medium">No hay usuarios registrados en el sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/80">
                  <th className="py-4 px-6">Usuario / Email</th>
                  <th className="py-4 px-6">Rol</th>
                  <th className="py-4 px-6">Funeraria Asignada</th>
                  <th className="py-4 px-6">Fecha de Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white">{u.nombre || "Sin nombre"}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" /> {u.email}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {u.rol === "SUPERADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Shield className="w-3.5 h-3.5" /> Superadmin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <UserCheck className="w-3.5 h-3.5" /> Funeraria
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {u.funeraria ? (
                        <div>
                          <p className="text-white font-medium">{u.funeraria.nombre}</p>
                          <p className="text-xs text-slate-500 font-mono">/{u.funeraria.slug}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Acceso Global / Sin asignar</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(u.creadoEn).toLocaleDateString("es-CL")}
                      </span>
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