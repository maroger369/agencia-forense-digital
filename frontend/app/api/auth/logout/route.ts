import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Sesión cerrada" });

  response.headers.set(
    "Set-Cookie",
    "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  );

  return response;
}
