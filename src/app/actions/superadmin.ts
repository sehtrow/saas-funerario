'use server'

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Listar todas las funerarias
export async function obtenerFunerarias() {
  return await prisma.funeraria.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      _count: {
        select: { difuntos: true },
      },
    },
  });
}

// Crear una nueva funeraria
export async function crearFuneraria(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const slug = formData.get("slug") as string;
  const requiereModeracion = formData.get("requiereModeracion") === "on";

  if (!nombre || !slug) {
    throw new Error("El nombre y el slug son obligatorios");
  }

  try {
    await prisma.funeraria.create({
      data: {
        nombre,
        slug: slug.toLowerCase().trim().replace(/\s+/g, "-"),
        requiereModeracion,
        activo: true,
      },
    });

    revalidatePath("/superadmin/funerarias");
    return { success: true };
  } catch (error) {
    console.error("Error al crear funeraria:", error);
    return { success: false, error: "El slug ya está en uso o hubo un error." };
  }
}

export async function actualizarFuneraria(id: string, formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const slug = formData.get("slug") as string;
  const requiereModeracion = formData.get("requiereModeracion") === "on";
  const activo = formData.get("activo") === "on";

  if (!nombre || !slug) {
    throw new Error("El nombre y el slug son obligatorios.");
  }

  const slugLimpias = slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  try {
    await prisma.funeraria.update({
      where: { id },
      data: {
        nombre,
        slug: slugLimpias,
        requiereModeracion,
        activo,
      },
    });
  } catch (error) {
    console.error("Error al actualizar funeraria:", error);
    throw new Error("El slug ya está en uso por otra funeraria o ocurrió un error.");
  }

  revalidatePath("/superadmin/funerarias");
  redirect("/superadmin/funerarias");
}

export async function registrarPagoFuneraria(formData: FormData) {
  const funerariaId = formData.get("funerariaId") as string;
  const montoStr = formData.get("monto") as string;
  const metodo = formData.get("metodo") as string;
  const referencia = formData.get("referencia") as string;
  const observacion = formData.get("observacion") as string;

  if (!funerariaId || !montoStr || !metodo) {
    throw new Error("Faltan campos obligatorios para registrar el pago.");
  }

  const monto = parseFloat(montoStr);

  try {
    await prisma.pagoFuneraria.create({
      data: {
        funerariaId,
        monto,
        metodo,
        referencia: referencia || null,
        observacion: observacion || null,
        estado: "completado",
      },
    });

    // Opcional: Si registran un pago, nos aseguramos de que el tenant quede activo (por si estaba suspendido)
    await prisma.funeraria.update({
      where: { id: funerariaId },
      data: { activo: true },
    });

  } catch (error) {
    console.error("Error al registrar el pago:", error);
    throw new Error("No se pudo registrar el pago en la base de datos.");
  }

  revalidatePath("/superadmin/pagos");
  redirect("/superadmin/pagos");
}