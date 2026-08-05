"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, Building2, CreditCard, FileText, Receipt, Package } from "lucide-react";
import { registrarPagoFuneraria } from "@/app/actions/superadmin";

const PRECIOS_PLANES = {
  BASIC: "29990",
  ESTANDAR: "69990",
  ENTERPRISE: "129990",
};

interface Funeraria {
  id: string;
  nombre: string;
  slug: string;
}

export default function RegistrarPagoForm({ funerarias = [] }: { funerarias: Funeraria[] }) {
  const [planSeleccionado, setPlanSeleccionado] = useState<string>("ESTANDAR");
  const [monto, setMonto] = useState<string>(PRECIOS_PLANES.ESTANDAR);

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoPlan = e.target.value;
    setPlanSeleccionado(nuevoPlan);
    if (PRECIOS_PLANES[nuevoPlan as keyof typeof PRECIOS_PLANES]) {
      setMonto(PRECIOS_PLANES[nuevoPlan as keyof typeof PRECIOS_PLANES]);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header y Retorno */}
      <div className="space-y-4">
        <Link
          href="/superadmin/pagos"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al control de pagos
        </Link>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
            Superadministrador
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif mt-1">
            Registrar Pago Manual
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ingresa una nueva transacción o abono por suscripción para activar o mantener al día un tenant.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
        <form action={registrarPagoFuneraria} className="space-y-6">
          
          {/* Seleccionar Funeraria */}
          <div className="space-y-2">
            <label 
              htmlFor="funerariaId" 
              className="block text-sm font-medium text-slate-300"
            >
              Seleccionar Funeraria <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Building2 className="w-5 h-5" />
              </div>
              <select
                id="funerariaId"
                name="funerariaId"
                required
                defaultValue=""
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  -- Elige una funeraria --
                </option>
                {Array.isArray(funerarias) && funerarias.map((f) => (
                  <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                    {f.nombre} (/{f.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de Plan y Monto (Grid de 2 columnas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tipo de Plan */}
            <div className="space-y-2">
              <label 
                htmlFor="plan" 
                className="block text-sm font-medium text-slate-300"
              >
                Tipo de Plan Asociado <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Package className="w-5 h-5" />
                </div>
                <select
                  id="plan"
                  name="plan"
                  value={planSeleccionado}
                  onChange={handlePlanChange}
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="BASIC">Plan Básico ($29.990)</option>
                  <option value="ESTANDAR">Plan Profesional ($69.990)</option>
                  <option value="ENTERPRISE">Plan Enterprise ($129.990)</option>
                </select>
              </div>
            </div>

            {/* Monto (Editable) */}
            <div className="space-y-2">
              <label 
                htmlFor="monto" 
                className="block text-sm font-medium text-slate-300"
              >
                Monto (CLP) <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <DollarSign className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  id="monto"
                  name="monto"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                  placeholder="Ej: 69990"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all text-sm"
                />
              </div>
            </div>

          </div>

          {/* Método de Pago */}
          <div className="space-y-2">
            <label 
              htmlFor="metodo" 
              className="block text-sm font-medium text-slate-300"
            >
              Método de Pago <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <CreditCard className="w-5 h-5" />
              </div>
              <select
                id="metodo"
                name="metodo"
                required
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                <option value="Tarjeta de Crédito/Débito">Tarjeta de Crédito / Débito</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Referencia o Nro de Comprobante */}
          <div className="space-y-2">
            <label 
              htmlFor="referencia" 
              className="block text-sm font-medium text-slate-300"
            >
              Nro. de Referencia / Comprobante
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Receipt className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="referencia"
                name="referencia"
                placeholder="Ej: TRF-98765432"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all text-sm"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <label 
              htmlFor="observacion" 
              className="block text-sm font-medium text-slate-300"
            >
              Observaciones o Notas
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-slate-500">
                <FileText className="w-5 h-5" />
              </div>
              <textarea
                id="observacion"
                name="observacion"
                rows={3}
                placeholder="Detalles adicionales sobre la suscripción..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all text-sm resize-none"
              ></textarea>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <Link
              href="/superadmin/pagos"
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium transition-all shadow-lg shadow-amber-600/20 text-sm"
            >
              Guardar y Registrar Pago
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}