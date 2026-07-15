import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";
import crypto from "crypto";
import QRCode from "qrcode";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { generarPDFCertificado } from "@/app/lib/pdf-generator";

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

    if (auth.role === "CLIENTE") {
      return NextResponse.json(
        { error: "No tienes permiso para generar certificados" },
        { status: 403 }
      );
    }

    const evidence = await prisma.evidence.findUnique({
      where: { id },
      include: {
        user: true,
        analysis: {
          include: { analyst: { select: { name: true } } },
        },
      },
    });

    if (!evidence) {
      return NextResponse.json({ error: "Evidencia no encontrada" }, { status: 404 });
    }

    if (!evidence.analysis) {
      return NextResponse.json(
        { error: "Primero debes analizar la evidencia" },
        { status: 400 }
      );
    }

    // Obtener analysta name
    const analystName = evidence.analysis.analyst?.name || auth.name || "Sistema";

    // Generar hash único del certificado
    const hashData = `${evidence.id}-${evidence.userId}-${evidence.analysis.id}-${Date.now()}`;
    const certificateHash = crypto
      .createHash("sha256")
      .update(hashData)
      .digest("hex");

    // Generar código QR con el hash
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verificar/${certificateHash}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    // Guardar QR como imagen
    const qrDir = path.join(process.cwd(), "public", "certificados", "qr");
    await mkdir(qrDir, { recursive: true });
    const qrFileName = `${certificateHash.substring(0, 12)}.png`;
    const qrPath = path.join(qrDir, qrFileName);

    const qrBuffer = Buffer.from(
      qrCodeDataUrl.replace(/^data:image\/png;base64,/, ""),
      "base64"
    );
    await writeFile(qrPath, qrBuffer);

    // Parsear datos para el PDF
    const forensicReport = evidence.analysis.forensicReport
      ? JSON.parse(evidence.analysis.forensicReport)
      : {};

    // Generar PDF del certificado
    const pdfBuffer = await generarPDFCertificado({
      certificateHash,
      qrCodePath: `/certificados/qr/${qrFileName}`,
      evidence: {
        originalName: evidence.originalName,
        createdAt: evidence.createdAt.toISOString(),
        user: {
          name: evidence.user.name,
          ci: evidence.user.ci,
          email: evidence.user.email,
        },
      },
      analysis: {
        elaScore: evidence.analysis.elaScore ?? 0,
        elaResult: evidence.analysis.elaResult || "AUTENTICA",
        forensicReport,
        histogramData: evidence.analysis.histogramData ? JSON.parse(evidence.analysis.histogramData) : null,
        exifData: evidence.analysis.exifData ? JSON.parse(evidence.analysis.exifData) : null,
        hashesData: evidence.analysis.hashesData ? JSON.parse(evidence.analysis.hashesData) : null,
        compressionData: evidence.analysis.compressionData ? JSON.parse(evidence.analysis.compressionData) : null,
        noiseData: evidence.analysis.noiseData ? JSON.parse(evidence.analysis.noiseData) : null,
      },
      analystName,
    });

    // Guardar PDF
    const pdfDir = path.join(process.cwd(), "public", "certificados", "pdfs");
    await mkdir(pdfDir, { recursive: true });
    const pdfFileName = `certificado-${certificateHash.substring(0, 12)}.pdf`;
    const pdfFilePath = path.join(pdfDir, pdfFileName);
    await writeFile(pdfFilePath, pdfBuffer);

    // Guardar certificado en BD
    const certificate = await prisma.certificate.upsert({
      where: { evidenceId: id },
      create: {
        evidenceId: id,
        certificateHash,
        qrCode: `/certificados/qr/${qrFileName}`,
        pdfPath: `/certificados/pdfs/${pdfFileName}`,
        generatedBy: auth.userId,
      },
      update: {
        certificateHash,
        qrCode: `/certificados/qr/${qrFileName}`,
        pdfPath: `/certificados/pdfs/${pdfFileName}`,
        generatedBy: auth.userId,
      },
    });

    // Actualizar estado de evidencia a TERMINADO
    await prisma.evidence.update({
      where: { id },
      data: {
        status: "TERMINADO",
        hash: certificateHash,
      },
    });

    return NextResponse.json({
      certificate,
      verificationUrl,
      pdfUrl: `/certificados/pdfs/${pdfFileName}`,
      message: "Certificado generado exitosamente",
    });
  } catch (error) {
    console.error("Generate certificate error:", error);
    return NextResponse.json(
      { error: "Error al generar certificado" },
      { status: 500 }
    );
  }
}

// GET endpoint to download the certificate PDF
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
      include: { certificate: true },
    });

    if (!evidence || !evidence.certificate?.pdfPath) {
      return NextResponse.json(
        { error: "Certificado no disponible" },
        { status: 404 }
      );
    }

    // Cliente solo puede ver sus propias evidencias
    if (auth.role === "CLIENTE" && evidence.userId !== auth.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const pdfPath = path.join(process.cwd(), "public", evidence.certificate.pdfPath);
    const pdfBuffer = await readFile(pdfPath);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificado-${evidence.certificate.certificateHash.substring(0, 12)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Download certificate error:", error);
    return NextResponse.json(
      { error: "Error al descargar certificado" },
      { status: 500 }
    );
  }
}
