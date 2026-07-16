"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registerSchema = z
  .object({
    name: z.string().min(2, "El nombre es obligatorio"),
    ci: z.string().min(5, "El CI es obligatorio"),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().optional(),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      ci: "",
      phone: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setServerError(responseData.error || "Error al registrarse");
        return;
      }

      router.push("/dashboard");
    } catch {
      setServerError("Error de conexión. Intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-forensic-purple/5 pointer-events-none" />
      
      <div className="animate-fade-in w-full max-w-lg relative mt-8 sm:mt-0 mb-8 sm:mb-0">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl shadow-lg mb-4 bg-white/5">
            <Image src="/logo/logo-afd.png" alt="AFD Logo" width={64} height={64} className="w-16 h-16 object-contain" priority />
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="name"
                  label="Nombre Completo *"
                  placeholder="Juan Pérez"
                  error={errors.name?.message}
                  disabled={isSubmitting}
                  {...register("name")}
                />
                <Input
                  id="ci"
                  label="Cédula de Identidad *"
                  placeholder="1234567"
                  error={errors.ci?.message}
                  disabled={isSubmitting}
                  {...register("ci")}
                />
              </div>

              <Input
                id="email"
                label="Correo Electrónico *"
                type="email"
                placeholder="correo@ejemplo.com"
                error={errors.email?.message}
                disabled={isSubmitting}
                {...register("email")}
              />

              <Input
                id="phone"
                label="Teléfono"
                type="tel"
                placeholder="+591 71234567"
                error={errors.phone?.message}
                disabled={isSubmitting}
                {...register("phone")}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    id="password"
                    label="Contraseña *"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mín. 6 caracteres"
                    error={errors.password?.message}
                    disabled={isSubmitting}
                    {...register("password")}
                  />
                </div>
                <Input
                  id="confirmPassword"
                  label="Confirmar Contraseña *"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repite la contraseña"
                  error={errors.confirmPassword?.message}
                  disabled={isSubmitting}
                  {...register("confirmPassword")}
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

              {serverError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                  {serverError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
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
