"use server";

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

interface LoginParams {
  email: string;
  password: string;
}

export async function loginAction({ email, password }: LoginParams) {
  try {
    // 1. Buscar el usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { funeraria: true }, // Incluimos la relación para saber su funeraria y slug
    });

    if (!usuario || !usuario.activo) {
      return { success: false, error: "Credenciales inválidas o cuenta inactiva." };
    }

    // 2. Verificar que el usuario tenga una funeraria asignada
    if (!usuario.funeraria || !usuario.funeraria.slug) {
      return { success: false, error: "El usuario no está asociado a ninguna funeraria." };
    }

    // 3. Validar la contraseña
    const passwordMatch = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordMatch) {
      return { success: false, error: "Contraseña incorrecta." };
    }

    const slug = usuario.funeraria.slug;

    // 4. Crear la cookie de sesión segura para esa funeraria
    const cookieStore = await cookies();
    cookieStore.set(`session_${slug}`, usuario.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: `/admin/${slug}`,
    });

    // 5. Retornar éxito y el slug para que el cliente haga la redirección correcta
    return { success: true, slug };
  } catch (error) {
    console.error("Error en login:", error);
    return { success: false, error: "Ocurrió un error al iniciar sesión." };
  }
}