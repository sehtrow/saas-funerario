"use client";

import { useState, useEffect } from "react";
import { X, Calendar, CreditCard, Receipt, FileText, CheckCircle2, Building2 } from "lucide-react";

interface Pago {
  id: string;
  monto: number;
  metodo: string;
  referencia?: string | null;
  observacion?: string | null;
  createdAt?: string | Date;
  creadoEn?: string | Date;
  plan?: string | null;
}

interface FunerariaHistorial {
  id: string;
  nombre: string;
  slug: string;
  pagos: Pago[];
}

interface HistorialPagosModalProps {
  isOpen: boolean;
  onClose: () => void;
  funeraria: FunerariaHistorial | null;
}

export default function HistorialPagosModal({ isOpen, onClose, funeraria }: HistorialPagosModalProps) {
  // Evita problemas de hidratación asegurando que renderice fechas solo en el cliente
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !funeraria) return null;

  const formatearFecha = (fechaInput?: string | Date) => {
    if (!fechaInput) return "Fecha no disponible";
    const fecha = new Date(fechaInput);
    if (isNaN(fecha.getTime())) return "Fecha inválida";
    
    return fecha.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER DEL MODAL */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white">{funeraria.nombre}</h2>
              <p className="text-xs text-slate-400 font-mono">Slug: /{funeraria.slug}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CUERPO DEL MODAL */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Historial de Transacciones Registradas
            </h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
              Total pagos: {funeraria.pagos?.length || 0}
            </span>
          </div>

          {!funeraria.pagos || funeraria.pagos.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-3">
              <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm">Esta funeraria aún no registra pagos manuales o automáticos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {funeraria.pagos.map((pago) => {
                const fechaRaw = pago.createdAt || pago.creadoEn;

                return (
                  <div 
                    key={pago.id}
                    className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Aprobado
                        </span>
                        {pago.plan && (
                          <span className="text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">
                            Plan: {pago.plan}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {/* Renderiza la fecha solo cuando el cliente ha montado el componente */}
                          {mounted ? formatearFecha(fechaRaw) : "Cargando..."}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                          {pago.metodo}
                        </span>
                      </div>

                      {pago.referencia && (
                        <p className="text-xs text-slate-400 font-mono pt-0.5">
                          <strong className="text-slate-300">Ref:</strong> {pago.referencia}
                        </p>
                      )}

                      {pago.observacion && (
                        <p className="text-xs text-slate-400 italic pt-1 flex items-start gap-1">
                          <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
                          &quot;{pago.observacion}&quot;
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                      <span className="text-xs text-slate-500 block">Monto pagado</span>
                      <span className="text-xl font-bold font-serif text-white">
                        ${Number(pago.monto).toLocaleString("es-CL")} <span className="text-xs font-sans text-slate-400">CLP</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER DEL MODAL */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}