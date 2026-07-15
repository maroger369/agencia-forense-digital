import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashSync } from "bcryptjs";

const url = process.env.DATABASE_URL || "file:./dev.db";

async function main() {
  const adapter = new PrismaBetterSqlite3({ url });
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Iniciando seed de la base de datos...");
  console.log(`📁 Base de datos: ${url}`);

  // Crear usuario administrador
  const adminPassword = hashSync("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@forense.bo" },
    create: {
      email: "admin@forense.bo",
      password: adminPassword,
      name: "Admin Principal",
      ci: "12345678",
      phone: "+591 71234567",
      role: "ADMIN",
    },
    update: {},
  });
  console.log(`✅ Admin creado: ${admin.email} (${admin.role})`);

  // Crear usuario revisor
  const revisorPassword = hashSync("revisor123", 12);
  const revisor = await prisma.user.upsert({
    where: { email: "revisor@forense.bo" },
    create: {
      email: "revisor@forense.bo",
      password: revisorPassword,
      name: "Revisor Técnico",
      ci: "87654321",
      phone: "+591 71234568",
      role: "REVISOR",
    },
    update: {},
  });
  console.log(`✅ Revisor creado: ${revisor.email} (${revisor.role})`);

  // Crear usuario cliente de prueba
  const clientePassword = hashSync("cliente123", 12);
  const cliente = await prisma.user.upsert({
    where: { email: "cliente@test.bo" },
    create: {
      email: "cliente@test.bo",
      password: clientePassword,
      name: "Cliente de Prueba",
      ci: "11223344",
      phone: "+591 71234569",
      role: "CLIENTE",
    },
    update: {},
  });
  console.log(`✅ Cliente creado: ${cliente.email} (${cliente.role})`);

  console.log("\n📋 Credenciales de prueba:");
  console.log("   ┌─────────────────────┬──────────────────────────┐");
  console.log("   │ Admin               │ admin@forense.bo / admin123 │");
  console.log("   │ Revisor             │ revisor@forense.bo / revisor123 │");
  console.log("   │ Cliente             │ cliente@test.bo / cliente123 │");
  console.log("   └─────────────────────┴──────────────────────────┘");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error en seed:", e);
  process.exit(1);
});
