"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Calendar,
  Heart,
  Pencil,
  Tv,
  QrCode,
  Download,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { ModalEditarDifunto } from "@/components/admin/ModalEditarDifunto"; 

export interface DifuntoAdmin {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string | null;
  fechaFallecimiento: string;
  biografia?: string | null;
  fotoPerfilUrl?: string | null;
  fotoUrl?: string | null;
  estado: "ACTIVO" | "CONSOLIDADO" | "ARCHIVADO" | "ELIMINADO";
  totalCondolencias: number;
  requiereModeracion: boolean;
  creadoEn?: string | Date;
}

interface DifuntosListProps {
  difuntos: DifuntoAdmin[];
  slug: string;
  getFotoUrl: (path?: string | null) => string | null;
  onSuccess?: () => void;
  onDeleteAction?: (id: string) => Promise<{ success: boolean; error?: string }>; // Acción para eliminar
}

export const DifuntosList = ({
  difuntos,
  slug,
  getFotoUrl,
  onSuccess,
  onDeleteAction,
}: DifuntosListProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDifunto, setSelectedDifunto] = useState<DifuntoAdmin | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleOpenEdit = (difunto: DifuntoAdmin) => {
    setSelectedDifunto(difunto);
    setIsEditModalOpen(true);
  };

  // Función segura para manejar el clic de WhatsApp en el cliente
  const handleWhatsAppShare = (difunto: DifuntoAdmin) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const urlDestino = `${baseUrl}/${slug}/difuntos/${difunto.id}`;
    const texto = `Hola, les comparto el enlace para ver la información y dejar condolencias para ${difunto.nombre} ${difunto.apellido}: ${urlDestino}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  };

  // Función para manejar la eliminación lógica con confirmación
  const handleDelete = async (difunto: DifuntoAdmin) => {
    const confirmado = window.confirm(
      `¿Estás seguro de que deseas eliminar el registro de ${difunto.nombre} ${difunto.apellido}? Dejará de estar visible.`
    );

    if (!confirmado) return;

    try {
      setIsDeletingId(difunto.id);
      
      if (onDeleteAction) {
        const res = await onDeleteAction(difunto.id);
        if (!res.success) {
          alert(res.error || "No se pudo eliminar el registro.");
          return;
        }
      }

      if (onSuccess) onSuccess();
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error inesperado.");
    } finally {
      setIsDeletingId(null);
    }
  };

  if (!difuntos || difuntos.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
        No se encontraron registros.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {difuntos.map((difunto) => {
          const fotoResuelta = getFotoUrl(
            difunto.fotoPerfilUrl || difunto.fotoUrl
          );

          return (
            <div
              key={difunto.id}
              className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700/80 transition-all"
            >
              {/* Información del Difunto */}
              <div className="flex items-center gap-4">
                {fotoResuelta ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-700 flex-shrink-0">
                    <Image
                      src={fotoResuelta}
                      alt={`${difunto.nombre} ${difunto.apellido}`}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-serif">
                      {difunto.nombre} {difunto.apellido}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        difunto.estado === "ACTIVO"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : difunto.estado === "CONSOLIDADO"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {difunto.estado}
                    </span>
                    {difunto.requiereModeracion ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Moderado
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Directo (Sin filtro)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {difunto.fechaNacimiento
                        ? `${difunto.fechaNacimiento} - `
                        : ""}
                      {difunto.fechaFallecimiento}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-amber-500/80" />
                      {difunto.totalCondolencias} mensajes
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Link
                  href={`/admin/${slug}/moderacion/difunto/${difunto.id}`}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Moderar
                </Link>

                <button
                  onClick={() => handleOpenEdit(difunto)}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors border border-slate-700/60 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-amber-400" />
                  Editar
                </button>

                <Link
                  href={`/${slug}/tv/${difunto.id}`}
                  target="_blank"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors border border-slate-700/60"
                >
                  <Tv className="w-3.5 h-3.5 text-indigo-400" />
                  Pantalla Live
                </Link>

                <Link
                  href={`/${slug}/difuntos/${difunto.id}`}
                  target="_blank"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors border border-slate-700/60"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  Link QR
                </Link>

                {/* Botón Compartir por WhatsApp seguro */}
                <button
                  type="button"
                  onClick={() => handleWhatsAppShare(difunto)}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </button>

                <a
                  href={`/api/difuntos/${difunto.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PDF
                </a>

                {/* Botón de Eliminar Lógico */}
                <button
                  type="button"
                  disabled={isDeletingId === difunto.id}
                  onClick={() => handleDelete(difunto)}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeletingId === difunto.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Edición Integrado */}
      <ModalEditarDifunto
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        slug={slug}
        difunto={
          selectedDifunto
            ? {
                id: selectedDifunto.id,
                nombre: selectedDifunto.nombre,
                apellido: selectedDifunto.apellido,
                biografia: selectedDifunto.biografia,
                fechaNacimiento: selectedDifunto.fechaNacimiento,
                fechaFallecimiento: selectedDifunto.fechaFallecimiento,
                fotoUrl: getFotoUrl(
                  selectedDifunto.fotoPerfilUrl || selectedDifunto.fotoUrl
                ),
                requiereModeracion: selectedDifunto.requiereModeracion,
              }
            : null
        }
        onSuccess={() => {
          if (onSuccess) onSuccess();
          window.location.reload();
        }}
      />
    </>
  );
};