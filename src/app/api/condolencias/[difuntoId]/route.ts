// src/app/api/condolencias/[difuntoId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ difuntoId: string }> }
) {
  try {
    const { difuntoId } = await params;

    const condolencias = await prisma.condolencia.findMany({
      where: {
        difuntoId: difuntoId,
        estado: "APROBADO",
      },
      orderBy: {
        creadoEn: "desc",
      },
      select: {
        id: true,
        nombreAutor: true,
        parentesco: true,
        mensaje: true,
        fotoUrl: true,
        creadoEn: true,
      },
    });

    return NextResponse.json({ condolencias });
  } catch (error) {
    console.error("Error al obtener las condolencias:", error);
    return NextResponse.json(
      { error: "Error al cargar las condolencias." },
      { status: 500 }
    );
  }
}