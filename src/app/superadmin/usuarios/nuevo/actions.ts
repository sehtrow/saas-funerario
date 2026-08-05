"use server";

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RolUsuario } from "@prisma/client"; // Asegúrate de importar el enum si Prisma lo genera así

export async function crearUsuarioAction(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rol = formData.get("rol") as string;
  const funerariaId = formData.get("funerariaId") as string;

  if (!email || !password || !rol) {
    throw new Error("Faltan campos obligatorios por completar.");
  }

  // Verificar si el correo ya está registrado
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email },
  });

  if (usuarioExistente) {
    throw new Error("Ya existe un usuario registrado con este correo electrónico.");
  }

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el usuario en la base de datos usando passwordHash
  await prisma.usuario.create({
    data: {
      nombre,
      email,
      passwordHash: hashedPassword, // <--- Cambiado de password a passwordHash
      rol: rol as RolUsuario, 
      funerariaId: rol === "SUPERADMIN" || !funerariaId || funerariaId === "none" ? null : funerariaId,
      debeCambiarPassword: true,
    },
  });

  revalidatePath("/superadmin/usuarios");
  redirect("/superadmin/usuarios");
}

export async function cambiarPasswordObligatorioAction(userId: string, formData: FormData) {
  const nuevaPassword = formData.get("nuevaPassword") as string;
  const confirmarPassword = formData.get("confirmarPassword") as string;

  if (!nuevaPassword || nuevaPassword.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  if (nuevaPassword !== confirmarPassword) {
    throw new Error("Las contraseñas no coinciden.");
  }

  // Encriptar la nueva contraseña
  const passwordHash = await bcrypt.hash(nuevaPassword, 10);

  // Actualizar la base de datos
  await prisma.usuario.update({
    where: { id: userId },
    data: {
      passwordHash, // Coincide con passwordHash de la creación
      debeCambiarPassword: false,
    },
  });

  revalidatePath("/", "layout");
}

