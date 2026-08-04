import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import AdminDashboardClient from "./AdminDashboardCliente";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminDashboardPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!slug) {
    notFound();
  }

  // 1. Buscar la funeraria agregando fotoPerfilUrl y fechaNacimiento
  const funeraria = await prisma.funeraria.findUnique({
    where: { slug },
    select: {
      id: true,
      nombre: true,
      difuntos: {
        where: {
          estado: { not: "ELIMINADO" },
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          fotoPerfilUrl: true, // 👈 ¡CLAVE 1: Traer la foto desde PostgreSQL!
          fechaNacimiento: true, // 👈 Importante para el subtítulo de la lista
          fechaFallecimiento: true,
          estado: true,
          biografia: true,
          requiereModeracion: true,
          creadoEn: true,
          _count: {
            select: {
              condolencias: true,
            },
          },
        },
        orderBy: {
          creadoEn: "desc",
        },
      },
    },
  });

  if (!funeraria) {
    notFound();
  }

  // 2. Calcular los registros creados en la semana actual (Lunes a Domingo)
  const ahora = new Date();
  const primerDiaSemana = new Date(ahora);
  const dia = ahora.getDay();
  const diff = ahora.getDate() - dia + (dia === 0 ? -6 : 1);
  primerDiaSemana.setDate(diff);
  primerDiaSemana.setHours(0, 0, 0, 0);

  const totalDifuntosSemana = funeraria.difuntos.filter((d) => {
    if (!d.creadoEn) return false;
    return new Date(d.creadoEn) >= primerDiaSemana;
  }).length;

  // 3. Mapear los datos para el componente cliente incluyendo fotoPerfilUrl
  const difuntosIniciales = funeraria.difuntos.map((d) => ({
    id: d.id,
    nombre: d.nombre,
    apellido: d.apellido,
    biografia: d.biografia,
    fotoUrl: d.fotoPerfilUrl, // 👈 ¡CLAVE 2: Mapear fotoPerfilUrl a la propiedad fotoUrl!
    fechaNacimiento: d.fechaNacimiento
      ? new Date(d.fechaNacimiento).toISOString().split("T")[0]
      : "",
    fechaFallecimiento: d.fechaFallecimiento
      ? new Date(d.fechaFallecimiento).toISOString().split("T")[0]
      : "",
    estado: d.estado as "ACTIVO" | "CONSOLIDADO" | "ARCHIVADO",
    totalCondolencias: d._count.condolencias,
    requiereModeracion: d.requiereModeracion,
    creadoEn: d.creadoEn,
  }));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Panel de Administración
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif">
              {funeraria.nombre}
            </h1>
          </div>
        </header>

        <AdminDashboardClient
          slug={slug}
          difuntosIniciales={difuntosIniciales}
          totalDifuntosSemana={totalDifuntosSemana}
          requiereModeracionFuneraria={funeraria.requiereModeracion}
        />
      </div>
    </div>
  );
}