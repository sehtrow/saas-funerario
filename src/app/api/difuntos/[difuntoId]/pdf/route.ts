// src/app/api/difuntos/[difuntoId]/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { prisma } from "@/lib/db/prisma";
import { AlbumPdf } from "@/components/pdf/AlbumPdf";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ difuntoId: string }> }
) {
  try {
    const resolvedParams = await params;
    const difuntoId = resolvedParams.difuntoId;

    if (!difuntoId) {
      return NextResponse.json(
        { error: "ID de difunto no proporcionado." },
        { status: 400 }
      );
    }

    // Buscar difunto con sus relaciones
    const difunto = await prisma.difunto.findUnique({
      where: { id: difuntoId },
      include: {
        funeraria: true,
        condolencias: {
          where: { estado: "APROBADO" },
          orderBy: { creadoEn: "asc" },
        },
      },
    });

    if (!difunto) {
      return NextResponse.json(
        { error: "Difunto no encontrado en la base de datos." },
        { status: 404 }
      );
    }

    // Generación del PDF
    const pdfElement = React.createElement(AlbumPdf, {
      nombreDifunto: `${difunto.nombre} ${difunto.apellido}`,
      fechaFallecimiento: new Date(difunto.fechaFallecimiento).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      nombreFuneraria: difunto.funeraria.nombre,
      condolencias: difunto.condolencias,
    }) as any;

    const pdfBuffer = await renderToBuffer(pdfElement);
    const filename = `Album_Recuerdos_${difunto.nombre}_${difunto.apellido}.pdf`;

    return new NextResponse(Uint8Array.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error al generar el Álbum PDF:", error);
    return NextResponse.json(
      { error: "Error interno al generar el PDF." },
      { status: 500 }
    );
  }
}