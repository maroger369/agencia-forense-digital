"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      // Redirigir según rol
      if (data.user.role === "CLIENTE") {
        router.push("/dashboard");
      } else {
        router.push("/admin");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-forensic-purple/5 pointer-events-none" />
      
      <div className="animate-fade-in w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-forensic-purple shadow-lg shadow-primary/20 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Agencia de Análisis Forense Digital</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cochabamba, Bolivia
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error && !email ? "Campo obligatorio" : undefined}
              />

              <div className="relative">
                <Input
                  id="password"
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={error && !password ? "Campo obligatorio" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link
                href="/auth/register"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Registrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
