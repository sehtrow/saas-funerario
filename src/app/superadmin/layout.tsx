import { ShieldCheck, LogOut } from "lucide-react";
import SidebarNavLink from "./_components/SidebarNavLink";
import { logoutAction } from "@/app/actions/logout-action";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { name: "Gestión Funerarias", href: "/superadmin/funerarias", icon: "Building2" as const },
    { name: "Control de Pagos", href: "/superadmin/pagos", icon: "CreditCard" as const },
    { name: "Métricas Globales", href: "/superadmin/metricas", icon: "BarChart3" as const },
    { name: "Usuarios Superadmin", href: "/superadmin/usuarios", icon: "Users" as const },
  ];

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans overflow-hidden relative">
      
      {/* Sidebar Lateral Izquierdo */}
      <aside className="w-full md:w-64 h-full shrink-0 bg-slate-900/60 border-r border-slate-800/80 p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-8">
          
          {/* Logo / Título del Panel */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-white text-base">Superadmin</h2>
              <p className="text-xs text-slate-400">Panel de Control SaaS</p>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <SidebarNavLink
                key={item.href}
                name={item.name}
                href={item.href}
                icon={item.icon}
              />
            ))}
          </nav>

        </div>

        {/* Footer del Sidebar con el Botón de Logout */}
        <div className="pt-6 border-t border-slate-800/80 space-y-4">
          <form 
            action={async () => {
              "use server";
              await logoutAction();
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </form>

          <div className="text-[11px] text-slate-500 text-center">
            SaaS Funerario v1.0
          </div>
        </div>
      </aside>

      {/* Contenido Principal con Scroll Independiente */}
      <main className="flex-1 h-full overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}