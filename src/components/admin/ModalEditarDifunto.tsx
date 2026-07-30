"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Loader2, User } from "lucide-react";
import {
  updateDifuntoAction,
  getPresignedUrlAction,
} from "@/app/admin/[slug]/actions"; // Ajusta el path según tus Server Actions

export interface DifuntoEditarData {
  id: string;
  nombre: string;
  apellido: string;
  biografia?: string | null;
  fechaNacimiento?: string | null;
  fechaFallecimiento: string;
  fotoUrl?: string | null;
  requiereModeracion: boolean;
}

interface ModalEditarDifuntoProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  difunto: DifuntoEditarData | null;
  onSuccess?: () => void;
}

export const ModalEditarDifunto = ({
  isOpen,
  onClose,
  slug,
  difunto,
  onSuccess,
}: ModalEditarDifuntoProps) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [biografia, setBiografia] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaFallecimiento, setFechaFallecimiento] = useState("");
  const [requiereModeracion, setRequiereModeracion] = useState(true);

  // Estados para manejo de imagen
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Estados de interfaz
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (difunto) {
      setNombre(difunto.nombre || "");
      setApellido(difunto.apellido || "");
      setBiografia(difunto.biografia || "");
      setFechaNacimiento(difunto.fechaNacimiento || "");
      setFechaFallecimiento(difunto.fechaFallecimiento || "");
      setRequiereModeracion(difunto.requiereModeracion ?? true);
      setPreviewUrl(difunto.fotoUrl || null);
      setSelectedFile(null);
      setErrorMessage(null);
    }
  }, [difunto]);

  if (!isOpen || !difunto) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        try {
            // 💡 Por defecto, mantenemos la foto que ya tenía el difunto (difunto.fotoUrl)
            let finalFotoUrl = difunto.fotoUrl || undefined;

            // 1. Si hay una nueva imagen seleccionada, subirla a R2
            if (selectedFile) {
            const presignedRes = await getPresignedUrlAction(
                selectedFile.name,
                selectedFile.type,
                slug
            );

            if (!presignedRes.success || !presignedRes.uploadUrl || !presignedRes.publicUrl) {
                throw new Error(
                presignedRes.error || "Error al preparar subida de imagen."
                );
            }

            const uploadRes = await fetch(presignedRes.uploadUrl, {
                method: "PUT",
                body: selectedFile,
                headers: { "Content-Type": selectedFile.type },
            });

            if (!uploadRes.ok) {
                throw new Error("No se pudo subir la imagen a R2.");
            }

            // Asignamos explícitamente la URL pública completa devuelta por la acción
            finalFotoUrl = presignedRes.publicUrl;
            }

            // 2. Actualizar el registro en PostgreSQL con la URL limpia y completa
            const result = await updateDifuntoAction({
            id: difunto.id,
            slug,
            nombre,
            apellido,
            biografia,
            fechaNacimiento,
            fechaFallecimiento,
            fotoUrl: finalFotoUrl, // 👈 Ahora enviará la nueva URL completa o mantendrá la anterior válida
            requiereModeracion,
            });

            if (!result.success) {
            throw new Error(result.error || "No se pudieron guardar los cambios.");
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            setErrorMessage(error.message || "Ocurrió un error inesperado.");
        } finally {
            setIsLoading(false);
        }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-lg font-bold text-white font-serif">
            Editar Difunto
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Subida de Imagen */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0 flex items-center justify-center">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Vista previa"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-slate-500" />
              )}
            </div>

            <div>
              <label
                htmlFor="foto-perfil-input"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                Cambiar foto
              </label>
              <input
                id="foto-perfil-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Formato JPG, PNG o WEBP. Max 5MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            {/* Apellido */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Apellido *
              </label>
              <input
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha Nacimiento */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Fecha Nacimiento
              </label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            {/* Fecha Fallecimiento */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Fecha Fallecimiento *
              </label>
              <input
                type="date"
                required
                value={fechaFallecimiento}
                onChange={(e) => setFechaFallecimiento(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Biografía */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Biografía / Reseña
            </label>
            <textarea
              rows={3}
              value={biografia}
              onChange={(e) => setBiografia(e.target.value)}
              placeholder="Breve reseña u homenaje..."
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
            />
          </div>

          {/* Moderación */}
          <div className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
            <input
              type="checkbox"
              id="requiereModeracion"
              checked={requiereModeracion}
              onChange={(e) => setRequiereModeracion(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/20"
            />
            <label
              htmlFor="requiereModeracion"
              className="text-xs text-slate-300 font-medium cursor-pointer"
            >
              Moderar condolencias antes de publicar
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors border border-slate-700/60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};