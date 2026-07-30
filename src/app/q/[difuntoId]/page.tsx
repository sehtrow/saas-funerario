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
      requiereModeracion: true,
      funeraria: {
        select: {
          id: true,     // <-- Añadido aquí
          slug: true,   // <-- Añadido aquí
          nombre: true,
          logoUrl: true,
          requiereModeracion: true,
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