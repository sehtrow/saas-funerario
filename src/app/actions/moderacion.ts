// src/app/actions/moderacion.ts
'use server';

import { prisma } from '@/lib/db/prisma';
import { EstadoCondolencia } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function obtenerCondolenciasParaModeracion(
  slugFuneraria: string,
  difuntoId: string
) {
  try {
    const difunto = await prisma.difunto.findFirst({
      where: {
        id: difuntoId,
        funeraria: { slug: slugFuneraria },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        fotoPerfilUrl: true,
        funeraria: {
          select: {
            nombre: true,
            slug: true,
          },
        },
        condolencias: {
          orderBy: { creadoEn: 'desc' },
        },
      },
    });

    return difunto;
  } catch (error) {
    console.error('Error al obtener datos para moderación:', error);
    return null;
  }
}

export async function cambiarEstadoCondolencia(
  condolenciaId: string,
  nuevoEstado: EstadoCondolencia,
  pathARevalidar?: string
) {
  try {
    const actualizada = await prisma.condolencia.update({
      where: { id: condolenciaId },
      data: { estado: nuevoEstado },
    });

    if (pathARevalidar) {
      revalidatePath(pathARevalidar);
    }

    return { success: true, data: actualizada };
  } catch (error) {
    console.error('Error al cambiar el estado de la condolencia:', error);
    return { success: false, error: 'No se pudo actualizar el estado.' };
  }
}