import { prisma } from "@/lib/db/prisma";
import SuperAdminPagosClient from "./SuperAdminPagosClient";

export default async function SuperAdminPagosPage() {
  const funerarias = await prisma.funeraria.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      pagos: {
        orderBy: { creadoEn: "desc" },
      },
    },
  });

  const todosLosPagos = await prisma.pagoFuneraria.findMany({
    orderBy: { creadoEn: "desc" },
  });

  // --- CÁLCULO DE MÉTRICAS GLOBALES ---
  const ingresoTotalGlobal = todosLosPagos.reduce((acc, pago) => acc + pago.monto, 0);
  const totalTransacciones = todosLosPagos.length;
  
  const funerariasAlDia = funerarias.filter(f => f.activo).length;
  const funerariasEnMora = funerarias.filter(f => !f.activo).length;
  const totalFunerarias = funerarias.length;

  const ticketPromedio = totalTransacciones > 0 ? Math.round(ingresoTotalGlobal / totalTransacciones) : 0;

  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const anioActual = fechaActual.getFullYear();

  const ingresosMesActual = todosLosPagos
    .filter(p => {
      const fechaPago = new Date(p.creadoEn);
      return fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === anioActual;
    })
    .reduce((acc, p) => acc + p.monto, 0);

  const funerariasActivas = funerarias.filter(f => f.activo);
  const mrrEstimado = funerariasActivas.length * 14990;

  const metricasGlobales = {
    ingresoTotalGlobal,
    funerariasAlDia,
    funerariasEnMora,
    totalFunerarias,
    totalTransacciones,
    ticketPromedio,
    ingresosMesActual,
    mrrEstimado,
  };

  return (
    <SuperAdminPagosClient
      funerarias={funerarias}
      metricas={metricasGlobales}
    />
  );
}