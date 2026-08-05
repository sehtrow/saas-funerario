import { prisma } from "@/lib/db/prisma";
import GlobalMetricsGrid from "../pagos/components/GlobalMetricsGrid";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export default async function SuperAdminMetricasPage() {
  const funerarias = await prisma.funeraria.findMany({
    include: {
      pagos: {
        orderBy: { creadoEn: "desc" },
      },
    },
  });

  const todosLosPagos = await prisma.pagoFuneraria.findMany({
    orderBy: { creadoEn: "desc" },
  });

  const ingresoTotalGlobal = todosLosPagos.reduce((acc, pago) => acc + pago.monto, 0);
  const totalTransacciones = todosLosPagos.length;
  
  const funerariasAlDia = funerarias.filter(f => f.activo).length;
  const funerariasEnMora = funerarias.filter(f => !f.activo).length;
  const totalFunerarias = funerarias.length;

  const ticketPromedio = totalTransacciones > 0 ? Math.round(ingresoTotalGlobal / totalTransacciones) : 0;

  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const anioActual = fechaActual.getFullYear();

  const ingresosMesActual = todosLosPagos
    .filter(p => {
      const fechaPago = new Date(p.creadoEn);
      return fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === anioActual;
    })
    .reduce((acc, p) => acc + p.monto, 0);

  const funerariasActivas = funerarias.filter(f => f.activo);
  const mrrEstimado = funerariasActivas.length * 14990;

  const metricasGlobales = {
    ingresoTotalGlobal,
    funerariasAlDia,
    funerariasEnMora,
    totalFunerarias,
    totalTransacciones,
    ticketPromedio,
    ingresosMesActual,
    mrrEstimado,
  };

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Superadministrador
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-amber-500" />
            Métricas Globales y Analíticas
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Análisis financiero consolidado, rendimiento de suscripciones y estado general de la plataforma.
          </p>
        </div>
      </header>

      <GlobalMetricsGrid metricas={metricasGlobales} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Proyección de Ingresos (MRR)
          </h3>
          <p className="text-xs text-slate-400">
            Estimación de ingresos recurrentes mensuales basados en las funerarias activas actuales.
          </p>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="text-sm text-slate-300 font-medium">MRR Estimado Actual:</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">${metricasGlobales.mrrEstimado.toLocaleString('es-CL')}</span>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Salud de la Cartera de Clientes
          </h3>
          <p className="text-xs text-slate-400">
            Proporción de clientes al día frente a aquellos con pagos pendientes o en estado de mora.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <p className="text-xs text-emerald-400 font-medium">Al Día</p>
              <p className="text-xl font-bold text-white mt-1">{metricasGlobales.funerariasAlDia}</p>
            </div>
            <div className="flex-1 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
              <p className="text-xs text-rose-400 font-medium">En Mora</p>
              <p className="text-xl font-bold text-white mt-1">{metricasGlobales.funerariasEnMora}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}