'use server';

import { prisma } from '@/lib/db/prisma';
import { EstadoCondolencia } from '@prisma/client';

export interface CrearCondolenciaInput {
  funerariaId: string;
  difuntoId: string;
  nombreAutor: string;
  parentesco?: string;
  mensaje: string;
}

export async function enviarCondolencia(data: CrearCondolenciaInput) {
  // AGREGA ESTOS LOGS PARA VER SI LLEGA EL CLICK DESDE EL CELULAR
  console.log('====================================');
  console.log('>>> EJECUTANDO SERVER ACTION DESDE EL CELULAR <<<');
  console.log('Payload:', JSON.stringify(data, null, 2));
  console.log('====================================');

  try {
    if (!data.nombreAutor || !data.mensaje) {
      console.log('⚠️ Error: Faltan datos requeridos.');
      return { success: false, error: 'Por favor completa los campos requeridos.' };
    }

    const nueva = await prisma.condolencia.create({
      data: {
        funerariaId: data.funerariaId,
        difuntoId: data.difuntoId,
        nombreAutor: data.nombreAutor.trim(),
        parentesco: data.parentesco ? data.parentesco.trim() : null,
        mensaje: data.mensaje.trim(),
        estado: EstadoCondolencia.PENDIENTE,
      },
    });

    console.log('✅ INSERTADO CON ÉXITO EN DB. ID:', nueva.id);
    return { success: true, data: nueva };
  } catch (err: any) {
    console.error('❌ ERROR AL INSERTAR EN DATABASE:', err);
    return { success: false, error: err.message || 'Error interno de base de datos.' };
  }
}