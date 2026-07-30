import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import AdminConfigClient from "./AdminConfigClient";

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function AdminConfigPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const funeraria = await prisma.funeraria.findUnique({
    where: { slug },
    select: {
      nombre: true,
      slug: true,
      tiempoRotacionTv: true,
      mensajeInstitucional: true,
      requiereModeracion: true,
      logoUrl: true,
    },
  });

  if (!funeraria) {
    notFound();
  }

  return (
    // Sin min-h-screen ni paddings extraños. Usamos max-w-7xl mx-auto igual que el inicio.
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="border-b border-slate-800/80 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
          Administración del Sistema
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white font-serif">
          Configuración General
        </h1>
      </header>

      <AdminConfigClient slug={slug} funeraria={funeraria} />
    </div>
  );
}