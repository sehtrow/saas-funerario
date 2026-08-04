import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import FormularioCondolencia from './FormularioCondolencia'; // O la ruta correcta a tu componente

interface PageProps {
  params: Promise<{
    slug: string;
    difuntoId: string;
  }>;
}

export default async function PaginaDifunto({ params }: PageProps) {
  const { slug, difuntoId } = await params;

  // Consulta del difunto con su funeraria y condolencias aprobadas
  const difunto = await prisma.difunto.findFirst({
    where: {
      id: difuntoId,
      funeraria: {
        slug: slug,
      },
    },
    include: {
      funeraria: true,
      condolencias: {
        where: { estado: 'APROBADO' },
        orderBy: { creadoEn: 'desc' },
      },
    },
  });

  if (!difunto) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Encabezado Funeraria */}
      <header className="bg-white border-b border-slate-200 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-serif text-slate-700">{difunto.funeraria.nombre}</h2>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Tarjeta Principal del Difunto */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 text-center md:text-left md:flex md:items-center md:gap-8">
          <div className="w-40 h-40 mx-auto md:mx-0 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border-4 border-slate-100 shadow-inner">
            {difunto.fotoPerfilUrl ? (
              <img
                src={difunto.fotoPerfilUrl}
                alt={difunto.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-slate-400">
                🕊️
              </div>
            )}
          </div>

          <div className="mt-4 md:mt-0 flex-1">
            <h1 className="text-3xl font-serif text-slate-900 font-bold">{difunto.nombre} {difunto.apellido}</h1>
            <p className="text-slate-500 mt-1">
              {difunto.fechaNacimiento
                ? new Date(difunto.fechaNacimiento).toLocaleDateString('es-CL')
                : ''}{' '}
              - {new Date(difunto.fechaFallecimiento).toLocaleDateString('es-CL')}
            </p>

            {difunto.biografia && (
              <p className="mt-4 text-slate-600 leading-relaxed italic">
                "{difunto.biografia}"
              </p>
            )}

            {/* Acciones Rápidas */}
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
              <a
                href={`/api/difuntos/${difunto.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
              >
                📄 Descargar Álbum en PDF
              </a>
            </div>
          </div>
        </div>

        {/* Formulario para Enviar Condolencia */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-serif font-bold text-slate-900 mb-4">
            Dejar una Condolencia
          </h2>
          <FormularioCondolencia difunto={difunto} slug={slug} />
        </div>

        {/* Lista de Condolencias Aprobadas */}
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Mensajes de Apoyo ({difunto.condolencias.length})
          </h2>

          {difunto.condolencias.length === 0 ? (
            <p className="text-slate-500 italic bg-white p-6 rounded-xl shadow-sm text-center">
              Sé el primero en enviar un mensaje de apoyo a la familia.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {difunto.condolencias.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-slate-800">{c.nombreAutor}</span>
                    {c.parentesco && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {c.parentesco}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{c.mensaje}</p>
                  <span className="text-xs text-slate-400 block pt-1">
                    {new Date(c.creadoEn).toLocaleDateString('es-CL')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}