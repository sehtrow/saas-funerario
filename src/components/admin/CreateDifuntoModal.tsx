"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  User,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import {
  getPresignedUrlAction,
  createDifuntoAction,
} from "@/app/actions/admin";

interface CreateDifuntoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  slug: string;
  requiereModeracionDefault: boolean;
}

export default function CreateDifuntoModal({
  isOpen,
  onClose,
  onSuccess,
  slug,
  requiereModeracionDefault,
}: CreateDifuntoModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    fechaFallecimiento: "",
    biografia: "",
    requiereModeracion: true,
  });

  // Cada vez que el modal se abre, inicializamos el checkbox con el valor por defecto de la funeraria
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        requiereModeracion: requiereModeracionDefault,
      }));
    }
  }, [isOpen, requiereModeracionDefault]);

  if (!isOpen) return null;

  // Previsualizar la foto de perfil seleccionada
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      let finalFotoUrl = "";

      // Si el usuario seleccionó una foto, subir directamente a Cloudflare R2
      if (imageFile) {
        const presignedRes = await getPresignedUrlAction(
          imageFile.name,
          imageFile.type,
          slug
        );

        if (!presignedRes.success || !presignedRes.uploadUrl) {
          throw new Error(
            presignedRes.error || "No se pudo preparar la carga de la imagen."
          );
        }

        const uploadRes = await fetch(presignedRes.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });

        if (!uploadRes.ok) {
          throw new Error("Error al subir la foto a Cloudflare R2");
        }

        finalFotoUrl = presignedRes.publicUrl || "";
      }

      // Guardar difunto en Base de Datos
      const res = await createDifuntoAction({
        ...formData,
        fechaNacimiento: formData.fechaNacimiento || undefined,
        biografia: formData.biografia || undefined,
        fotoUrl: finalFotoUrl || undefined,
        slug,
      });

      if (!res.success) {
        throw new Error(res.error || "Error al crear el registro.");
      }

      // Reset del formulario (respetando el valor por defecto de la funeraria)
      setFormData({
        nombre: "",
        apellido: "",
        fechaNacimiento: "",
        fechaFallecimiento: "",
        biografia: "",
        requiereModeracion: requiereModeracionDefault,
      });
      setImageFile(null);
      setImagePreview(null);

      // Notificar éxito y refrescar la vista
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error al registrar el difunto:", error);
      setErrorMessage(error.message || "Hubo un error al crear el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Cabecera Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Nuevo Registro de Difunto
              </h2>
              <p className="text-xs text-slate-400">
                Crea un nuevo perfil para publicar homenajes y condolencias.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Subida de Foto de Perfil */}
          <div className="flex flex-col items-center gap-3">
            <label className="text-xs font-medium text-slate-300 self-start">
              Foto de Perfil (Opcional)
            </label>
            <div className="relative group w-28 h-28 rounded-full border-2 border-dashed border-slate-700 hover:border-amber-400 flex items-center justify-center overflow-hidden bg-slate-950 transition-all cursor-pointer">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-500 group-hover:text-amber-400">
                  <ImageIcon className="w-7 h-7" />
                  <span className="text-[10px]">Subir foto</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Pedro"
                value={formData.nombre || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Fernandez"
                value={formData.apellido || ""}
                onChange={(e) =>
                  setFormData({ ...formData, apellido: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Fechas de Nacimiento y Fallecimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fechaNacimiento: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fecha de Fallecimiento *
              </label>
              <input
                type="date"
                required
                value={formData.fechaFallecimiento || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fechaFallecimiento: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Biografía */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Biografía / Reseña Histórica
            </label>
            <textarea
              rows={3}
              placeholder="Escribe una breve reseña de su vida..."
              value={formData.biografia || ""}
              onChange={(e) =>
                setFormData({ ...formData, biografia: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
            />
          </div>

          {/* Opción de Moderación de Mensajes */}
          <div className="flex items-start gap-3 pt-2 bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl">
            <input
              type="checkbox"
              id="createRequiereModeracion"
              checked={formData.requiereModeracion}
              onChange={(e) =>
                setFormData({ ...formData, requiereModeracion: e.target.checked })
              }
              className="mt-0.5 w-4 h-4 rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
            />
            <label
              htmlFor="createRequiereModeracion"
              className="text-xs text-slate-300 cursor-pointer"
            >
              <span className="font-semibold block text-white">
                Requerir aprobación de mensajes
              </span>
              Si está activo, las condolencias pasarán por revisión antes de mostrarse en la pantalla en vivo.
            </label>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Crear Difunto</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}