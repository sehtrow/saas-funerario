import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { prisma } from "./db/prisma";

export async function obtenerSesionServidor() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Buscamos si existe alguna cookie que empiece con "session_"
    const sessionCookie = allCookies.find((cookie) => cookie.name.startsWith('session_'));

    if (!sessionCookie) {
      return null;
    }

    const userId = sessionCookie.value;

    if (!userId) {
      return null;
    }

    // Consultamos el usuario en la base de datos para obtener su rol y datos actualizados
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: { funeraria: true },
    });

    if (!usuario || !usuario.activo) {
      return null;
    }

    // Retornamos la estructura que tus Server Actions esperan
    return {
      user: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol, // Asegúrate de que tu modelo Prisma tenga el campo 'rol' (ej. ADMIN, SUPER_ADMIN)
        funerariaId: usuario.funerariaId,
        funeraria: usuario.funeraria,
      },
    };
  } catch (error) {
    console.error('Error al obtener la sesión del servidor:', error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) return null;

    // Verificar el JWT
    const payload = await verifyToken(token);
    if (!payload) return null;

    // Opcional pero recomendado: Consultar la BD para asegurar que el usuario sigue activo y con datos frescos
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        funerariaId: true,
        debeCambiarPassword: true,
        activo: true,
      },
    });

    if (!usuario || !usuario.activo) return null;

    return usuario;
  } catch (error) {
    return null;
  }
}