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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto py-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Certificado Verificado</h1>
          <p className="text-muted-foreground">
            Este certificado es válido y ha sido emitido por la Agencia de Análisis Forense Digital
          </p>
        </div>

        {/* Info del certificado */}
        <Card>
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
          <Card>
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
            <Card>
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
              <Card>
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
