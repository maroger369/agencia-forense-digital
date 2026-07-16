"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Shield, FileText, ArrowLeft, Eye, Download,
  Clock, AlertTriangle, CheckCircle2, ImageIcon, QrCode,
  MapPin, Camera, Fingerprint, Activity, BarChart3,
  Layers, Cpu, Copy, Target
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

export default function EvidenceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resumen");
  const [copiedHash, setCopiedHash] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchEvidence();
  }, [id]);

  const fetchEvidence = async () => {
    try {
      const res = await fetch(`/api/evidencias/${id}`);
      if (!res.ok) { router.push("/dashboard"); return; }
      const data = await res.json();
      setEvidence(data.evidence);
    } catch (err) {
      console.error(err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
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

  const getRiskLevel = (score: number) => {
    if (score > 0.5) return { level: "ALTO", color: "text-red-400", bg: "bg-red-500/20" };
    if (score > 0.2) return { level: "MEDIO", color: "text-amber-400", bg: "bg-amber-500/20" };
    return { level: "BAJO", color: "text-emerald-400", bg: "bg-emerald-500/20" };
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(""), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!evidence) return null;

  const forensicReport = evidence.analysis?.forensicReport
    ? JSON.parse(evidence.analysis.forensicReport)
    : null;

  const exifData = evidence.analysis?.exifData
    ? JSON.parse(evidence.analysis.exifData)
    : null;

  const hashesData = evidence.analysis?.hashesData
    ? JSON.parse(evidence.analysis.hashesData)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-bold">Detalle de Evidencia</span>
            </div>
          </div>
          {getStatusBadge(evidence.status)}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info básica */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-2">
                {evidence.imagePath ? (
                  <img
                    src={evidence.imagePath}
                    alt={evidence.originalName}
                    className="w-full rounded-xl object-contain max-h-80"
                  />
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-muted rounded-xl">
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Información de la Solicitud
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Archivo</p>
                    <p className="font-medium text-sm">{evidence.originalName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estado</p>
                    <div className="mt-1">{getStatusBadge(evidence.status)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monto</p>
                    <p className="font-medium">Bs. {evidence.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha Solicitud</p>
                    <p className="font-medium text-sm">
                      {new Date(evidence.createdAt).toLocaleDateString("es-BO")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pago</p>
                    <p className="font-medium text-sm">
                      {evidence.paymentVerified ? (
                        <span className="text-emerald-400">Verificado</span>
                      ) : (
                        <span className="text-amber-400">Pendiente</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Certificado</p>
                    <p className="font-medium text-sm">
                      {evidence.certificate ? (
                        <span className="text-emerald-400">Generado</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Resultados del análisis */}
        {evidence.analysis && (
          <div className="space-y-6 animate-fade-in">
            {/* Veredicto */}
            <Card className={`border ${evidence.analysis.elaResult === "AUTENTICA" ? "border-emerald-500/30" : "border-red-500/30"}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {evidence.analysis.elaResult === "AUTENTICA" ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold mb-1 ${evidence.analysis.elaResult === "AUTENTICA" ? "text-emerald-400" : "text-red-400"}`}>
                      {evidence.analysis.elaResult === "AUTENTICA"
                        ? "IMAGEN APARENTEMENTE AUTÉNTICA"
                        : "POSIBLE MANIPULACIÓN DETECTADA"}
                    </h3>
                    {forensicReport && (
                      <p className="text-muted-foreground">{forensicReport.resumen}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs de análisis */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: "resumen", label: "Resumen", icon: BarChart3 },
                { id: "exif", label: "EXIF/Metadatos", icon: Camera },
                { id: "hashes", label: "Hashes", icon: Fingerprint },
                { id: "tecnico", label: "Datos Técnicos", icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground bg-card hover:bg-card/80"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Resumen */}
            {activeTab === "resumen" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Resumen del Análisis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground">Score ELA</p>
                      <p className="text-2xl font-bold">{evidence.analysis.elaScore}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground">Nivel de Riesgo</p>
                      <p className={`text-2xl font-bold ${getRiskLevel(evidence.analysis.elaScore || 0).color}`}>
                        {getRiskLevel(evidence.analysis.elaScore || 0).level}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground">Analizado por</p>
                      <p className="text-sm font-medium">{evidence.analysis.analyst?.name || "Sistema"}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground">Fecha Análisis</p>
                      <p className="text-sm font-medium">
                        {new Date(evidence.analysis.createdAt).toLocaleDateString("es-BO")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* EXIF */}
            {activeTab === "exif" && exifData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-400" />
                    Metadatos EXIF
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {exifData.camera && (
                      <div className="bg-muted/50 p-4 rounded-xl">
                        <p className="text-xs text-muted-foreground mb-2 font-semibold text-blue-400">Cámara</p>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Fabricante:</span> {exifData.camera.make || "N/A"}</p>
                          <p><span className="text-muted-foreground">Modelo:</span> {exifData.camera.model || "N/A"}</p>
                          <p><span className="text-muted-foreground">Lente:</span> {exifData.camera.lens || "N/A"}</p>
                        </div>
                      </div>
                    )}
                    {exifData.dates && (
                      <div className="bg-muted/50 p-4 rounded-xl">
                        <p className="text-xs text-muted-foreground mb-2 font-semibold text-amber-400">Fechas</p>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Creación:</span> {exifData.dates.create_date || "N/A"}</p>
                          <p><span className="text-muted-foreground">Original:</span> {exifData.dates.datetime_original || "N/A"}</p>
                        </div>
                      </div>
                    )}
                    {exifData.gps && (
                      <div className="bg-muted/50 p-4 rounded-xl">
                        <p className="text-xs text-muted-foreground mb-2 font-semibold text-green-400">GPS</p>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Latitud:</span> {exifData.gps.latitude || "N/A"}</p>
                          <p><span className="text-muted-foreground">Longitud:</span> {exifData.gps.longitude || "N/A"}</p>
                          <p><span className="text-muted-foreground">Altitud:</span> {exifData.gps.altitude || "N/A"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {exifData.software && (
                    <div className="mt-4 bg-muted/50 p-4 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-2 font-semibold text-purple-400">Software</p>
                      <p className="text-sm">{exifData.software.software || "No detectado"}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Hashes */}
            {activeTab === "hashes" && hashesData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-amber-400" />
                    Huellas Digitales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hashesData.cryptographic && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-amber-400 mb-3">Hashes Criptográficos</h4>
                      <div className="space-y-3">
                        {Object.entries(hashesData.cryptographic).map(([key, value]) => (
                          <div key={key} className="bg-muted/50 p-3 rounded-xl">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium uppercase text-muted-foreground">{key}</span>
                              <button
                                onClick={() => copyToClipboard(value as string, key)}
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                              >
                                {copiedHash === key ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                {copiedHash === key ? "Copiado" : "Copiar"}
                              </button>
                            </div>
                            <p className="font-mono text-xs break-all">{value as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Certificado */}
            {evidence.certificate && (
              <Card className="border-forensic-gold/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-forensic-gold" />
                    Certificado Digital
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="bg-white p-4 rounded-2xl">
                      <QrCode className="w-32 h-32 text-black" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Certificado generado exitosamente</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Hash: <span className="font-mono text-xs">{evidence.certificate.certificateHash.substring(0, 20)}...</span>
                      </p>
                      <div className="flex gap-3 mt-4">
                        <a
                          href={`/api/evidencias/${evidence.id}/certificado`}
                          download
                        >
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                            Descargar PDF
                          </Button>
                        </a>
                        <Button size="sm" onClick={() => setShowPreview(true)}>
                          <Eye className="w-4 h-4" />
                          Ver Certificado
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {evidence?.certificate && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Previsualización del Certificado</DialogTitle>
            </DialogHeader>
            <div className="flex-1 bg-muted/20 w-full h-full relative">
              <iframe 
                src={`/api/evidencias/${evidence.id}/certificado`}
                className="w-full h-full border-0 absolute inset-0"
                title="Certificado PDF"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
