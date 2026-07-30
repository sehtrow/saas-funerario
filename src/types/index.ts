export interface DifuntoPublico {
  id: string;
  nombre: string;
  apellido: string;
  fotoPerfilUrl?: string | null;
  requiereModeracion: boolean; // <--- Añadido aquí porque ya está en el modelo Difunto de Prisma
  funeraria: {
    id: string;
    slug: string;
    nombre: string;
    requiereModeracion: boolean; // <--- También presente en Funeraria
  };
}