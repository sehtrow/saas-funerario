// src/app/api/condolencias/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { EstadoCondolencia } from '@prisma/client';
import { pusherServer } from '@/lib/pusher/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { funerariaId, difuntoId, nombreAutor, parentesco, mensaje } = body;

    // Validar campos requeridos
    if (!nombreAutor || !mensaje || !funerariaId || !difuntoId) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos faltantes.' },
        { status: 400 }
      );
    }

    // 1. Guardar en la base de datos
    const nuevaCondolencia = await prisma.condolencia.create({
      data: {
        funerariaId,
        difuntoId,
        nombreAutor: nombreAutor.trim(),
        parentesco: parentesco ? parentesco.trim() : null,
        mensaje: mensaje.trim(),
        estado: EstadoCondolencia.PENDIENTE,
      },
      include: {
        difunto: {
          select: { nombre: true, apellido: true },
        },
      },
    });

    // 2. Emitir evento por WebSocket al canal del difunto
    try {
      await pusherServer.trigger(
        `difunto-${difuntoId}`,
        'condolencia:creada',
        {
          id: nuevaCondolencia.id,
          nombreAutor: nuevaCondolencia.nombreAutor,
          parentesco: nuevaCondolencia.parentesco,
          mensaje: nuevaCondolencia.mensaje,
          estado: nuevaCondolencia.estado,
          creadoEn: nuevaCondolencia.creadoEn || (nuevaCondolencia as any).createdAt,
          difuntoId: nuevaCondolencia.difuntoId,
        }
      );
    } catch (pusherError) {
      // Log del error sin interrumpir el flujo si falla Pusher
      console.error('Error al emitir evento Pusher:', pusherError);
    }

    return NextResponse.json({ success: true, data: nuevaCondolencia });
  } catch (error: any) {
    console.error('Error al procesar condolencia:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}