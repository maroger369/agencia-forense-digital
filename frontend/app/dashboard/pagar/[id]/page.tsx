"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PortalLayout from "@/app/components/PortalLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PagoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvidence();
  }, [id]);

  const fetchEvidence = async () => {
    try {
      const res = await fetch(`/api/evidencias/${id}/pago`);
      if (res.ok) {
        const data = await res.json();
        setEvidence(data.payment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("paymentProof", file);
      
      const res = await fetch(`/api/evidencias/${id}/pago`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        alert(data.error || "Error al subir comprobante");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <PortalLayout><div className="p-10 text-center text-muted-foreground">Cargando detalles de pago...</div></PortalLayout>;
  }

  if (!evidence) {
    return <PortalLayout><div className="p-10 text-center text-red-500">No se encontró la solicitud.</div></PortalLayout>;
  }

  if (evidence.status !== "PENDIENTE") {
    return (
      <PortalLayout>
        <div className="max-w-md mx-auto mt-10">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <CardTitle>Pago ya procesado</CardTitle>
              <CardDescription>Esta solicitud ya no está pendiente de pago.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/dashboard">
                <Button>Volver al Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">← Volver</Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Pago de certificación</h2>
            <p className="text-sm text-muted-foreground">Solicitud {id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instrucciones y QR */}
          <Card>
            <CardHeader>
              <CardTitle>Código QR de Pago</CardTitle>
              <CardDescription>Escanea el QR con tu aplicación bancaria</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-full bg-muted/30 border border-border rounded-lg p-4 mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Servicio</span>
                  <span className="font-medium">Certificación de imagen</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto total</span>
                  <span className="font-bold text-lg text-primary">Bs. {evidence.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="relative w-56 h-56 bg-white border-2 border-slate-200 rounded-xl p-3 flex items-center justify-center shadow-sm">
                <img src="/certificados/qr/qr-pago.png" alt="QR de Pago" className="w-full h-full object-contain rounded-lg" />
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">QR estático · Banco Unión · Cuenta AFD Bolivia</p>
            </CardContent>
          </Card>

          {/* Subir comprobante */}
          <Card>
            <CardHeader>
              <CardTitle>Subir comprobante</CardTitle>
              <CardDescription>Adjunta la captura o foto del pago realizado.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="receipt" className="sr-only">Comprobante</Label>
                  <label htmlFor="receipt" className={`flex flex-col items-center justify-center border-2 border-dashed ${file ? 'border-primary bg-primary/5 p-4' : 'border-border p-8'} rounded-xl hover:border-primary hover:bg-muted/50 cursor-pointer transition-colors relative overflow-hidden`}>
                    {previewUrl ? (
                      <div className="flex flex-col items-center justify-center w-full">
                        <img src={previewUrl} alt="Vista previa" className="max-h-48 object-contain rounded-md mb-3" />
                        <span className="text-sm font-medium text-foreground text-center truncate max-w-[200px]">
                          {file?.name}
                        </span>
                        <span className="text-xs text-primary mt-1 hover:underline">Cambiar imagen</span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground text-center">
                          Seleccionar imagen...
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">Solo JPG o PNG</span>
                      </>
                    )}
                    <Input 
                      id="receipt" 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        const selected = e.target.files?.[0];
                        if (selected) {
                          setFile(selected);
                          const url = URL.createObjectURL(selected);
                          setPreviewUrl(url);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3 text-sm text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>Una vez enviado, tu solicitud pasará a estado <b>En revisión</b> cuando la agencia confirme el pago.</p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="submit" disabled={!file || uploading} className="w-full">
                    {uploading ? "Enviando..." : "Enviar comprobante"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
