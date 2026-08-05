import { DollarSign, TrendingUp, Building, Wallet } from "lucide-react";

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
  metricas: MetricasGlobales;
}

export default function GlobalMetricsGrid({ metricas }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white font-serif">Métricas Globales del Negocio</h2>
          <p className="text-xs text-slate-400">Resumen financiero consolidado de todas las funerarias registradas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Ingresos Totales (Histórico) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Ingresos Totales</p>
            <p className="text-2xl font-bold text-white">${metricas.ingresoTotalGlobal.toLocaleString('es-CL')}</p>
            <p className="text-[11px] text-emerald-400 mt-0.5">{metricas.totalTransacciones} cobros en total</p>
          </div>
        </div>

        {/* Ingresos del Mes Actual */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Ingresos este Mes</p>
            <p className="text-2xl font-bold text-white">${metricas.ingresosMesActual.toLocaleString('es-CL')}</p>
            <p className="text-[11px] text-amber-400 mt-0.5">Mes en curso (Agosto)</p>
          </div>
        </div>

        {/* Funerarias Al Día vs Mora */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Estado de Clientes</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold text-white">{metricas.funerariasAlDia} <span className="text-xs text-emerald-400 font-normal">Al día</span></span>
              <span className="text-slate-600">/</span>
              <span className="text-xl font-bold text-white">{metricas.funerariasEnMora} <span className="text-xs text-rose-400 font-normal">Mora</span></span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">De {metricas.totalFunerarias} funerarias totales</p>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Ticket Promedio</p>
            <p className="text-2xl font-bold text-white">${metricas.ticketPromedio.toLocaleString('es-CL')}</p>
            <p className="text-[11px] text-purple-400 mt-0.5">Por transacción realizada</p>
          </div>
        </div>

      </div>
    </div>
  );
}