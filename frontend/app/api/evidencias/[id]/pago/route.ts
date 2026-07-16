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

    // Guardar comprobante enviándolo al backend
    const baseUrl = process.env.NEXT_PUBLIC_FORENSIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
    const UPLOAD_API_URL = `${baseUrl}/upload`;

    const backendFormData = new FormData();
    backendFormData.append("file", paymentFile, paymentFile.name);
    backendFormData.append("folder", `pagos/${auth.userId}`);

    const uploadRes = await fetch(UPLOAD_API_URL, {
      method: "POST",
      body: backendFormData,
    });

    if (!uploadRes.ok) {
      throw new Error(`Error al subir comprobante al backend: ${uploadRes.status}`);
    }

    const uploadData = await uploadRes.json();

    // Actualizar evidencia con comprobante
    await prisma.evidence.update({
      where: { id },
      data: {
        paymentProofPath: `${baseUrl}/uploads/${uploadData.filename}`, // URL absoluta para el frontend
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
