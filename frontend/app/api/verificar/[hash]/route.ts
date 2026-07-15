import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const auth = getUserFromRequest(request);

    const certificate = await prisma.certificate.findUnique({
      where: { certificateHash: hash },
      include: {
        evidence: {
          include: {
            user: {
              select: { id: true, name: true, ci: true },
            },
            analysis: true,
          },
        },
        author: {
          select: { name: true },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        {
          valid: false,
          error: "Certificado no encontrado o inválido",
        },
        { status: 404 }
      );
    }

    // Si no está autenticado, mostrar info limitada
    if (!auth) {
      return NextResponse.json({
        valid: true,
        hash: certificate.certificateHash,
        generado: certificate.generatedAt,
        emitidoPor: "Agencia de Análisis Forense Digital",
        ubicacion: "Cochabamba, Bolivia",
        evidencia: {
          estado: certificate.evidence.status,
          solicitud: certificate.evidence.createdAt,
        },
        requiereAutenticacion: true,
        mensaje:
          "Para ver los detalles completos de la certificación, debes iniciar sesión.",
      });
    }

    // Usuario autenticado - mostrar info completa
    const forensicReport = certificate.evidence.analysis?.forensicReport
      ? JSON.parse(certificate.evidence.analysis.forensicReport)
      : null;

    return NextResponse.json({
      valid: true,
      certificado: {
        hash: certificate.certificateHash,
        qrCode: certificate.qrCode,
        pdfPath: certificate.pdfPath,
        generado: certificate.generatedAt,
        emitidoPor: "Agencia de Análisis Forense Digital",
        ubicacion: "Cochabamba, Bolivia",
        analista: certificate.author.name,
      },
      evidencia: {
        id: certificate.evidence.id,
        nombreOriginal: certificate.evidence.originalName,
        estado: certificate.evidence.status,
        fechaSolicitud: certificate.evidence.createdAt,
        solicitante: certificate.evidence.user.name,
        ciSolicitante: certificate.evidence.user.ci,
      },
      analisis: {
        scoreELA: certificate.evidence.analysis?.elaScore,
        resultadoELA: certificate.evidence.analysis?.elaResult,
        exif: certificate.evidence.analysis?.exifData
          ? JSON.parse(certificate.evidence.analysis.exifData)
          : null,
        hashes: certificate.evidence.analysis?.hashesData
          ? JSON.parse(certificate.evidence.analysis.hashesData)
          : null,
        dictamen: forensicReport,
      },
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    return NextResponse.json(
      { error: "Error al verificar certificado" },
      { status: 500 }
    );
  }
}
