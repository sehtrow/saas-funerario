// app/actions/pantalla.ts
'use server';

import { prisma } from '@/lib/db/prisma';

export async function obtenerDatosPantalla(slugFuneraria: string, difuntoId: string) {
  try {
    const difunto = await prisma.difunto.findFirst({
      where: {
        id: difuntoId,
        funeraria: { slug: slugFuneraria },
        estado: 'ACTIVO',
      },
      include: {
        funeraria: true,
        configPantalla: true,
        condolencias: {
          where: { estado: 'APROBADO' },
          orderBy: { creadoEn: 'desc' },
        },
      },
    });

    if (!difunto) return null;

    return difunto;
  } catch (error) {
    console.error('Error al obtener datos de la pantalla:', error);
    return null;
  }
}