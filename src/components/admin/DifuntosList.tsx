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
  fotoUrl?: string | null; // Súplice por compatibilidad
  estado: "ACTIVO" | "CONSOLIDADO" | "ARCHIVADO";
  totalCondolencias: number;
  requiereModeracion: boolean;
  creadoEn?: string | Date;
}

interface DifuntosListProps {
  difuntos: DifuntoAdmin[];
  slug: string;
  getFotoUrl: (path?: string | null) => string | null;
  onSuccess?: () => void; // Para refrescar la página o datos si lo deseas
}

export const DifuntosList = ({
  difuntos,
  slug,
  getFotoUrl,
  onSuccess,
}: DifuntosListProps) => {
  // Estados para controlar el modal de edición internamente
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDifunto, setSelectedDifunto] = useState<DifuntoAdmin | null>(null);

  const handleOpenEdit = (difunto: DifuntoAdmin) => {
    setSelectedDifunto(difunto);
    setIsEditModalOpen(true);
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
          // Resolver URL de la foto usando tu helper
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
                  href={`/tv/${slug}/${difunto.id}`}
                  target="_blank"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors border border-slate-700/60"
                >
                  <Tv className="w-3.5 h-3.5 text-indigo-400" />
                  Pantalla Live
                </Link>

                <Link
                  href={`/q/${difunto.id}`}
                  target="_blank"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors border border-slate-700/60"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  Link QR
                </Link>

                <a
                  href={`/api/difuntos/${difunto.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PDF
                </a>
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
          // Opcional: Recargar la página actual para reflejar cambios en servidor
          window.location.reload();
        }}
      />
    </>
  );
};