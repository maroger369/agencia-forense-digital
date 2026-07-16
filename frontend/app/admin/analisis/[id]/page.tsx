"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  CheckCircle2,
  Camera,
  Hash,
  Eye,
  BarChart3,
  FileText,
  Fingerprint,
  Zap,
  Layers,
  Target,
  Copy,
  Activity,
  Info,
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";

export default function AnalysisView() {
  const { id } = useParams();
  const router = useRouter();
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [copiedHash, setCopiedHash] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchEvidence();
  }, [id]);

  const fetchEvidence = async () => {
    try {
      const res = await fetch(`/api/evidencias/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEvidence(data.evidence);
      } else {
        router.push("/admin/evidencias");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch(`/api/evidencias/${id}/analizar`, { method: "POST" });
      if (res.ok) {
        fetchEvidence();
      } else {
        const data = await res.json();
        alert(data.error || "Error al analizar");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red al analizar");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleVerifyPayment = async () => {
    try {
      setVerifying(true);
      const res = await fetch(`/api/admin/evidencias/${id}/verificar-pago`, { method: "POST" });
      if (res.ok) {
        fetchEvidence();
      } else {
        alert("Error al verificar el pago");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red");
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(""), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-4 h-96 rounded-3xl" />
          <Skeleton className="lg:col-span-8 h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!evidence) return null;

  const hasAnalysis = !!evidence.analysis;

  let exifData: any = null;
  let hashesData: any = null;
  let histogramData: any = null;
  let compressionData: any = null;

  if (hasAnalysis) {
    try { exifData = JSON.parse(evidence.analysis.exifData); } catch (e) { }
    try { hashesData = JSON.parse(evidence.analysis.hashesData); } catch (e) { }
    try { histogramData = JSON.parse(evidence.analysis.histogramData); } catch (e) { }
    try { compressionData = JSON.parse(evidence.analysis.compressionData); } catch (e) { }
  }

  const getRiskLevel = (score: number) => {
    if (score > 0.5) return { level: "ALTO", variant: "destructive" as const };
    if (score > 0.2) return { level: "MEDIO", variant: "default" as const };
    return { level: "BAJO", variant: "secondary" as const };
  };

  const getManipulationVerdict = () => {
    if (!hasAnalysis) return { verdict: "NO DISPONIBLE", variant: "outline" as const };
    if (evidence.analysis.elaResult !== 'AUTENTICA') {
      return { verdict: "POSIBLE MANIPULACIÓN DETECTADA", variant: "destructive" as const };
    }
    return { verdict: "SIN EVIDENCIA DE MANIPULACIÓN", variant: "secondary" as const };
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in">
      {evidence.paymentProofPath && !evidence.paymentVerified && (
        <Card className="border-amber-500 bg-amber-500/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-700 dark:text-amber-500 flex items-center gap-2 text-lg">
              <AlertCircle className="size-5" />
              Verificación de Pago Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-sm text-amber-700/90 dark:text-amber-500/90 max-w-xl">
              El cliente ha subido un comprobante de pago por <strong>Bs. {evidence.amount?.toFixed(2) || '50.00'}</strong>. Revisa el comprobante y marca el pago como validado para continuar con el análisis forense oficial.
            </p>
            <div className="flex gap-2 w-full md:w-auto">
              <a href={evidence.paymentProofPath} target="_blank" rel="noreferrer" className="flex-1 md:flex-auto">
                <Button variant="outline" className="w-full border-amber-500/30 text-amber-700 dark:text-amber-500 hover:bg-amber-500/10">Ver Comprobante</Button>
              </a>
              <Button onClick={handleVerifyPayment} disabled={verifying} className="flex-1 md:flex-auto bg-amber-500 hover:bg-amber-600 text-white border-0">
                {verifying ? "Validando..." : "Marcar Validado"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl text-primary">
              <Shield className="size-8" />
            </div>
            <div className="flex flex-col gap-1">
              <Link href="/admin/evidencias" className="text-primary hover:underline text-xs">&larr; Volver al dashboard</Link>
              <h1 className="text-2xl font-bold bg-clip-text">
                Caso #{evidence.id.slice(-6)}
              </h1>
              <p className="text-sm text-muted-foreground">
                Subido el {new Date(evidence.createdAt).toLocaleDateString("es-BO")} por {evidence.user?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!hasAnalysis ? (
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                size="lg"
              >
                {analyzing ? (
                  <>Analizando...</>
                ) : (
                  <>
                    <Zap className="size-4 mr-2" />
                    Iniciar Análisis
                  </>
                )}
              </Button>
            ) : (
              <Button variant="outline" className="pointer-events-none">
                <CheckCircle2 className="size-4 mr-2 text-emerald-500" />
                Análisis Finalizado
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="text-primary size-5" />
                Evidencia Digital
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="border border-border rounded-2xl overflow-hidden bg-muted/30 flex items-center justify-center p-2 min-h-[250px]">
                <img src={evidence.imagePath} alt="Evidencia original" className="max-w-full h-auto object-contain rounded-xl shadow-sm max-h-72" />
              </div>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Nombre original:</span>
                  <span className="font-mono text-xs truncate max-w-[180px]">{evidence.originalName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge variant="outline">{evidence.status}</Badge>
                </div>
                {hasAnalysis && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tipo MIME:</span>
                    <span className="font-mono text-xs">{exifData?.file?.mime_type || "N/A"}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 flex flex-col h-full">
          {!hasAnalysis ? (
            <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed">
              <CardContent className="text-center text-muted-foreground flex flex-col items-center justify-center pt-6">
                <Activity className="size-12 mb-3 opacity-20" />
                <p className="text-lg font-medium">Análisis no iniciado</p>
                <p className="text-sm mt-2 max-w-sm text-center">
                  Haz clic en "Iniciar Análisis" para extraer metadatos, verificar hashes y correr el motor ELA de detección de manipulaciones.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="resumen" className="w-full flex flex-col gap-6">
              <TabsList className="w-full justify-start overflow-x-auto h-auto py-2">
                <TabsTrigger value="resumen" className="flex items-center gap-2"><Shield className="size-4" /> Resumen</TabsTrigger>
                <TabsTrigger value="ela" className="flex items-center gap-2"><Eye className="size-4" /> ELA</TabsTrigger>
                <TabsTrigger value="histograma" className="flex items-center gap-2"><BarChart3 className="size-4" /> Histograma</TabsTrigger>
                <TabsTrigger value="exif" className="flex items-center gap-2"><Camera className="size-4" /> EXIF</TabsTrigger>
                <TabsTrigger value="hashes" className="flex items-center gap-2"><Fingerprint className="size-4" /> Hashes</TabsTrigger>
                <TabsTrigger value="compresion" className="flex items-center gap-2"><Layers className="size-4" /> Compresión</TabsTrigger>
              </TabsList>

              <TabsContent value="resumen" className="flex flex-col gap-6 m-0">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl">Dictamen Inmediato</CardTitle>
                    <Badge variant={getManipulationVerdict().variant} className="text-xs sm:text-sm px-3 py-1">
                      {getManipulationVerdict().verdict}
                    </Badge>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">Nivel de Riesgo</p>
                      <p className={`text-2xl font-bold`}>
                        <Badge variant={getRiskLevel(evidence.analysis.elaScore || 0).variant}>{getRiskLevel(evidence.analysis.elaScore || 0).level}</Badge>
                      </p>
                    </div>
                    <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">Score ELA</p>
                      <p className="text-2xl font-bold">{(evidence.analysis.elaScore || 0).toFixed(4)}</p>
                    </div>
                    <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">Brillo Medio</p>
                      <p className="text-2xl font-bold">{histogramData?.brightness?.toFixed(2) || "N/A"}</p>
                    </div>
                    <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">Total Píxeles</p>
                      <p className="text-2xl font-bold">{histogramData?.image?.pixels?.toLocaleString() || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><FileText className="text-primary size-5" /> Información Estructural</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">Formato</p>
                      <p className="font-medium text-sm uppercase">{exifData?.file?.file_type || compressionData?.format || "—"}</p>
                    </div>
                    <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">Resolución</p>
                      <p className="font-medium text-sm">
                        {exifData?.file?.image_width || histogramData?.image?.width || "—"} × {exifData?.file?.image_height || histogramData?.image?.height || "—"}
                      </p>
                    </div>
                    <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">Megapíxeles</p>
                      <p className="font-medium text-sm">
                        {exifData?.file?.megapixels ? `${exifData.file.megapixels} MP` : histogramData?.image?.pixels ? `${(histogramData.image.pixels / 1000000).toFixed(2)} MP` : "—"}
                      </p>
                    </div>
                    <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">Color / Profundidad</p>
                      <p className="font-medium text-sm">
                        {exifData?.file?.bits_per_sample ? `${exifData.file.bits_per_sample} bits` : compressionData?.mode || "—"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ela" className="flex flex-col gap-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Eye className="text-primary size-5" /> Error Level Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6">
                    {evidence.analysis.elaImagePath && (
                      <div className="bg-muted/30 border border-border rounded-xl p-2">
                        <img
                          src={`${(process.env.NEXT_PUBLIC_FORENSIC_API_URL || "").replace(/\/$/, "")}/temp/${evidence.analysis.elaImagePath.split(/[/\\\\]/).pop()}`}
                          alt="ELA Analysis"
                          className="w-full rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground">Calidad Base JPEG</p>
                        <p className="text-lg font-bold">90%</p>
                      </div>
                      <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground">Score Diferencial</p>
                        <p className="text-lg font-bold">{(evidence.analysis.elaScore || 0).toFixed(4)}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      El Error Level Analysis resalta áreas de la imagen que tienen diferentes niveles de compresión. Las diferencias significativas (zonas muy brillantes sobre fondo oscuro) generalmente indican que la imagen ha sido manipulada o ensamblada a partir de múltiples fuentes.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="histograma" className="flex flex-col gap-6 m-0">
                {histogramData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="text-primary size-5" /> Distribución de Canales RGB</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      {["red", "green", "blue"].map((channel) => {
                        const stats = histogramData.channels[channel]?.statistics;
                        const bgMap: Record<string, string> = { red: "bg-red-500", green: "bg-green-500", blue: "bg-blue-500" };
                        const textMap: Record<string, string> = { red: "text-red-500", green: "text-green-500", blue: "text-blue-500" };
                        if (!stats) return null;

                        return (
                          <div key={channel} className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-3">
                            <h3 className={`font-semibold capitalize ${textMap[channel]}`}>
                              Canal {channel === 'red' ? 'Rojo' : channel === 'green' ? 'Verde' : 'Azul'}
                            </h3>
                            <div className="grid grid-cols-4 gap-3 text-sm">
                              <div className="flex flex-col"><p className="text-xs text-muted-foreground">Mínimo</p><p className="font-mono">{stats.min}</p></div>
                              <div className="flex flex-col"><p className="text-xs text-muted-foreground">Máximo</p><p className="font-mono">{stats.max}</p></div>
                              <div className="flex flex-col"><p className="text-xs text-muted-foreground">Media</p><p className="font-mono">{stats.mean?.toFixed(2)}</p></div>
                              <div className="flex flex-col"><p className="text-xs text-muted-foreground">Desviación</p><p className="font-mono">{stats.std?.toFixed(2)}</p></div>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full ${bgMap[channel]} transition-all`} style={{ width: `${(stats.mean / 255) * 100}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="exif" className="flex flex-col gap-6 m-0">
                {exifData && (
                  <>
                    {(!exifData.camera?.make && !exifData.photo?.iso) && (
                      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-4 rounded-xl flex items-start gap-3">
                        <Info className="size-5 shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold">Ausencia de Metadatos Fotográficos</p>
                          <p className="mt-1 opacity-90">
                            Esta imagen carece de información EXIF de origen (cámara, exposición, etc.).
                            Desde una perspectiva forense, esto es indicativo de que la imagen fue
                            <strong> generada artificialmente (IA)</strong>, procesada por redes sociales (las cuales eliminan estos datos)
                            o modificada en programas de edición gráfica.
                          </p>
                        </div>
                      </div>
                    )}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Camera className="text-primary size-5" /> Información del Dispositivo</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">Fabricante</p><p className="font-medium text-sm">{exifData.camera?.make || "N/D"}</p></div>
                        <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">Modelo</p><p className="font-medium text-sm">{exifData.camera?.model || "N/D"}</p></div>
                        <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">Fecha Original</p><p className="font-medium text-sm truncate" title={exifData.dates?.datetime_original}>{exifData.dates?.datetime_original || "N/D"}</p></div>
                        <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">Software</p><p className="font-medium text-sm truncate" title={exifData.software?.software}>{exifData.software?.software || "N/D"}</p></div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Target className="text-primary size-5" /> Parámetros de Captura</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">Apertura</p><p className="font-medium text-sm">f/{exifData.photo?.f_number || "N/D"}</p></div>
                        <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">ISO</p><p className="font-medium text-sm">{exifData.photo?.iso || "N/D"}</p></div>
                        <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">Exposición</p><p className="font-medium text-sm">{exifData.photo?.exposure_time || "N/D"}s</p></div>
                        <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">Dist. Focal</p><p className="font-medium text-sm">{exifData.photo?.focal_length ? `${exifData.photo.focal_length}mm` : "N/D"}</p></div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="hashes" className="flex flex-col gap-6 m-0">
                {hashesData && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Hash className="text-primary size-5" /> Firmas Criptográficas</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3">
                        {Object.entries(hashesData.cryptographic || {}).map(([key, value]) => (
                          <div key={key} className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="min-w-0 flex flex-col gap-1">
                              <p className="text-xs font-semibold uppercase text-primary">{key}</p>
                              <p className="font-mono text-xs sm:text-sm text-muted-foreground truncate">{String(value)}</p>
                            </div>
                            <Button variant="secondary" size="sm" className="shrink-0" onClick={() => copyToClipboard(String(value), key)}>
                              {copiedHash === key ? <CheckCircle2 className="size-4 mr-2" /> : <Copy className="size-4 mr-2" />}
                              {copiedHash === key ? "Copiado" : "Copiar"}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Fingerprint className="text-primary size-5" /> Hashes Perceptuales</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3">
                        {Object.entries(hashesData.perceptual || {}).map(([key, value]) => (
                          <div key={key} className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="min-w-0 flex flex-col gap-1">
                              <p className="text-xs font-semibold uppercase text-primary">{key}</p>
                              <p className="font-mono text-xs sm:text-sm text-muted-foreground truncate">{String(value)}</p>
                            </div>
                            <Button variant="secondary" size="sm" className="shrink-0" onClick={() => copyToClipboard(String(value), key)}>
                              {copiedHash === key ? <CheckCircle2 className="size-4 mr-2" /> : <Copy className="size-4 mr-2" />}
                              {copiedHash === key ? "Copiado" : "Copiar"}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="compresion" className="flex flex-col gap-6 m-0">
                {compressionData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg"><Layers className="text-primary size-5" /> Detalles de Compresión</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">Formato Inferido</p><p className="font-medium text-sm uppercase">{compressionData.format || "N/D"}</p></div>
                      <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">Modo de Color</p><p className="font-medium text-sm uppercase">{compressionData.mode || "N/D"}</p></div>
                      <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">Tamaño en Disco</p><p className="font-medium text-sm">{compressionData.size_bytes?.toLocaleString() || "N/D"} bytes</p></div>
                      <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">¿Es Progresivo?</p><p className="font-medium text-sm">{compressionData.compression?.progressive ? "Sí" : "No"}</p></div>
                      <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col gap-1"><p className="text-xs text-muted-foreground">Optimizado</p><p className="font-medium text-sm">{compressionData.compression?.optimize ? "Sí" : "No"}</p></div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
