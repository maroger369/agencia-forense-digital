import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";

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
      include: {
        user: {
          select: { id: true, name: true, email: true, ci: true, phone: true },
        },
        analysis: {
          include: {
            analyst: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        certificate: {
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!evidence) {
      return NextResponse.json(
        { error: "Evidencia no encontrada" },
        { status: 404 }
      );
    }

    // Cliente solo puede ver sus propias evidencias
    if (auth.role === "CLIENTE" && evidence.userId !== auth.userId) {
      return NextResponse.json(
        { error: "No tienes permiso para ver esta evidencia" },
        { status: 403 }
      );
    }

    return NextResponse.json({ evidence });
  } catch (error) {
    console.error("Get evidence error:", error);
    return NextResponse.json(
      { error: "Error al obtener evidencia" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo ADMIN y REVISOR pueden actualizar evidencias
    if (auth.role === "CLIENTE") {
      return NextResponse.json(
        { error: "No tienes permiso para modificar esta evidencia" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = ["PENDIENTE", "REVISANDO", "TERMINADO", "RECEPCIONADO"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    const evidence = await prisma.evidence.update({
      where: { id },
      data: { ...(status && { status }) },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      evidence,
      message: "Evidencia actualizada exitosamente",
    });
  } catch (error) {
    console.error("Update evidence error:", error);
    return NextResponse.json(
      { error: "Error al actualizar evidencia" },
      { status: 500 }
    );
  }
}
