"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { compressImage } from "@/lib/utils/image-compressor";
import { Camera, Send, CheckCircle2, Heart, Loader2, Sparkles, X } from "lucide-react";
import type { DifuntoPublico } from "@/types";

export default function FormularioQRClient({ difunto }: { difunto: DifuntoPublico }) {
  const [nombreAutor, setNombreAutor] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Limpieza de memoria de la vista previa al desmontar el componente o cambiar la foto
  useEffect(() => {
    return () => {
      if (fotoPreview) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoPreview]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Por favor selecciona una imagen válida.");
        return;
      }
      setFotoFile(file);
      setFotoPreview((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return URL.createObjectURL(file);
      });
      setErrorMessage("");
    }
  };

  const handleRemovePhoto = () => {
    setFotoFile(null);
    setFotoPreview((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return null;
    });
  };

  const resetFormulario = () => {
    setNombreAutor("");
    setParentesco("");
    setMensaje("");
    handleRemovePhoto();
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreAutor.trim() || !mensaje.trim()) {
      setErrorMessage("Por favor completa tu nombre y tu mensaje.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let finalFotoPublicUrl: string | null = null;
      let finalFotoKeyR2: string | null = null;

      // 1. Si adjuntó foto, comprimir en cliente y subir a Cloudflare R2 vía Presigned URL
      if (fotoFile) {
        const compressedBlob = await compressImage(fotoFile);
        const fileToUpload = new File([compressedBlob], fotoFile.name, {
          type: compressedBlob.type,
        });

        const presignedRes = await fetch("/api/upload/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileType: fileToUpload.type,
            difuntoId: difunto.id,
          }),
        });

        if (!presignedRes.ok) {
          throw new Error("No se pudo obtener la autorización de subida.");
        }

        const { uploadUrl, publicUrl, key } = await presignedRes.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": fileToUpload.type },
          body: fileToUpload,
        });

        if (!uploadRes.ok) {
          throw new Error("Error al subir la imagen al almacenamiento.");
        }

        finalFotoPublicUrl = publicUrl;
        finalFotoKeyR2 = key;
      }

      // 2. Guardar condolencia en la BD
      const saveRes = await fetch("/api/condolencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funerariaId: difunto.funeraria.id,
          difuntoId: difunto.id,
          nombreAutor: nombreAutor.trim(),
          parentesco: parentesco.trim(),
          mensaje: mensaje.trim(),
          fotoUrl: finalFotoPublicUrl,
          fotoKeyR2: finalFotoKeyR2,
        }),
      });

      const saveResult = await saveRes.json();

      if (!saveRes.ok) {
        throw new Error(saveResult.error || "No se pudo guardar la condolencia.");
      }

      setIsSent(true);
      resetFormulario();
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : "Ocurrió un error inesperado. Intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between px-4 py-6 max-w-md mx-auto font-sans">
      {/* CABECERA */}
      <header className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
          <Heart className="w-3 h-3 fill-amber-400 text-amber-400" />
          {difunto.funeraria.nombre}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
          En memoria de {difunto.nombre} {difunto.apellido}
        </h1>
        <p className="text-xs text-slate-400">
          Envía tu mensaje de afecto. Aparecerá en directo en la pantalla de la sala.
        </p>
      </header>

      {/* VISTA DE ÉXITO */}
      {isSent ? (
        <div className="my-auto bg-slate-900/80 border border-slate-800 p-8 rounded-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-300 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">¡Gracias por tu mensaje!</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tu palabra de aliento ha sido transmitida a la pantalla de la sala y guardada para la familia.
            </p>
          </div>
          <button
            onClick={() => setIsSent(false)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-3 rounded-xl text-sm font-medium transition-all"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        /* FORMULARIO DE CAPTURA */
        <div className="my-6">
          <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md shadow-2xl">
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center font-medium">
                {errorMessage}
              </div>
            )}

            {/* NOMBRE DEL AUTOR */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Tu Nombre completo <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={nombreAutor}
                onChange={(e) => setNombreAutor(e.target.value)}
                placeholder="Ej. María Fernández"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder:text-slate-600 outline-none transition-all"
              />
            </div>

            {/* PARENTESCO */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Relación o Parentesco <span className="text-slate-500">(Opcional)</span>
              </label>
              <input
                type="text"
                value={parentesco}
                onChange={(e) => setParentesco(e.target.value)}
                placeholder="Ej. Amiga de la infancia, Compañero de trabajo"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-3 text-slate-100 text-sm placeholder:text-slate-600 outline-none transition-all"
              />
            </div>

            {/* MENSAJE */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Mensaje de Condolencia <span className="text-amber-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe aquí tus palabras para la familia..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl p-4 text-slate-100 text-sm placeholder:text-slate-600 outline-none transition-all resize-none"
              />
            </div>

            {/* FOTO ADJUNTA */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-slate-300">
                Adjuntar Foto de Recuerdo <span className="text-slate-500">(Opcional)</span>
              </label>

              {fotoPreview ? (
                <div className="relative w-full h-40 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group">
                  <Image
                    src={fotoPreview}
                    alt="Vista previa"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-28 bg-slate-950 border border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl cursor-pointer transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-6 h-6 text-slate-500 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">
                      Toca para tomar foto o elegir de tu galería
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* BOTÓN DE ENVÍO */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando mensaje...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Condolencia
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* FOOTER */}
      <footer className="text-center py-2 text-[11px] text-slate-600 flex items-center justify-center gap-1">
        <span>Powered by</span>
        <Sparkles className="w-3 h-3 text-amber-500/70" />
        <span className="font-semibold text-slate-500">MemoriaDigital</span>
      </footer>
    </main>
  );
}