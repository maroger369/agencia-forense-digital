import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const evidence = await prisma.evidence.findUnique({ where: { id } });

    if (!evidence) {
      return NextResponse.json(
        { error: "Evidencia no encontrada" },
        { status: 404 }
      );
    }

    if (evidence.userId !== auth.userId) {
      return NextResponse.json(
        { error: "Esta evidencia no te pertenece" },
        { status: 403 }
      );
    }

    if (evidence.paymentVerified) {
      return NextResponse.json(
        { error: "El pago ya fue verificado" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const paymentFile = formData.get("paymentProof") as File;

    if (!paymentFile) {
      return NextResponse.json(
        { error: "Debes subir el comprobante de pago" },
        { status: 400 }
      );
    }

    // Guardar comprobante
    const paymentDir = path.join(
      process.cwd(),
      "public",
      "pagos",
      auth.userId
    );
    await mkdir(paymentDir, { recursive: true });

    const timestamp = Date.now();
    const fileName = `pago-${timestamp}-${paymentFile.name}`;
    const filePath = path.join(paymentDir, fileName);

    const bytes = await paymentFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Actualizar evidencia con comprobante
    await prisma.evidence.update({
      where: { id },
      data: {
        paymentProofPath: `/pagos/${auth.userId}/${fileName}`,
        paymentVerified: false,
        status: "REVISANDO",
      },
    });

    return NextResponse.json({
      message:
        "Comprobante de pago recibido. Tu solicitud será procesada pronto.",
    });
  } catch (error) {
    console.error("Payment upload error:", error);
    return NextResponse.json(
      { error: "Error al procesar el pago" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const evidence = await prisma.evidence.findUnique({
      where: { id },
      select: {
        id: true,
        amount: true,
        paymentVerified: true,
        paymentProofPath: true,
        status: true,
      },
    });

    if (!evidence) {
      return NextResponse.json(
        { error: "Evidencia no encontrada" },
        { status: 404 }
      );
    }

    if (auth.role === "CLIENTE" && evidence.id !== id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    return NextResponse.json({ payment: evidence });
  } catch (error) {
    console.error("Get payment error:", error);
    return NextResponse.json(
      { error: "Error al obtener información de pago" },
      { status: 500 }
    );
  }
}
