"use server";

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { signToken } from "@/lib/jwt";

interface LoginParams {
  email: string;
  password: string;
}

export async function loginAction({ email, password }: LoginParams) {
  try {
    // 1. Buscar el usuario por email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { funeraria: true },
    });

    if (!usuario || !usuario.activo) {
      return { success: false, error: "Credenciales inválidas o cuenta inactiva." };
    }

    // 2. Validar la contraseña
    const passwordMatch = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordMatch) {
      return { success: false, error: "Contraseña incorrecta." };
    }

    // 3. Validaciones de acceso según el rol
    if (usuario.rol !== "SUPERADMIN") {
      if (!usuario.funeraria || !usuario.funeraria.slug) {
        return { success: false, error: "El usuario no está asociado a ninguna funeraria." };
      }
    }

    // 4. Crear el JWT con la información del usuario
    const token = await signToken({
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      funerariaId: usuario.funerariaId,
      debeCambiarPassword: usuario.debeCambiarPassword,
    });

    // 5. Guardar el token en una Cookie segura global para la aplicación
    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    });

    // 6. Determinar la ruta de redirección según el rol
    let redirectTo = "/login";
    if (usuario.rol === "SUPERADMIN") {
      redirectTo = "/superadmin/metricas";
    } else if (usuario.funeraria?.slug) {
      redirectTo = `/admin/${usuario.funeraria.slug}`;
    }

    return { success: true, redirectTo };
  } catch (error: any) {
    // 🔍 AQUÍ VEREMOS EL ERROR REAL EN LA CONSOLA DE TU TERMINAL
    console.error("❌ DETALLE EXPLICITO EN LOGIN:", error);
    return { 
      success: false, 
      error: `Error técnico: ${error?.message || "Ocurrió un error desconocido al iniciar sesión."}` 
    };
  }
}