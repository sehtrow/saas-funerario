import { prisma } from '@/lib/prisma';
import TablaCondolencias from './TablaCondolencias';

export default async function PaginaModeracion() {
  // Asumiendo la funeraria actual del contexto o primera funeraria
  const funeraria = await prisma.funeraria.findFirst({
    select: {
      id: true,
      requiereModeracion: true,
    },
  });

  if (!funeraria) {
    return <div className="p-8">No se encontró la configuración de la funeraria.</div>;
  }

  const condolencias = await prisma.condolencia.findMany({
    orderBy: [
      { estado: 'asc' },
      { createdAt: 'desc' },
    ],
    include: {
      difunto: {
        select: {
          id: true,
          nombre: true,
          funeraria: {
            select: {
              id: true,
              slug: true,
              nombre: true,
              requiereModeracion: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Moderación de Condolencias
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestiona los mensajes recibidos y configura la política de aprobación.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-amber-100 text-amber-800 font-medium px-3 py-1 rounded-full">
            {condolencias.filter((c) => c.estado === 'PENDIENTE').length} Pendientes
          </span>
        </div>
      </div>

      <TablaCondolencias
        condolencias={condolencias}
        funeraria={funeraria}
      />
    </div>
  );
}