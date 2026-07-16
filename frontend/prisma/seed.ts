import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { hashSync } from "bcryptjs";

const url = (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db") as string;
const authToken = process.env.TURSO_AUTH_TOKEN;

async function main() {
  const adapter = new PrismaLibSql({ url, authToken });
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Iniciando seed de la base de datos...");

  // Limpiar base de datos para evitar conflictos de unicidad (ej. CI duplicado)
  await prisma.certificate.deleteMany({});
  await prisma.analysisResult.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.user.deleteMany({});

  // Crear usuario administrador/perito
  const adminPassword = hashSync("123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "rcondori@demo.bo" },
    create: {
      email: "rcondori@demo.bo",
      password: adminPassword,
      name: "Lic. R. Condori",
      ci: "12345678",
      phone: "+591 71234567",
      role: "ADMIN",
    },
    update: { password: adminPassword },
  });
  console.log(`✅ Admin/Perito creado: ${admin.email}`);

  // Crear usuario cliente
  const clientePassword = hashSync("123456", 12);
  const cliente = await prisma.user.upsert({
    where: { email: "cliente@demo.bo" },
    create: {
      email: "cliente@demo.bo",
      password: clientePassword,
      name: "María Elena Quispe",
      ci: "4523891 CBBA",
      phone: "+591 71234569",
      role: "CLIENTE",
    },
    update: { password: clientePassword },
  });
  console.log(`✅ Cliente creado: ${cliente.email}`);

  // Limpiar evidencias anteriores (opcional, para no duplicar en desarrollo)
  await prisma.certificate.deleteMany({});
  await prisma.analysisResult.deleteMany({});
  await prisma.evidence.deleteMany({});

  // Evidencia 1: Pendiente de pago
  await prisma.evidence.create({
    data: {
      id: "AFD-2026-000412",
      userId: cliente.id,
      originalName: "foto_evidencia_01.jpg",
      imagePath: "/uploads/demo1.jpg", // Mock path
      status: "PENDIENTE",
      amount: 150.00,
      paymentVerified: false,
      createdAt: new Date("2026-07-09T10:00:00Z"),
    }
  });

  // Evidencia 2: En revisión (Pagado)
  await prisma.evidence.create({
    data: {
      id: "AFD-2026-000398",
      userId: cliente.id,
      originalName: "captura_chat.png",
      imagePath: "/uploads/demo2.png",
      status: "REVISANDO",
      amount: 150.00,
      paymentVerified: true,
      createdAt: new Date("2026-07-05T14:30:00Z"),
    }
  });

  // Evidencia 3: Terminada/Certificada
  const ev3 = await prisma.evidence.create({
    data: {
      id: "AFD-2026-000371",
      userId: cliente.id,
      originalName: "contrato_firmado.jpg",
      imagePath: "/uploads/demo3.jpg",
      status: "TERMINADO",
      amount: 150.00,
      paymentVerified: true,
      createdAt: new Date("2026-06-28T09:12:00Z"),
    }
  });

  // Agregar Análisis y Certificado a la Evidencia 3
  await prisma.analysisResult.create({
    data: {
      evidenceId: ev3.id,
      elaScore: 0.15,
      elaResult: "AUTENTICA",
      elaImagePath: "/temp/mock_ela.jpg",
      analyzedBy: admin.id,
      createdAt: new Date("2026-06-28T15:22:00Z"),
      forensicReport: JSON.stringify({ veredicto: "IMAGEN APARENTEMENTE AUTÉNTICA", nivelRiesgo: "BAJO" }),
    }
  });

  await prisma.certificate.create({
    data: {
      evidenceId: ev3.id,
      certificateHash: "a3f2c8b19d4e7f6201c89ab34d55e12f9c88b7a6d4e3f2019c8ab34d55e12f",
      qrCode: "data:image/png;base64,mockqr",
      generatedBy: admin.id,
      generatedAt: new Date("2026-06-28T15:45:00Z"),
    }
  });

  console.log("✅ Evidencias y certificados de prueba generados.");
  console.log("\n📋 Credenciales MVP:");
  console.log("   ┌─────────────────────┬──────────────────────────┐");
  console.log("   │ Cliente             │ cliente@demo.bo / 123456 │");
  console.log("   │ Agencia (Perito)    │ rcondori@demo.bo / 123456│");
  console.log("   └─────────────────────┴──────────────────────────┘");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error en seed:", e);
  process.exit(1);
});
