"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Shield, CheckCircle2, XCircle, QrCode,
  FileText, Camera, Fingerprint, MapPin, Clock
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

export default function VerifyCertificatePage() {
  const { hash } = useParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hash) verifyCertificate();
  }, [hash]);

  const verifyCertificate = async () => {
    try {
      const res = await fetch(`/api/verificar/${hash}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al verificar certificado");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando certificado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-12">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Certificado No Válido</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/">
              <Button variant="outline">Volver al Inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Marca de agua de fondo fija al centro */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-10 dark:opacity-10 z-0">
        <Image src="/logo/logo-afd.png" alt="Watermark" width={800} height={800} className="object-contain opacity-40" />
      </div>

      <div className="max-w-3xl mx-auto py-8 space-y-6 animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-4 ring-4 ring-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Certificado Auténtico y Verificado</h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Este documento digital es <strong className="text-emerald-600 dark:text-emerald-400">REAL</strong> y ha sido auditado técnicamente por el sistema inteligente de la Agencia de Análisis Forense Digital. Cuenta con un código criptográfico único e inalterable que garantiza su integridad.
          </p>
        </div>

        {/* Info del certificado */}
        <Card className="bg-background/60 backdrop-blur-md shadow-xl border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Datos del Certificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground">Institución</p>
                <p className="font-medium">Agencia de Análisis Forense Digital</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground">Ubicación</p>
                <p className="font-medium">Cochabamba, Bolivia</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground">Hash del Certificado</p>
                <p className="font-mono text-xs break-all">{result.certificado?.hash || hash}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground">Fecha de Emisión</p>
                <p className="font-medium">
                  {result.certificado?.generado
                    ? new Date(result.certificado.generado).toLocaleDateString("es-BO")
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Si requiere autenticación */}
        {result.requiereAutenticacion && (
          <Card className="bg-background/60 backdrop-blur-md shadow-xl border-primary/10">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Información Adicional</h3>
              <p className="text-muted-foreground mb-6">
                {result.mensaje || "Para ver los detalles completos del análisis forense, inicia sesión."}
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/auth/login">
                  <Button>Iniciar Sesión</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline">Crear Cuenta</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info completa (autenticado) */}
        {result.evidencia && (
          <>
            <Card className="bg-background/60 backdrop-blur-md shadow-xl border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Datos de la Evidencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Archivo</p>
                    <p className="font-medium">{result.evidencia.nombreOriginal}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estado</p>
                    <Badge variant="success">{result.evidencia.estado}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Solicitante</p>
                    <p className="font-medium">{result.evidencia.solicitante}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CI</p>
                    <p className="font-medium">{result.evidencia.ciSolicitante}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.analisis && (
              <Card className="bg-background/60 backdrop-blur-md shadow-xl border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-purple-400" />
                    Resultados del Análisis Forense
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground">Score ELA</p>
                      <p className="text-2xl font-bold">{result.analisis.scoreELA}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground">Resultado</p>
                      <p className={`text-lg font-bold ${result.analisis.resultadoELA === "AUTENTICA" ? "text-emerald-400" : "text-red-400"}`}>
                        {result.analisis.resultadoELA === "AUTENTICA" ? "Auténtica" : "Manipulada"}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground">Dictamen</p>
                      <p className="text-sm font-medium">
                        {result.analisis.dictamen?.veredicto || "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="text-center">
          <Link href="/">
            <Button variant="outline">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
