const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" }); // Carga las variables de entorno

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const nombreFuneraria = "Funeraria Ejemplo";
  const slug = "funeraria-ejemplo";
  const emailAdmin = "admin@ejemplo.com";
  const passwordPlano = "123456";
  const nombreAdmin = "Administrador Principal";

  console.log("Generando hash de contraseña...");
  const passwordHash = await bcrypt.hash(passwordPlano, 10);

  console.log(`Creando o actualizando la funeraria: ${nombreFuneraria}...`);
  const funeraria = await prisma.funeraria.upsert({
    where: { slug },
    update: {},
    create: {
      nombre: nombreFuneraria,
      slug: slug,
      tiempoRotacionTv: 8,
      moderacionPorDefecto: true,
    },
  });

  console.log(`Creando o actualizando el usuario administrador (${emailAdmin})...`);
  await prisma.usuario.upsert({
    where: { email: emailAdmin },
    update: {
      passwordHash,
      funerariaId: funeraria.id,
    },
    create: {
      email: emailAdmin,
      passwordHash,
      nombre: nombreAdmin,
      rol: "ADMIN_FUNERARIA",
      funerariaId: funeraria.id,
      activo: true,
    },
  });

  console.log("\n¡Listo! Datos de acceso creados exitosamente:");
  console.log(`----------------------------------------`);
  console.log(`URL de Login: http://localhost:3000/admin/${slug}/login`);
  console.log(`Correo:       ${emailAdmin}`);
  console.log(`Contraseña:   ${passwordPlano}`);
  console.log(`----------------------------------------\n`);
}

main()
  .catch((e) => {
    console.error("Error al ejecutar el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });