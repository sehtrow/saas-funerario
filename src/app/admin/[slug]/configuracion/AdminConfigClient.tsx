"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Lock, Sliders, Building, MessageSquare, Clock, ShieldCheck, Loader2, ArrowLeft, Image as ImageIcon, Upload, Trash2, CheckCheck } from "lucide-react";
import Link from "next/link";
import { actualizarConfiguracionAction } from "@/app/actions/configuracion";

interface FunerariaConfig {
  nombre: string;
  slug: string;
  tiempoRotacionTv: number;
  mensajeInstitucional: string | null;
  requiereModeracion: boolean;
  logoUrl: string | null; // <--- Añadido
}

interface AdminConfigClientProps {
  slug: string;
  funeraria: FunerariaConfig;
}

export default function AdminConfigClient({ slug, funeraria }: AdminConfigClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const [formData, setFormData] = useState({
    nombre: funeraria.nombre,
    tiempoRotacionTv: funeraria.tiempoRotacionTv,
    mensajeInstitucional: funeraria.mensajeInstitucional || "",
    requiereModeracion: funeraria.requiereModeracion,
    logoUrl: funeraria.logoUrl || "",
  });

  // Manejador para convertir la imagen local a Base64 para previsualización y almacenamiento directo
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMensajeError("La imagen es demasiado pesada. El límite es 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
        setMensajeError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensajeExito("");
    setMensajeError("");

    const res = await actualizarConfiguracionAction({
      slug,
      nombre: formData.nombre,
      tiempoRotacionTv: formData.tiempoRotacionTv,
      mensajeInstitucional: formData.mensajeInstitucional,
      requiereModeracion: formData.requiereModeracion,
      logoUrl: formData.logoUrl,
    });

    setIsSubmitting(false);

    if (res.success) {
      setMensajeExito("Configuración y logotipo actualizados correctamente.");
      setTimeout(() => setMensajeExito(""), 4000);
      router.refresh();
    } else {
      setMensajeError(res.error || "Error al actualizar.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/${slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Panel Principal
        </Link>
      </div>

      {mensajeExito && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-2xl flex items-center gap-2">
          <CheckCheck className="w-4 h-4" />
          {mensajeExito}
        </div>
      )}

      {mensajeError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl">
          {mensajeError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TARJETA 1: INFORMACIÓN GENERAL */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Información General</h2>
              <p className="text-xs text-slate-400">Nombre de la institución y parámetros de identidad.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Nombre de la Funeraria</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-500" /> Slug del Sistema (Identificador URL)
              </label>
              <input
                type="text"
                disabled
                value={slug}
                className="w-full bg-slate-950/40 border border-slate-800/50 rounded-xl px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed select-none"
              />
              <p className="text-[10px] text-slate-500">Este identificador está protegido y no puede ser modificado.</p>
            </div>
          </div>
        </div>

        {/* TARJETA NUEVA: LOGOTIPO INSTITUCIONAL */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Logotipo Institucional</h2>
              <p className="text-xs text-slate-400">Se mostrará en la pantalla en vivo (TV) y en los reportes impresos.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative shrink-0">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Logo preview"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-600" />
              )}
            </div>

            <div className="space-y-3 w-full">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors">
                  <Upload className="w-4 h-4 text-amber-400" />
                  Seleccionar Imagen
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoUrl: "" })}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Quitar logo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Formatos recomendados: PNG o JPG con fondo transparente u oscuro, tamaño máximo de 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* TARJETA 2: PANTALLA LIVE (TV) Y TIEMPOS */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pantalla Live (TV)</h2>
              <p className="text-xs text-slate-400">Configuración de tiempos y transición en salas.</p>
            </div>
          </div>

          <div className="space-y-1.5 max-w-md">
            <label className="text-xs font-medium text-slate-300">Tiempo de rotación de mensajes (Segundos)</label>
            <input
              type="number"
              min="3"
              max="60"
              required
              value={formData.tiempoRotacionTv}
              onChange={(e) => setFormData({ ...formData, tiempoRotacionTv: parseInt(e.target.value) || 5 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-400">Indica cuántos segundos permanece visible cada mensaje en la pantalla de televisión antes de pasar al siguiente.</p>
          </div>
        </div>

        {/* TARJETA 3: REGLAS OPERATIVAS Y MENSAJES */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Reglas Operativas Predeterminadas</h2>
              <p className="text-xs text-slate-400">Comportamiento automático al crear nuevos servicios.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl">
              <input
                type="checkbox"
                id="requiereModeracion"
                checked={formData.requiereModeracion}
                onChange={(e) => setFormData({ ...formData, requiereModeracion: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
              />
              <label htmlFor="requiereModeracion" className="text-xs text-slate-300 cursor-pointer">
                <span className="font-semibold block text-white text-sm">Activar moderación por defecto en nuevos servicios</span>
                Al crear un nuevo difunto, la opción de requerir aprobación previa para las condolencias vendrá marcada por defecto.
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" /> Mensaje Institucional Personalizado (Opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Ej: Acompañamos a la familia en este momento de dolor. Deje su mensaje de condolencia..."
                value={formData.mensajeInstitucional}
                onChange={(e) => setFormData({ ...formData, mensajeInstitucional: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
              />
              <p className="text-[10px] text-slate-400">Este texto aparecerá en el portal donde los usuarios escanean el código QR para dejar sus mensajes.</p>
            </div>
          </div>
        </div>

        {/* BOTÓN DE GUARDAR */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios de Configuración
          </button>
        </div>
      </form>
    </div>
  );
}