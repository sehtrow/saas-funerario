"use client";

import { useState } from "react";
import { cambiarPasswordObligatorioAction } from "@/app/superadmin/usuarios/nuevo/actions";
import { Lock, ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react";

interface ModalCambioPasswordProps {
  userId: string;
  isOpen: boolean;
}

export default function ModalCambioPassword({ userId, isOpen }: ModalCambioPasswordProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await cambiarPasswordObligatorioAction(userId, formData);
      // El revalidatePath refrescará el layout y cerrará el modal automáticamente
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al actualizar la contraseña.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Franja decorativa de seguridad */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-rose-500" />

        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-serif">
              Cambio de Contraseña Requerido
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Por motivos de seguridad, estás ingresando con una credencial temporal. Debes establecer una nueva contraseña personal para continuar.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-500" /> Nueva Contraseña
            </label>
            <input
              type="password"
              name="nuevaPassword"
              required
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              name="confirmarPassword"
              required
              placeholder="Repite la contraseña"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Actualizando..."
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Guardar y Continuar
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}