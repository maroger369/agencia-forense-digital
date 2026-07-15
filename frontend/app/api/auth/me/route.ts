import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        ci: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}
