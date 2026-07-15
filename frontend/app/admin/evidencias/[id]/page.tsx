"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Shield, FileText, Eye, Activity,
  CheckCircle2, AlertTriangle, QrCode, Download,
  ImageIcon, Zap, Clock
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";

export default function AdminEvidenceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchEvidence();
  }, [id]);

  const fetchEvidence = async () => {
    try {
      const res = await fetch(`/api/evidencias/${id}`);
      if (!res.ok) { router.push("/admin/evidencias"); return; }
      const data = await res.json();
      setEvidence(data.evidence);
    } catch (err) {
      console.error(err);
      router.push("/admin/evidencias");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch(`/api/evidencias/${id}/analizar`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        fetchEvidence();
      } else {
        alert(data.error || "Error al analizar");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor de análisis");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      const res = await fetch(`/api/evidencias/${id}/certificado`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        fetchEvidence();
      } else {
        alert(data.error || "Error al generar certificado");
      }
    } catch (err) {
      console.error(err);
      alert("Error al generar certificado");
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const res = await fetch(`/api/evidencias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchEvidence();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "warning" | "info" | "success" | "purple" }> = {
      PENDIENTE: { label: "Pendiente", variant: "warning" },
      REVISANDO: { label: "En Revisión", variant: "info" },
      TERMINADO: { label: "Completado", variant: "success" },
      RECEPCIONADO: { label: "Recepcionado", variant: "purple" },
    };
    const c = config[status] || { label: status, variant: "default" as const };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!evidence) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/admin/evidencias">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Revisión de Evidencia</h1>
          <p className="text-sm text-muted-foreground">{evidence.originalName}</p>
        </div>
        <div className="ml-auto">{getStatusBadge(evidence.status)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image */}
        <Card>
          <CardContent className="p-2">
            <img
              src={evidence.imagePath}
              alt={evidence.originalName}
              className="w-full rounded-xl object-contain max-h-80"
            />
          </CardContent>
        </Card>

        {/* Info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nombre</p>
                  <p className="font-medium">{evidence.user?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">CI</p>
                  <p className="font-medium">{evidence.user?.ci}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{evidence.user?.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{evidence.user?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha Solicitud</p>
                  <p className="font-medium">{new Date(evidence.createdAt).toLocaleDateString("es-BO")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pago</p>
                  {evidence.paymentVerified ? (
                    <Badge variant="success">Verificado</Badge>
                  ) : (
                    <Badge variant="warning">Pendiente</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analizando...</>
                  ) : (
                    <><Activity className="w-4 h-4" /> Realizar Análisis Forense</>
                  )}
                </Button>

                {evidence.analysis && (
                  <Button
                    variant="secondary"
                    onClick={handleGenerateCertificate}
                  >
                    <QrCode className="w-4 h-4" />
                    Generar Certificado
                  </Button>
                )}

                {evidence.status === "PENDIENTE" && (
                  <Button variant="outline" onClick={() => handleStatusChange("REVISANDO")}>
                    <Clock className="w-4 h-4" />
                    Marcar en Revisión
                  </Button>
                )}

                {evidence.status === "TERMINADO" && (
                  <Button variant="outline" onClick={() => handleStatusChange("RECEPCIONADO")}>
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar Recepcionado
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analysis Results */}
      {evidence.analysis && (
        <Card className="border-forensic-blue/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Resultados del Análisis Forense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground">Score ELA</p>
                <p className="text-2xl font-bold">{evidence.analysis.elaScore}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground">Resultado</p>
                <p className={`text-lg font-bold ${evidence.analysis.elaResult === "AUTENTICA" ? "text-emerald-400" : "text-red-400"}`}>
                  {evidence.analysis.elaResult === "AUTENTICA" ? "Auténtica" : "Manipulada"}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground">Analizado por</p>
                <p className="text-sm font-medium">{evidence.analysis.analyst?.name || "Sistema"}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="text-sm font-medium">{new Date(evidence.analysis.createdAt).toLocaleDateString("es-BO")}</p>
              </div>
            </div>

            {evidence.certificate && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-forensic-gold/10 border border-forensic-gold/30">
                <QrCode className="w-10 h-10 text-forensic-gold" />
                <div className="flex-1">
                  <p className="font-medium">Certificado Generado</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Hash: {evidence.certificate.certificateHash.substring(0, 30)}...
                  </p>
                </div>
                <a
                  href={`/api/evidencias/${evidence.id}/certificado`}
                  download
                >
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                    Descargar
                  </Button>
                </a>
                <a
                  href={`/api/evidencias/${evidence.id}/certificado`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm">
                    <Eye className="w-4 h-4" />
                    Ver
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
