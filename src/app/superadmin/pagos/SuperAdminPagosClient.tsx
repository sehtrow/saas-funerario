"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, AlertCircle, CheckCircle2, Plus, History } from "lucide-react";
import HistorialPagosModal from "./components/HistorialPagosModal";
import GlobalMetricsGrid from "./components/GlobalMetricsGrid";

interface Pago {
  id: string;
  monto: number;
  metodo: string;
  referencia?: string | null;
  observacion?: string | null;
  creadoEn: Date | string;
  plan?: string | null;
}

interface Funeraria {
  id: string;
  nombre: string;
  slug: string;
  activo: boolean;
  creadoEn: Date | string;
  pagos: Pago[];
}

interface MetricasGlobales {
  ingresoTotalGlobal: number;
  funerariasAlDia: number;
  funerariasEnMora: number;
  totalFunerarias: number;
  totalTransacciones: number;
  ticketPromedio: number;
  ingresosMesActual: number;
  mrrEstimado: number;
}

interface Props {
  funerarias: Funeraria[];
  metricas: MetricasGlobales;
}

export default function SuperAdminPagosClient({ funerarias, metricas }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [funerariaSeleccionada, setFunerariaSeleccionada] = useState<Funeraria | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const abrirHistorial = (funeraria: Funeraria) => {
    setFunerariaSeleccionada(funeraria);
    setModalAbierto(true);
  };

  return (
    <div className="space-y-8">
      
      {/* Header de la sección */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Superadministrador
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif">
            Control de Pagos y Suscripciones
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Supervisa el estado de facturación, ingresos históricos y cobros mensuales de cada funeraria.
          </p>
        </div>

        <Link
          href="/superadmin/pagos/nuevo"
          className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-600/20 text-sm"
        >
          <Plus className="w-5 h-5" />
          Registrar Pago Manual
        </Link>
      </header>

      {/* Componente Modular de Métricas Globales */}
      <GlobalMetricsGrid metricas={metricas} />

      {/* Tabla detallada con los pagos reales */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-serif">
            Historial y Estado de Cuentas por Funeraria
          </h2>
          <span className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full">
            {funerarias.length} funerarias en total
          </span>
        </div>

        {funerarias.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-white font-medium">No hay registros de funerarias.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/80">
                  <th className="py-4 px-6">Funeraria</th>
                  <th className="py-4 px-6">Último Pago / Método</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6">Total Pagado</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {funerarias.map((f) => {
                  const ultimoPago = f.pagos[0];
                  const totalFuneraria = f.pagos.reduce((acc, p) => acc + p.monto, 0);

                  return (
                    <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-white">{f.nombre}</p>
                          <p className="text-xs text-slate-500 font-mono">/{f.slug}</p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {ultimoPago ? (
                          <div>
                            <p className="text-white font-medium">
                              ${ultimoPago.monto.toLocaleString('es-CL')} 
                              <span className="text-xs text-slate-400 font-normal ml-1.5">({ultimoPago.metodo})</span>
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {mounted ? (
                                <>
                                  {new Date(ultimoPago.creadoEn).toLocaleDateString()} {ultimoPago.referencia ? `• Ref: ${ultimoPago.referencia}` : ''}
                                </>
                              ) : (
                                "Cargando fecha..."
                              )}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Sin pagos registrados</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {f.activo ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Al Día
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Pago Pendiente
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-slate-200 font-mono font-medium">
                        ${totalFuneraria.toLocaleString('es-CL')}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirHistorial(f)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl text-xs font-medium transition-colors border border-amber-500/20"
                            title="Ver Historial Completo"
                          >
                            <History className="w-3.5 h-3.5" />
                            Historial
                          </button>
                          
                          <Link
                            href="/superadmin/pagos/nuevo"
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium transition-colors border border-slate-700/50"
                          >
                            Registrar Pago
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Historial */}
      <HistorialPagosModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        funeraria={funerariaSeleccionada}
      />

    </div>
  );
}