// src/lib/db/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. Crear el pool de conexiones con la URL de Supabase desde el .env
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Inicializar el adaptador de Prisma para PostgreSQL
const adapter = new PrismaPg(pool);

// 3. Extender la variable global para evitar múltiples conexiones en desarrollo (Next.js Hot Reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;