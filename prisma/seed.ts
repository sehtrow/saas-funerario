import {
  PrismaClient,
  RolUsuario,
  EstadoDifunto,
  EstadoCondolencia,
  TiempoRotacion,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// 1. Obtener la URL de conexión
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no está configurada en las variables de entorno.');
}

// 2. Instanciar el Pool y el Adapter exigido por Prisma 7
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando la carga de datos de prueba (Seed)...');

  // Limpieza previa respetando claves foráneas
  await prisma.configuracionPantalla.deleteMany();
  await prisma.condolencia.deleteMany();
  await prisma.difunto.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.funeraria.deleteMany();

  // 1. Funeraria de prueba
  const funeraria = await prisma.funeraria.create({
    data: {
      nombre: 'Funeraria San José',
      slug: 'san-jose',
      requiereModeracion: true,
      colorPrimario: '#1e293b',
      activo: true,
    },
  });

  // 2. Usuarios
  await prisma.usuario.createMany({
    data: [
      {
        nombre: 'Administrador General',
        email: 'admin@sistema.com',
        passwordHash: '$2a$12$e8Gv2Z...hash_de_prueba',
        rol: RolUsuario.SUPERADMIN,
      },
      {
        nombre: 'Carlos Gestor',
        email: 'carlos@funerariasanjose.cl',
        passwordHash: '$2a$12$e8Gv2Z...hash_de_prueba',
        rol: RolUsuario.ADMIN_FUNERARIA,
        funerariaId: funeraria.id,
      },
    ],
  });

  // 3. Difunto
  const difunto = await prisma.difunto.create({
    data: {
      funerariaId: funeraria.id,
      nombre: 'Roberto',
      apellido: 'González Morales',
      fechaNacimiento: new Date('1954-08-12'),
      fechaFallecimiento: new Date('2026-03-18'),
      biografia: 'Esposo ejemplar, padre amoroso y vecino querido de la comunidad.',
      estado: EstadoDifunto.ACTIVO,
    },
  });

  // 4. Configuración Pantalla TV
  await prisma.configuracionPantalla.create({
    data: {
      difuntoId: difunto.id,
      tiempoRotacion: TiempoRotacion.DIEZ_SEG,
      mostrarFotos: true,
      mensajeBienvenida: 'En cariñoso recuerdo de nuestro amado Roberto',
    },
  });

  // 5. Condolencias
  await prisma.condolencia.createMany({
    data: [
      {
        funerariaId: funeraria.id,
        difuntoId: difunto.id,
        nombreAutor: 'Familia Morales Sepúlveda',
        parentesco: 'Primos',
        mensaje: 'Acompañamos a la familia en este momento de dolor. Un abrazo fraterno.',
        estado: EstadoCondolencia.APROBADO,
      },
      {
        funerariaId: funeraria.id,
        difuntoId: difunto.id,
        nombreAutor: 'Ana María Silva',
        parentesco: 'Amiga de la infancia',
        mensaje: 'Siempre recordaremos a Roberto por su infinita bondad. Descansa en paz.',
        estado: EstadoCondolencia.APROBADO,
      },
      {
        funerariaId: funeraria.id,
        difuntoId: difunto.id,
        nombreAutor: 'Jorge Contreras',
        parentesco: 'Excolega de trabajo',
        mensaje: 'Un honor haber compartido años de trabajo con una persona tan íntegra.',
        estado: EstadoCondolencia.PENDIENTE,
      },
    ],
  });

  console.log('🎉 Seed ejecutado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Cerramos la conexión del pool al finalizar
  });