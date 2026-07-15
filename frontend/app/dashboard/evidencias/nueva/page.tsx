"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, Shield, FileText, CreditCard, ArrowLeft, X, CheckCircle2, QrCode } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import Link from "next/link";

export default function NewEvidencePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState<"upload" | "payment" | "success">("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [evidenceId, setEvidenceId] = useState("");
  const [amount] = useState(50.0);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      processFile(droppedFile);
    }
  }, []);

  const processFile = (selected: File) => {
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
    setError("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Debes seleccionar una imagen");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", description);

      const res = await fetch("/api/evidencias", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear solicitud");
      }

      setEvidenceId(data.evidence.id);
      setStep("payment");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("success");
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold">Nueva Solicitud de Certificación</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { id: "upload", label: "Subir Imagen", icon: Upload },
            { id: "payment", label: "Pago", icon: CreditCard },
            { id: "success", label: "Confirmación", icon: CheckCircle2 },
          ].map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isComplete = 
              (s.id === "upload" && step !== "upload") ||
              (s.id === "payment" && step === "success");

            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : isComplete
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
                {i < 2 && <div className="w-12 h-px bg-border mx-2" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Subir Evidencia Digital</CardTitle>
                <CardDescription>
                  Selecciona la imagen que deseas certificar (formatos: JPG, PNG, WEBP)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/50 transition-all rounded-2xl p-12 text-center cursor-pointer bg-background"
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {preview ? (
                    <div className="relative inline-block">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-72 rounded-xl shadow-2xl object-contain"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg mb-1">Arrastra tu imagen aquí</p>
                      <p className="text-sm text-muted-foreground">
                        o haz clic para seleccionar
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <label className="text-sm font-medium text-foreground/80 mb-1.5 block">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe brevemente el contexto de la evidencia..."
                    className="w-full h-20 rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                {error && (
                  <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                    {error}
                  </div>
                )}

                <div className="mt-6 flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Costo de Certificación</p>
                    <p className="text-xs text-muted-foreground">
                      Bs. {amount.toFixed(2)} - Por imagen certificada
                    </p>
                  </div>
                  <Button onClick={handleSubmit} disabled={!file || loading}>
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Continuar al Pago"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === "payment" && (
          <div className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Realizar Pago</CardTitle>
                <CardDescription>
                  Escanea el código QR para realizar el pago de Bs. {amount.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center p-6">
                  <div className="bg-white p-4 rounded-2xl">
                    <QrCode className="w-48 h-48 text-black" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">Datos del Pago</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Transferencia o depósito a:
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-8">
                        <span className="text-muted-foreground">Banco:</span>
                        <span className="font-medium">Banco Mercantil Santa Cruz</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="text-muted-foreground">Titular:</span>
                        <span className="font-medium">Agencia Forense Digital</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="text-muted-foreground">NIT:</span>
                        <span className="font-medium">123456789</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="text-muted-foreground">Cuenta:</span>
                        <span className="font-medium">123-456789-0-1</span>
                      </div>
                      <div className="flex justify-between gap-8">
                        <span className="text-muted-foreground">Monto:</span>
                        <span className="font-bold text-lg text-primary">
                          Bs. {amount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-4">
                      <div>
                        <label className="text-sm font-medium text-foreground/80 mb-1.5 block">
                          Comprobante de Pago
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Confirmar Pago
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="animate-fade-in text-center">
            <Card>
              <CardContent className="p-12">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  ¡Solicitud Recibida!
                </h2>
                <p className="text-muted-foreground mb-2">
                  Tu evidencia ha sido registrada exitosamente.
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  Recibirás una notificación cuando el análisis forense esté completo.
                </p>
                <div className="flex justify-center gap-4">
                  <Link href={`/dashboard/evidencias/${evidenceId}`}>
                    <Button variant="outline">
                      Ver Detalle
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button>
                      Ir al Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
