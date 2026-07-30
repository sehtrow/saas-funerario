"use server";

import { prisma } from "@/lib/db/prisma"; // <--- Asegúrate de que esta línea esté presente
import { revalidatePath } from "next/cache";

interface ActualizarConfiguracionParams {
  slug: string;
  nombre: string;
  tiempoRotacionTv: number;
  mensajeInstitucional?: string;
  moderacionPorDefecto: boolean;
  logoUrl?: string;
}

export async function actualizarConfiguracionAction(data: ActualizarConfiguracionParams) {
  try {
    const funerariaExistente = await prisma.funeraria.findUnique({
      where: { slug: data.slug },
    });

    if (!funerariaExistente) {
      return { success: false, error: "La funeraria no existe." };
    }

    await prisma.funeraria.update({
      where: { slug: data.slug },
      data: {
        nombre: data.nombre,
        tiempoRotacionTv: Number(data.tiempoRotacionTv),
        mensajeInstitucional: data.mensajeInstitucional || null,
        moderacionPorDefecto: data.moderacionPorDefecto,
        logoUrl: data.logoUrl || null,
      },
    });

    revalidatePath(`/admin/${data.slug}/configuracion`);
    revalidatePath(`/admin/${data.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    return { success: false, error: "Ocurrió un error al guardar los cambios." };
  }
}