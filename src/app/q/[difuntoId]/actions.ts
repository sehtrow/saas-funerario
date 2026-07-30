"use server";

import { prisma } from "@/lib/db/prisma";
import { EstadoCondolencia } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function enviarCondolenciaAction(formData: FormData) {
  try {
    const difuntoId = formData.get("difuntoId") as string;
    const nombreAutor = formData.get("nombreAutor") as string;
    const mensaje = formData.get("mensaje") as string;

    if (!difuntoId || !nombreAutor || !mensaje) {
      return { success: false, error: "Faltan campos obligatorios" };
    }

    // 1. Consultamos si este difunto específico requiere moderación y su funerariaId
    const difunto = await prisma.difunto.findUnique({
      where: { id: difuntoId },
      select: { 
        requiereModeracion: true, 
        funerariaId: true 
      },
    });

    if (!difunto) {
      return { success: false, error: "Servicio no encontrado" };
    }

    // 2. Definimos dinámicamente si se aprueba de una vez o entra a revisión
    const estadoInicial = difunto.requiereModeracion 
      ? EstadoCondolencia.PENDIENTE 
      : EstadoCondolencia.APROBADO;

    // 3. Creamos la condolencia en la base de datos
    await prisma.condolencia.create({
      data: {
        difuntoId,
        funerariaId: difunto.funerariaId,
        nombreAutor: nombreAutor.trim(),
        mensaje: mensaje.trim(),
        estado: estadoInicial, // <--- Aquí aplica la regla del switch por difunto
      },
    });

    // Revalidamos la pantalla en vivo y la página pública para reflejar el mensaje si fue aprobado directo
    revalidatePath(`/live/${difuntoId}`);
    revalidatePath(`/q/${difuntoId}`);

    return { success: true };
  } catch (error) {
    console.error("Error al enviar condolencia:", error);
    return { success: false, error: "Error al registrar la condolencia" };
  }
}