import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getUserFromRequest(request);
    if (!auth || (auth.role !== "ADMIN" && auth.role !== "REVISOR")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const evidence = await prisma.evidence.update({
      where: { id },
      data: { paymentVerified: true },
    });

    return NextResponse.json({ evidence });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Error al verificar el pago" },
      { status: 500 }
    );
  }
}
