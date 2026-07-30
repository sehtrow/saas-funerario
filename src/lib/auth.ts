import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';

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