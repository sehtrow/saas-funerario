import { prisma } from "@/lib/db/prisma";
import RegistrarPagoForm from "./RegistrarPagoForm";

export default async function RegistrarPagoPage() {
  // Consultar todas las funerarias ordenadas alfabéticamente
  const funerarias = await prisma.funeraria.findMany({
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, slug: true },
  });

  return <RegistrarPagoForm funerarias={funerarias} />;
}