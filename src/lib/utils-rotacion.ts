// lib/utils-rotacion.ts
import { TiempoRotacion } from '@prisma/client';

export function obtenerMilisegundosRotacion(tiempo: TiempoRotacion | null | undefined): number {
  switch (tiempo) {
    case TiempoRotacion.CINCO_SEG:
      return 5000;
    case TiempoRotacion.QUINCE_SEG:
      return 15000;
    case TiempoRotacion.DIEZ_SEG:
    default:
      return 10000;
  }
}