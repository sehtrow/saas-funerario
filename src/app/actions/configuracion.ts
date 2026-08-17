"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
// Opcional: Si usas autenticación (ej. NextAuth / Auth.js / Supabase Auth)
// import { auth } from "@/auth"; 

interface ActualizarConfiguracionParams {
  slug: string;
  nombre: string;
  tiempoRotacionTv: number;
  mensajeInstitucional?: string;
  requiereModeracion: boolean;
  logoUrl?: string;
}

export async function actualizarConfiguracionAction(data: ActualizarConfiguracionParams) {
  try {
    /* 1. SEGURIDAD (Recomendado): Verifica que el usuario actual tenga permisos 
      sobre esta funeraria antes de actualizar.
    */
    // const session = await auth();
    // if (!session || session.user.funerariaSlug !== data.slug) {
    //   return { success: false, error: "No autorizado." };
    // }

    // 2. Validación de campos críticos (ej. tiempo de rotación mínimo)
    if (data.tiempoRotacionTv < 5) {
      return { success: false, error: "El tiempo de rotación en TV debe ser de al menos 5 segundos." };
    }

    const funerariaExistente = await prisma.funeraria.findUnique({
      where: { slug: data.slug },
      select: { id: true }, // Optimizamos seleccionando solo el ID
    });

    if (!funerariaExistente) {
      return { success: false, error: "La funeraria no existe." };
    }

    await prisma.funeraria.update({
      where: { slug: data.slug },
      data: {
        nombre: data.nombre.trim(), // Limpiamos espacios innecesarios
        tiempoRotacionTv: Number(data.tiempoRotacionTv),
        mensajeInstitucional: data.mensajeInstitucional?.trim() || null,
        requiereModeracion: data.requiereModeracion,
        logoUrl: data.logoUrl || null,
      },
    });

    // Revalidar las rutas afectadas para refrescar los datos en el cliente
    revalidatePath(`/admin/${data.slug}/configuracion`);
    revalidatePath(`/admin/${data.slug}`);
    revalidatePath(`/muro/${data.slug}`); // Si la pantalla en vivo usa esta configuración

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    return { success: false, error: "Ocurrió un error al guardar los cambios." };
  }
}