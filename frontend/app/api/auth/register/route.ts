import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { hashPassword, generateToken } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, ci, phone } = await request.json();

    if (!email || !password || !name || !ci) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    const existingCi = await prisma.user.findUnique({ where: { ci } });
    if (existingCi) {
      return NextResponse.json(
        { error: "El CI ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        ci,
        phone: phone || "",
        role: "CLIENTE",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        ci: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        user,
        token,
        message: "Registro exitoso",
      },
      { status: 201 }
    );

    response.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    );

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
