"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Shield, FileText, Eye, Activity,
  CheckCircle2, AlertTriangle, QrCode, Download,
  ImageIcon, Zap, Clock, Search, Lock
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
  const [activeTab, setActiveTab] = useState("resumen");

  let reportData: any = null;
  let objectsData: any = null;
  let steganographyData: any = null;

  if (evidence?.analysis) {
    if (evidence.analysis.forensicReport) {
      try {
        reportData = typeof evidence.analysis.forensicReport === "string"
          ? JSON.parse(evidence.analysis.forensicReport)
          : evidence.analysis.forensicReport;
      } catch (e) {
        console.error("Error parsing forensic report:", e);
      }
    }
    
    if (evidence.analysis.objectsData) {
      try {
        objectsData = typeof evidence.analysis.objectsData === "string"
          ? JSON.parse(evidence.analysis.objectsData)
          : evidence.analysis.objectsData;
      } catch (e) {
        console.error("Error parsing objects data:", e);
      }
    }

    if (evidence.analysis.steganographyData) {
      try {
        steganographyData = typeof evidence.analysis.steganographyData === "string"
          ? JSON.parse(evidence.analysis.steganographyData)
          : evidence.analysis.steganographyData;
      } catch (e) {
        console.error("Error parsing steganography data:", e);
      }
    }
  }

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
              src={evidence.imagePath?.replace("http://localhost:8000", process.env.NODE_ENV === "production" ? "https://api-python-forense.onrender.com" : (process.env.NEXT_PUBLIC_FORENSIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000"))}
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
        <Card className="border-forensic-blue/30 mt-6">
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
                <p className="text-2xl font-bold">
                  {evidence.analysis.elaScore !== null && evidence.analysis.elaScore !== undefined
                    ? `${Number(evidence.analysis.elaScore).toFixed(2)}%`
                    : "N/A"}
                </p>
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

            {reportData && (
              <div className="mt-8 space-y-6 mb-8">
                <div className="flex border-b overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("resumen")}
                    className={`whitespace-nowrap pb-2 px-4 text-sm font-medium transition-colors ${activeTab === "resumen" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Resumen Técnico
                  </button>
                  <button
                    onClick={() => setActiveTab("parametros")}
                    className={`whitespace-nowrap pb-2 px-4 text-sm font-medium transition-colors ${activeTab === "parametros" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Parámetros y Metadatos
                  </button>
                  <button
                    onClick={() => setActiveTab("explicacion")}
                    className={`whitespace-nowrap pb-2 px-4 text-sm font-medium transition-colors ${activeTab === "explicacion" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Explicación de Evaluación
                  </button>
                </div>

                {activeTab === "resumen" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-muted/30 p-4 rounded-xl border border-muted">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Dictamen</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{reportData.resumen}</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-xl border border-muted">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-primary" /> Recomendación</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{reportData.recomendacion}</p>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-xl border border-muted">
                       <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Huellas Digitales (Hashes)</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {Object.entries(reportData.hashes || {}).map(([key, val]) => val ? (
                           <div key={key} className="flex flex-col">
                             <span className="text-xs font-semibold text-muted-foreground uppercase">{key}</span>
                             <span className="text-xs font-mono bg-background p-1.5 rounded border mt-1 truncate" title={val as string}>{val as string}</span>
                           </div>
                         ) : null)}
                       </div>
                    </div>

                    {objectsData && (
                      <div className="bg-muted/30 p-4 rounded-xl border border-muted">
                        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Search className="w-4 h-4 text-primary" /> Detección de Objetos (YOLOv8)</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{objectsData.summary || "Sin objetos detectados"}</p>
                      </div>
                    )}

                    {steganographyData && (
                      <div className="bg-muted/30 p-4 rounded-xl border border-muted">
                        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> Esteganografía</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{steganographyData.summary || "No se detectó información oculta"}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "parametros" && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Detalles Técnicos Extraídos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(reportData.detalles || {}).map(([key, val]) => (
                        <div key={key} className="bg-muted/30 p-3 rounded-xl border border-muted">
                          <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-sm font-medium mt-1 truncate" title={val as string}>{val as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "explicacion" && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-muted/20 p-5 rounded-xl border border-muted space-y-3">
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <Activity className="w-5 h-5" /> 
                        ¿Qué es el Análisis ELA (Error Level Analysis)?
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        El <strong>Error Level Analysis (ELA)</strong> es una técnica de análisis forense digital que identifica áreas dentro de una imagen que se encuentran en diferentes niveles de compresión. En las imágenes JPEG, toda la imagen debería estar aproximadamente al mismo nivel de error. Si una sección de la imagen está a un nivel de error significativamente diferente (mostrándose más brillante o con colores intensos en la vista ELA), probablemente indica una modificación digital (como un montaje o una alteración reciente).
                      </p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside ml-2">
                        <li><strong>Score &lt; 18%:</strong> Considerado normal. La compresión es uniforme a lo largo de la imagen.</li>
                        <li><strong>Score 18% - 50%:</strong> Nivel medio. Puede indicar múltiples guardados o alteraciones menores en ciertas regiones.</li>
                        <li><strong>Score &gt; 50%:</strong> Nivel alto. Alta probabilidad de manipulación o empalme de imágenes de distintas fuentes.</li>
                      </ul>
                    </div>

                    <div className="bg-muted/20 p-5 rounded-xl border border-muted space-y-3">
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" /> 
                        Metadatos EXIF y Análisis de Ruido
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Los metadatos <strong>EXIF (Exchangeable Image File Format)</strong> son datos incrustados en la imagen por la cámara en el momento de la captura. Proveen información sobre el dispositivo, exposición, fecha y si se utilizó software de edición.
                      </p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside ml-2">
                        <li><strong>Software:</strong> Si este campo muestra nombres como "Adobe Photoshop" o "GIMP", confirma que la imagen pasó por un programa de edición después de su captura.</li>
                        <li><strong>Ausencia de EXIF:</strong> La falta de información de la cámara en fotos que parecen reales sugiere que los metadatos fueron eliminados (stripping) intencionalmente o la imagen proviene de redes sociales, las cuales suelen limpiar estos datos.</li>
                        <li><strong>Ruido y Nitidez:</strong> El análisis de la varianza del ruido puede revelar zonas "demasiado suaves" o "anormalmente nítidas", lo que evidencia el uso de pinceles de clonado, herramientas de desenfoque o manipulación localizada.</li>
                      </ul>
                    </div>

                    <div className="bg-muted/20 p-5 rounded-xl border border-muted space-y-3">
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <FileText className="w-5 h-5" /> 
                        Hashes Criptográficos y Perceptuales
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Los hashes son firmas digitales únicas generadas a partir de la imagen. Sirven para verificar su integridad y buscar similitudes.
                      </p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside ml-2">
                        <li><strong>Hashes Criptográficos (MD5, SHA-256):</strong> Cambian completamente si se altera un solo píxel de la imagen. Se utilizan para garantizar que la evidencia no ha sido modificada desde su adquisición.</li>
                        <li><strong>Hashes Perceptuales (pHash, dHash):</strong> Analizan la estructura visual de la imagen. Si dos imágenes tienen hashes perceptuales muy similares, significa que visualmente son casi idénticas, incluso si una de ellas ha sido redimensionada o comprimida.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {evidence.certificate && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-forensic-gold/10 border border-forensic-gold/30 pt-4">
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
