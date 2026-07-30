"use server";

import { prisma } from "@/lib/db/prisma";
import { r2Client } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { revalidatePath } from "next/cache";

// Helper para evitar el desfase de zona horaria (UTC vs Local) en inputs "YYYY-MM-DD"
function parseLocalDate(dateString?: string) {
  if (!dateString) return null;
  return new Date(`${dateString}T12:00:00`);
}

// 1. Obtener Presigned URL para R2
export async function getPresignedUrlAction(fileName: string, fileType: string) {
  try {
    const extension = fileName.split(".").pop();
    const key = `difuntos/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 360 });
    const baseUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
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

// 2. Crear Difunto en PostgreSQL
export async function createDifuntoAction({
  nombre,
  apellido,
  biografia,
  fechaNacimiento,
  fechaFallecimiento,
  fotoUrl,
  requiereModeracion,
  slug,
}: {
  nombre: string;
  apellido: string;
  biografia?: string;
  fechaNacimiento?: string;
  fechaFallecimiento: string;
  fotoUrl?: string;
  requiereModeracion?: boolean;
  slug: string;
}) {
  try {
    const funeraria = await prisma.funeraria.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!funeraria) {
      return { success: false, error: "Funeraria no encontrada." };
    }

    const difunto = await prisma.difunto.create({
      data: {
        funerariaId: funeraria.id,
        nombre,
        apellido,
        biografia: biografia || null,
        fechaNacimiento: parseLocalDate(fechaNacimiento),
        fechaFallecimiento: parseLocalDate(fechaFallecimiento) || new Date(),
        fotoPerfilUrl: fotoUrl || null, // FIX: Corregido de fotoUrl a fotoPerfilUrl
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

// 3. Actualizar Difunto en PostgreSQL
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
}) {
  try {
    const dataToUpdate: Record<string, any> = {
      nombre,
      apellido,
      biografia: biografia || null,
      fechaNacimiento: parseLocalDate(fechaNacimiento),
      fechaFallecimiento: parseLocalDate(fechaFallecimiento) || new Date(),
      requiereModeracion,
    };

    if (fotoUrl) {
      dataToUpdate.fotoPerfilUrl = fotoUrl;
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
export async function deleteDifuntoAction(id: string, slug: string) {
  try {
    await prisma.difunto.delete({
      where: { id },
    });

    revalidatePath(`/admin/${slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar difunto:", error);
    return {
      success: false,
      error: error.message || "No se pudo eliminar el registro del difunto.",
    };
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