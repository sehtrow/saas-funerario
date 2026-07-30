// src/app/admin/[slug]/moderacion/difunto/[difuntoId]/page.tsx
import { obtenerCondolenciasParaModeracion } from '@/app/actions/moderacion';
import { notFound } from 'next/navigation';
import PanelModeracionClient from './PanelModeracionClient';

export default async function PaginaModeracion({
  params,
}: {
  params: Promise<{ slug: string; difuntoId: string }>;
}) {
  const { slug, difuntoId } = await params;
  const difunto = await obtenerCondolenciasParaModeracion(slug, difuntoId);

  if (!difunto) {
    notFound();
  }

  return <PanelModeracionClient difuntoInicial={difunto} />;
}