import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (auth.role === "CLIENTE") {
      return NextResponse.json({ error: "No tienes permisos" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          ci: true,
          phone: true,
          active: true,
          createdAt: true,
          _count: { select: { evidences: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}
