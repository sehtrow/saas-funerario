// src/app/actions/condolencias.ts
'use server';

import { prisma } from '@/lib/db/prisma';
import { EstadoCondolencia } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { obtenerSesionServidor } from '@/lib/auth';
import { headers } from 'next/headers';

// 1. Enviar una nueva condolencia (Público)
export async function enviarCondolencia(formData: FormData) {
  try {
    const funerariaId = formData.get('funerariaId') as string;
    const difuntoId = formData.get('difuntoId') as string;
    const slug = formData.get('slug') as string; 
    const nombreAutor = formData.get('nombreAutor') as string;
    const parentesco = formData.get('parentesco') as string;
    const mensaje = formData.get('mensaje') as string;
    const fotoUrl = formData.get('fotoUrl') as string;

    if (!nombreAutor || !mensaje || !funerariaId || !difuntoId) {
      return { success: false, error: 'Por favor completa los campos requeridos.' };
    }

    // 2. Obtener el país desde las cabeceras de Vercel
    const headerList = await headers();
    const pais = headerList.get('x-vercel-ip-country') || 'CL'; 

    // 3. Buscar tanto la funeraria como el difunto para verificar sus reglas de moderación
    const [funeraria, difunto] = await Promise.all([
      prisma.funeraria.findUnique({
        where: { id: funerariaId },
        select: { requiereModeracion: true, slug: true },
      }),
      prisma.difunto.findUnique({
        where: { id: difuntoId },
        select: { requiereModeracion: true },
      }),
    ]);

    // 4. Lógica combinada: 
    // Si el difunto existe, usamos su regla (difunto.requiereModeracion). 
    // Como respaldo por si el difunto no viniera, usamos el de la funeraria.
    // (O si quieres que el difunto tenga la última palabra al editarlo individualmente):
    const requiereMod = difunto?.requiereModeracion ?? funeraria?.requiereModeracion ?? true;

    const estadoInicial = requiereMod 
      ? EstadoCondolencia.PENDIENTE 
      : EstadoCondolencia.APROBADO;

    // 5. Crear la condolencia con el estado correcto
    const nueva = await prisma.condolencia.create({
      data: {
        funerariaId,
        difuntoId,
        nombreAutor: nombreAutor.trim(),
        parentesco: parentesco ? parentesco.trim() : null,
        mensaje: mensaje.trim(),
        estado: estadoInicial,
        pais,
        fotoUrl: fotoUrl || null,
      },
    });

    // 6. Revalidar las rutas limpias
    const targetSlug = slug || funeraria?.slug;
    if (targetSlug) {
      revalidatePath(`/${targetSlug}/difuntos/${difuntoId}`);
      revalidatePath(`/${targetSlug}/tv/${difuntoId}`);
    }

    return { success: true, data: nueva };
  } catch (err: any) {
    console.error('❌ ERROR AL INSERTAR CONDOLENCIA:', err);
    return { success: false, error: err.message || 'Error interno.' };
  }
}

// 2. Cambiar el estado de una condolencia (Aprobado / Rechazado) - Requiere Admin
export async function cambiarEstadoCondolencia(
  condolenciaId: string,
  nuevoEstado: EstadoCondolencia,
  slug: string,
  difuntoId: string
) {
  try {
    const session = await obtenerSesionServidor();
    if (!session) {
      return { success: false, error: 'No autorizado.' };
    }

    await prisma.condolencia.update({
      where: { id: condolenciaId },
      data: { estado: nuevoEstado },
    });

    // Actualizamos las rutas del panel de moderación y pantalla en vivo
    revalidatePath(`/admin/moderacion/${slug}/${difuntoId}`);
    revalidatePath(`/${slug}/tv/${difuntoId}`);

    return { success: true };
  } catch (error) {
    console.error('Error al cambiar estado de condolencia:', error);
    return { success: false, error: 'Error al actualizar el estado.' };
  }
}

// 3. Eliminar una condolencia - Requiere Admin
export async function eliminarCondolencia(
  condolenciaId: string,
  slug: string,
  difuntoId: string
) {
  try {
    const session = await obtenerSesionServidor();
    if (!session) {
      return { success: false, error: 'No autorizado.' };
    }

    await prisma.condolencia.delete({
      where: { id: condolenciaId },
    });

    revalidatePath(`/admin/moderacion/${slug}/${difuntoId}`);
    revalidatePath(`/${slug}/tv/${difuntoId}`);

    return { success: true };
  } catch (error) {
    console.error('Error al eliminar condolencia:', error);
    return { success: false, error: 'Error al eliminar el registro.' };
  }
}

// 4. Cambiar la configuración general de moderación de la funeraria - Requiere Admin
export async function cambiarConfiguracionModeracion(funerariaId: string, requiereModeracion: boolean) {
  try {
    const session = await obtenerSesionServidor();
    if (!session) {
      return { success: false, error: 'No autorizado.' };
    }

    const funeraria = await prisma.funeraria.update({
      where: { id: funerariaId },
      data: { requiereModeracion },
    });

    revalidatePath(`/admin/${funeraria.slug}`);
    return { success: true };
  } catch (error) {
    console.error('Error al cambiar configuración de moderación:', error);
    return { success: false, error: 'Error al actualizar la configuración.' };
  }
}

// 5. Obtener condolencias para el panel de moderación
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
            id: true,
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