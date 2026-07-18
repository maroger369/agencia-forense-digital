import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "forense-secret-key-change-in-production";
const TOKEN_EXPIRY = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get("token")?.value;
  return token || null;
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export async function getServerUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(response: Response, token: string): void {
  const headers = new Headers(response.headers);
  headers.set(
    "Set-Cookie",
    `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
  );
  Object.defineProperty(response, "headers", { value: headers });
}

export function clearAuthCookie(response: Response): void {
  const headers = new Headers(response.headers);
  headers.set(
    "Set-Cookie",
    "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  );
  Object.defineProperty(response, "headers", { value: headers });
}

export function requireAuth(
  request: NextRequest,
  allowedRoles?: string[]
): { user: JWTPayload; error?: undefined } | { user?: undefined; error: Response } {
  const user = getUserFromRequest(request);
  if (!user) {
    return {
      error: Response.json(
        { error: "No autorizado. Inicia sesión." },
        { status: 401 }
      ),
    };
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      error: Response.json(
        { error: "No tienes permisos para acceder a este recurso." },
        { status: 403 }
      ),
    };
  }
  return { user };
}
