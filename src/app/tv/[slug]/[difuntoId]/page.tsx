import { obtenerDatosPantalla } from '@/app/actions/pantalla';
import PantallaTvClient from './PantallaTVCliente';
import { notFound } from 'next/navigation';

export const revalidate = 10;

export default async function PaginaTv({
  params,
}: {
  params: Promise<{ slug: string; difuntoId: string }>;
}) {
  const { slug, difuntoId } = await params;
  const difunto = await obtenerDatosPantalla(slug, difuntoId);

  if (!difunto) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const urlPublicaCondolencias = `${baseUrl}/condolencias/${slug}/${difunto.id}`;

  return (
    <PantallaTvClient
      difuntoInicial={difunto}
      urlPublicaCondolencias={urlPublicaCondolencias}
    />
  );
}