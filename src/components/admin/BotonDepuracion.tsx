// src/components/admin/BotonDepuracion.tsx
'use client';

import { useState } from 'react';
import { purgarCondolenciasRechazadas } from '@/app/actions/limpieza';

export default function BotonDepuracion() {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleDepurar = async () => {
    const confirmado = confirm(
      '¿Estás seguro de que deseas eliminar todas las condolencias rechazadas que tengan más de 1 año de antigüedad?'
    );

    if (!confirmado) return;

    setCargando(true);
    setMensaje(null);

    const res = await purgarCondolenciasRechazadas();

    setCargando(false);

    if (res.success) {
      setMensaje(`Se eliminaron ${res.count} registros rechazados antiguos correctamente.`);
    } else {
      setMensaje(res.error || 'Ocurrió un error.');
    }
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl max-w-md space-y-3">
      <h3 className="text-sm font-semibold text-slate-200">
        Mantenimiento de Base de Datos
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed">
        Elimina de forma permanente las condolencias con estado <strong>RECHAZADO</strong> creadas hace más de 1 año.
      </p>

      <button
        type="button"
        onClick={handleDepurar}
        disabled={cargando}
        className="px-4 py-2 text-xs font-medium bg-red-900/40 hover:bg-red-900/60 border border-red-700/50 text-red-200 rounded-lg transition disabled:opacity-50 cursor-pointer"
      >
        {cargando ? 'Procesando...' : 'Purga mensual: Depurar rechazados antiguos'}
      </button>

      {mensaje && (
        <p className="text-xs text-amber-400 font-medium mt-2">{mensaje}</p>
      )}
    </div>
  );
}