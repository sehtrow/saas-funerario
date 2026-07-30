'use server';

import { prisma } from '@/lib/db/prisma';
import { EstadoCondolencia } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { obtenerSesionServidor } from '@/lib/auth';
import { headers } from 'next/headers';

export interface CrearCondolenciaInput {
  funerariaId: string;
  difuntoId: string;
  nombreAutor: string;
  parentesco?: string;
  mensaje: string;
}

// 1. Enviar una nueva condolencia (Público)
export async function enviarCondolencia(data: CrearCondolenciaInput) {
  try {
    if (!data.nombreAutor || !data.mensaje) {
      return { success: false, error: 'Por favor completa los campos requeridos.' };
    }

    // 2. Obtener el país desde las cabeceras que provee Vercel
    const headerList = await headers();
    // Vercel inyecta el código de país (ej. "CL", "AR"). Si estás en local, vendrá vacío o null.
    const codigoPais = headerList.get('x-vercel-ip-country') || 'CL'; 

    // Opcional: Si quieres un nombre más legible o usar una librería de mapeo de códigos, 
    // puedes guardarlo directamente o transformarlo.
    const pais = codigoPais; 

    // Verificamos si la funeraria requiere moderación
    const funeraria = await prisma.funeraria.findUnique({
      where: { id: data.funerariaId },
      select: { requiereModeracion: true },
    });

    const estadoInicial = funeraria?.requiereModeracion 
      ? EstadoCondolencia.PENDIENTE 
      : EstadoCondolencia.APROBADO;

    // 3. Crear la condolencia guardando el país
    const nueva = await prisma.condolencia.create({
      data: {
        funerariaId: data.funerariaId,
        difuntoId: data.difuntoId,
        nombreAutor: data.nombreAutor.trim(),
        parentesco: data.parentesco ? data.parentesco.trim() : null,
        mensaje: data.mensaje.trim(),
        estado: estadoInicial,
        pais: pais, // <-- Guardamos el país aquí
      },
    });

    revalidatePath(`/q/${data.difuntoId}`);
    revalidatePath(`/live/${data.difuntoId}`);

    return { success: true, data: nueva };
  } catch (err: any) {
    console.error('❌ ERROR AL INSERTAR:', err);
    return { success: false, error: err.message || 'Error interno.' };
  }
}

// 2. Cambiar el estado de una condolencia (Aprobado / Rechazado) - Requiere Admin
export async function cambiarEstadoCondolencia(
  condolenciaId: string,
  nuevoEstado: 'APROBADO' | 'RECHAZADO',
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
      data: { estado: nuevoEstado as EstadoCondolencia },
    });

    // Actualizamos las vistas de administración y pantalla en vivo
    revalidatePath(`/admin/${slug}/moderacion/difunto/${difuntoId}`);
    revalidatePath(`/live/${difuntoId}`);

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

    revalidatePath(`/admin/${slug}/moderacion/difunto/${difuntoId}`);
    revalidatePath(`/live/${difuntoId}`);

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