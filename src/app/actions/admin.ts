"use server";

import { prisma } from "@/lib/db/prisma";
import { r2Client } from "@/lib/r2";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";

// Helper para evitar el desfase de zona horaria (UTC vs Local) en inputs "YYYY-MM-DD"
function parseLocalDate(dateString?: string) {
  if (!dateString) return null;
  return new Date(`${dateString}T12:00:00`);
}

// 1. Obtener Presigned URL para R2
export async function getPresignedUrlAction(fileName: string, fileType: string, slug: string) {
  try {
    if (!slug) {
      console.error("⚠️ Error crítico: getPresignedUrlAction recibió un slug vacío.");
      return { success: false, error: "El slug es obligatorio." };
    }
    const extension = fileName.split(".").pop();
    const key = `difuntos/${slug}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 360 });
    const baseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(/\/$/, "");
    
    const publicUrl = `${baseUrl}/${key}`;

    return {
      success: true,
      uploadUrl,
      publicUrl,
    };
  } catch (error: any) {
    console.error("Error al generar presigned URL R2:", error);
    return {
      success: false,
      error: "No se pudo preparar la subida de la imagen.",
    };
  }
}

// 2. Crear Difunto en PostgreSQL (Adaptado para recibir sucursalId)
export async function createDifuntoAction({
  nombre,
  apellido,
  biografia,
  fechaNacimiento,
  fechaFallecimiento,
  fotoUrl,
  requiereModeracion,
  slug,
  sucursalId, // <-- NUEVO: Recibimos la sucursal seleccionada
}: {
  nombre: string;
  apellido: string;
  biografia?: string;
  fechaNacimiento?: string;
  fechaFallecimiento: string;
  fotoUrl?: string;
  requiereModeracion?: boolean;
  slug: string;
  sucursalId: string; // <-- Obligatorio en el nuevo esquema
}) {
  try {
    // Verificamos que la funeraria exista a través del slug
    const funeraria = await prisma.funeraria.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!funeraria) {
      return { success: false, error: "Funeraria no encontrada." };
    }

    // Verificamos que la sucursal pertenezca realmente a esta funeraria (Seguridad multi-tenant)
    const sucursal = await prisma.sucursal.findFirst({
      where: { id: sucursalId, funerariaId: funeraria.id },
    });

    if (!sucursal) {
      return { success: false, error: "La sucursal seleccionada no es válida para esta funeraria." };
    }

    const difunto = await prisma.difunto.create({
      data: {
        funerariaId: funeraria.id,
        sucursalId: sucursal.id, // <-- NUEVO: Vinculado a la tabla Sucursal
        nombre,
        apellido,
        biografia: biografia || null,
        fechaNacimiento: parseLocalDate(fechaNacimiento),
        fechaFallecimiento: parseLocalDate(fechaFallecimiento) || new Date(),
        fotoPerfilUrl: fotoUrl || null,
        requiereModeracion: requiereModeracion ?? true,
      },
    });

    revalidatePath(`/admin/${slug}`);
    return { success: true, difunto };
  } catch (error: any) {
    console.error("Error al crear difunto:", error);
    return {
      success: false,
      error: error.message || "Error al registrar el difunto en la base de datos.",
    };
  }
}

// 3. Actualizar Difunto en PostgreSQL y limpiar imagen anterior en R2
export async function updateDifuntoAction({
  id,
  slug,
  nombre,
  apellido,
  biografia,
  fechaNacimiento,
  fechaFallecimiento,
  fotoUrl,
  requiereModeracion,
  sucursalId, // <-- NUEVO: Permitir cambiar de sucursal si el Admin General lo requiere
}: {
  id: string;
  slug: string;
  nombre: string;
  apellido: string;
  biografia?: string;
  fechaNacimiento?: string;
  fechaFallecimiento: string;
  fotoUrl?: string;
  requiereModeracion: boolean;
  sucursalId?: string; // <-- Opcional en update
}) {
  try {
    // 1. Buscamos el registro actual del difunto
    const difuntoActual = await prisma.difunto.findUnique({
      where: { id },
      select: { fotoPerfilUrl: true, funerariaId: true },
    });

    if (!difuntoActual) {
      return { success: false, error: "Difunto no encontrado." };
    }

    const dataToUpdate: any = {
      nombre,
      apellido,
      biografia: biografia || null,
      fechaNacimiento: parseLocalDate(fechaNacimiento),
      fechaFallecimiento: parseLocalDate(fechaFallecimiento) || new Date(),
      requiereModeracion,
    };

    // Si se pasa un nuevo sucursalId, validamos que pertenezca a la misma funeraria
    if (sucursalId) {
      const sucursalValida = await prisma.sucursal.findFirst({
        where: { id: sucursalId, funerariaId: difuntoActual.funerariaId },
      });
      if (sucursalValida) {
        dataToUpdate.sucursalId = sucursalId;
      }
    }

    // 2. Si se está enviando una nueva foto URL
    if (fotoUrl) {
      dataToUpdate.fotoPerfilUrl = fotoUrl;

      // Si el difunto tenía una foto anterior y es DIFERENTE a la nueva
      if (difuntoActual?.fotoPerfilUrl && difuntoActual.fotoPerfilUrl !== fotoUrl) {
        try {
          const baseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(/\/$/, "");
          
          if (difuntoActual.fotoPerfilUrl.startsWith(baseUrl)) {
            const oldKey = difuntoActual.fotoPerfilUrl.replace(`${baseUrl}/`, "");

            await r2Client.send(
              new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: oldKey,
              })
            );
          }
        } catch (r2Error) {
          console.error("No se pudo eliminar la imagen anterior de R2:", r2Error);
        }
      }
    }

    const difunto = await prisma.difunto.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath(`/admin/${slug}`);
    return { success: true, difunto };
  } catch (error: any) {
    console.error("Error al actualizar difunto:", error);
    return {
      success: false,
      error: error.message || "Error al actualizar la información del difunto.",
    };
  }
}

// 4. Eliminar Difunto
export async function eliminarDifunto(difuntoId: string) {
  try {
    await prisma.$transaction([
      // 1. Cambiar el estado del difunto a ELIMINADO
      prisma.difunto.update({
        where: { id: difuntoId },
        data: { estado: 'ELIMINADO' },
      }),

      // 2. Actualizar las condolencias asociadas
      prisma.condolencia.updateMany({
        where: { difuntoId: difuntoId },
        data: { 
          estado: 'ELIMINADO',
        },
      }),
    ]);

    return { success: true };
  } catch (err: any) {
    console.error('❌ ERROR AL ELIMINAR DIFUNTO Y CONDOLENCIAS:', err);
    return { success: false, error: err.message || 'No se pudo completar la eliminación.' };
  }
}

// 5. Moderar Condolencia (Aprobar, Rechazar u Ocultar)
export async function moderarCondolenciaAction({
  condolenciaId,
  estado,
  slug,
}: {
  condolenciaId: string;
  estado: "APROBADO" | "RECHAZADO" | "PENDIENTE";
  slug: string;
}) {
  try {
    const condolencia = await prisma.condolencia.update({
      where: { id: condolenciaId },
      data: { estado },
    });

    revalidatePath(`/admin/${slug}`);
    return { success: true, condolencia };
  } catch (error: any) {
    console.error("Error al moderar condolencia:", error);
    return {
      success: false,
      error: error.message || "No se pudo actualizar el estado de la condolencia.",
    };
  }
}