"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DifuntosList } from "@/components/admin/DifuntosList";
import { eliminarDifunto } from "@/app/actions/admin";
import  CreateDifuntoModal  from "@/components/admin/CreateDifuntoModal";
import {
  Users,
  Heart,
  Calendar,
  Plus,
  Search,
} from "lucide-react";

export interface DifuntoAdmin {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string | null;
  fechaFallecimiento: string;
  biografia?: string | null;
  fotoUrl?: string | null;
  estado: "ACTIVO" | "CONSOLIDADO" | "ARCHIVADO";
  totalCondolencias: number;
  requiereModeracion: boolean;
  creadoEn?: string | Date;
}

interface AdminDashboardClientProps {
  slug: string;
  difuntosIniciales: DifuntoAdmin[];
  totalDifuntosSemana: number;
  requiereModeracionFuneraria: boolean;
}

// Auxiliar para resolver la URL pública de imágenes alojadas en R2 o locales
const getFotoUrl = (url?: string | null) => {
  if (!url) return null;
  // Si la URL ya viene completa desde R2, se devuelve tal cual
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // Si es una ruta relativa antigua, se le antepone el dominio
  const baseUrl =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-08816a2aed6a47989ca6d0bd835d5e56.r2.dev";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function AdminDashboardClient({
  slug,
  difuntosIniciales,
  totalDifuntosSemana,
  requiereModeracionFuneraria,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para controlar la apertura del componente CreateDifuntoModal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filtro y Métricas
  const filteredDifuntos = difuntosIniciales.filter((d) =>
    `${d.nombre} ${d.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activosCount = difuntosIniciales.filter((d) => d.estado === "ACTIVO").length;
  const totalCondolencias = difuntosIniciales.reduce(
    (acc, curr) => acc + curr.totalCondolencias,
    0
  );

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Servicio
        </button>
      </div>

      <main className="space-y-8">
        {/* METRICAS RAPIDAS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Servicios Activos</p>
              <p className="text-2xl font-bold text-white">{activosCount}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Condolencias Totales</p>
              <p className="text-2xl font-bold text-white">{totalCondolencias}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Registrados esta semana</p>
              <p className="text-2xl font-bold text-white">{totalDifuntosSemana}</p>
            </div>
          </div>
        </section>

        {/* BARRA DE BÚSQUEDA Y LISTADO */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Listado de Difuntos</h2>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* TARJETAS / LISTADO DE DIFUNTOS */}
          <DifuntosList
            difuntos={filteredDifuntos}
            slug={slug}
            getFotoUrl={getFotoUrl}
            onDeleteAction={async (id) => {
              const res = await eliminarDifunto(id);
              return res; 
            }}
          />
        </section>
      </main>

      {/* MODAL EXTERNO DE CREACIÓN */}
      <CreateDifuntoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        slug={slug}
        onSuccess={() => {
          router.refresh();
        }}
        requiereModeracionDefault={requiereModeracionFuneraria}
      />
    </>
  );
}