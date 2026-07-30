// src/app/q/[difuntoId]/page.tsx
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import FormularioQRClient from "./FormularioQRClient";

async function getDifunto(difuntoId: string) {
  return await prisma.difunto.findFirst({
    where: {
      id: difuntoId,
      estado: "ACTIVO",
    },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      fotoPerfilUrl: true,
      funerariaId: true,
      funeraria: {
        select: {
          nombre: true,
          logoUrl: true,
        },
      },
    },
  });
}

export default async function PaginaFormularioQR({
  params,
}: {
  params: Promise<{ difuntoId: string }>;
}) {
  const { difuntoId } = await params;
  const difunto = await getDifunto(difuntoId);

  if (!difunto) {
    notFound();
  }

  return <FormularioQRClient difunto={difunto} />;
}