"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    ci: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirmPassword, ci, phone } = form;

    if (!name || !email || !password || !ci) {
      setError("Todos los campos marcados con * son obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, ci, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrarse");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-forensic-purple/5 pointer-events-none" />
      
      <div className="animate-fade-in w-full max-w-lg relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-forensic-purple shadow-lg shadow-primary/20 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Crear Cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Regístrate para solicitar certificaciones de evidencia digital
          </p>
        </div>

        <Card className="border-border/50 shadow-2xl">
          <CardHeader>
            <CardTitle>Registro de Cliente</CardTitle>
            <CardDescription>
              Completa tus datos personales para crear tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="name"
                  label="Nombre Completo *"
                  placeholder="Juan Pérez"
                  value={form.name}
                  onChange={handleChange("name")}
                />
                <Input
                  id="ci"
                  label="Cédula de Identidad *"
                  placeholder="1234567"
                  value={form.ci}
                  onChange={handleChange("ci")}
                />
              </div>

              <Input
                id="email"
                label="Correo Electrónico *"
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={handleChange("email")}
              />

              <Input
                id="phone"
                label="Teléfono"
                type="tel"
                placeholder="+591 71234567"
                value={form.phone}
                onChange={handleChange("phone")}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    id="password"
                    label="Contraseña *"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mín. 6 caracteres"
                    value={form.password}
                    onChange={handleChange("password")}
                  />
                </div>
                <Input
                  id="confirmPassword"
                  label="Confirmar Contraseña *"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repite la contraseña"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  {showPassword ? "Ocultar" : "Mostrar"} contraseñas
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
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Crear Cuenta
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Inicia sesión
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
