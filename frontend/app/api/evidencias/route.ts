import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    // Admin/Revisor can see all, Cliente only theirs
    if (auth.role === "CLIENTE") {
      where.userId = auth.userId;
    }

    if (status) {
      where.status = status;
    }

    const [evidencias, total] = await Promise.all([
      prisma.evidence.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, ci: true },
          },
          analysis: true,
          certificate: {
            select: { id: true, certificateHash: true, generatedAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.evidence.count({ where }),
    ]);

    return NextResponse.json({
      evidencias,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get evidencias error:", error);
    return NextResponse.json(
      { error: "Error al obtener evidencias" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (auth.role !== "CLIENTE") {
      return NextResponse.json(
        { error: "Solo los clientes pueden crear solicitudes" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const description = formData.get("description") as string || "";

    if (!file) {
      return NextResponse.json(
        { error: "Debes subir una imagen" },
        { status: 400 }
      );
    }

    // Validar que sea imagen
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes" },
        { status: 400 }
      );
    }

    // Guardar imagen enviándola al backend
    const baseUrl = process.env.NEXT_PUBLIC_FORENSIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
    const UPLOAD_API_URL = `${baseUrl}/upload`;

    const backendFormData = new FormData();
    backendFormData.append("file", file, file.name);
    backendFormData.append("folder", `evidencias/${auth.userId}`);

    const uploadRes = await fetch(UPLOAD_API_URL, {
      method: "POST",
      body: backendFormData,
    });

    if (!uploadRes.ok) {
      throw new Error(`Error al subir imagen al backend: ${uploadRes.status}`);
    }

    const uploadData = await uploadRes.json();

    // Crear evidencia
    const evidence = await prisma.evidence.create({
      data: {
        userId: auth.userId,
        imagePath: `${baseUrl}/uploads/${uploadData.filename}`, // URL absoluta para el frontend
        originalName: file.name,
        description,
        status: "PENDIENTE",
        amount: 50.0, // Monto fijo por imagen
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { evidence, message: "Solicitud creada exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create evidence error:", error);
    return NextResponse.json(
      { error: "Error al crear solicitud" },
      { status: 500 }
    );
  }
}
