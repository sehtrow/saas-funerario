// src/app/actions/limpieza.ts
'use server';

import { prisma } from '@/lib/db/prisma';
import { EstadoCondolencia } from '@prisma/client';
// Importa tu helper de autenticación (ej: NextAuth, SupabaseAuth, Clerk, etc.)
import { obtenerSesionServidor } from '@/lib/auth'; 

export async function purgarCondolenciasRechazadas() {
  try {
    // 1. Validar autenticación y rol de SuperAdmin
    const session = await obtenerSesionServidor();

    if (!session || session.user?.rol !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'No tienes permisos de SuperAdministrador para realizar esta acción.',
      };
    }

    // 2. Ejecutar la purga de registros de más de 1 año
    const unAnoAtras = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    const resultado = await prisma.condolencia.deleteMany({
      where: {
        estado: EstadoCondolencia.RECHAZADO,
        creadoEn: {
          lt: unAnoAtras,
        },
      },
    });

    return {
      success: true,
      count: resultado.count,
    };
  } catch (error) {
    console.error('Error al purgar registros:', error);
    return {
      success: false,
      error: 'Error interno al intentar depurar la base de datos.',
    };
  }
}