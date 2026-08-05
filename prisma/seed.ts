import { prisma } from "../src/lib/db/prisma"; // <-- Importa tu cliente configurado
import bcrypt from "bcryptjs";

async function main() {
  const emailAdmin = "admin@memoriadigital.cl";
  const passwordTemporal = "Admin123*";

  // Verificar si el usuario admin ya existe
  const adminExistente = await prisma.usuario.findUnique({
    where: { email: emailAdmin },
  });

  if (adminExistente) {
    console.log("⚠️ El usuario administrador ya existe en la base de datos.");
    return;
  }

  // Encriptar la contraseña
  const passwordHash = await bcrypt.hash(passwordTemporal, 10);

  // Crear el Superadmin
  const nuevoAdmin = await prisma.usuario.create({
    data: {
      nombre: "Super Administrador",
      email: emailAdmin,
      passwordHash,
      rol: "SUPERADMIN",
      activo: true,
      debeCambiarPassword: true,
    },
  });

  console.log("✅ Usuario Administrador creado exitosamente:");
  console.log(`- Email: ${nuevoAdmin.email}`);
  console.log(`- Contraseña temporal: ${passwordTemporal}`);
}

main()
  .catch((e) => {
    console.error("❌ Error al ejecutar el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });