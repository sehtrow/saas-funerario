// src/app/superadmin/mantenimiento/page.tsx
import BotonDepuracion from '@/components/admin/BotonDepuracion';

export default function SuperAdminMantenimientoPage() {
  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Mantenimiento de Infraestructura</h1>
        <p className="text-xs text-slate-400 mt-1">
          Operaciones globales de la base de datos (Exclusivo SuperAdmin)
        </p>
      </div>

      <div className="border-t border-slate-800 pt-6">
        <BotonDepuracion />
      </div>
    </div>
  );
}