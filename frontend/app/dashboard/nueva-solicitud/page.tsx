"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PortalLayout from "@/app/components/PortalLayout";
import { Button } from "@/app/components/ui/button";

export default function NuevaSolicitud() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor, selecciona una imagen.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    try {
      const res = await fetch("/api/evidencias", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Ocurrió un error al subir la solicitud.");
      }
    } catch (err) {
      setError("Error de red al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout>
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm max-w-2xl">
        <h2 className="text-lg font-bold mb-2">Nueva solicitud de análisis</h2>
        <p className="text-sm text-muted-foreground mb-6">Sube la evidencia digital para iniciar el proceso de peritaje. Se requiere el archivo original sin alteraciones posteriores al incidente.</p>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4 border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div className="mb-5">
            <label className="block text-xs font-semibold text-muted-foreground mb-2">EVIDENCIA FOTOGRÁFICA</label>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/30 transition cursor-pointer"
              onClick={() => document.getElementById("fileUpload")?.click()}
            >
              <svg className="w-8 h-8 text-muted-foreground mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p className="text-sm font-medium">Haz clic para subir o arrastra la imagen aquí</p>
              <p className="text-xs text-muted-foreground mt-1">Formatos soportados: JPG, PNG. Tamaño máximo 10MB.</p>
              
              {file && (
                <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded text-xs font-medium border border-primary/20">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  {file.name}
                </div>
              )}
            </div>
            <input 
              id="fileUpload" 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-muted-foreground mb-2">DESCRIPCIÓN DEL CASO (Opcional)</label>
            <textarea 
              className="w-full bg-background border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
              rows={4} 
              placeholder="Ej. Fotografía capturada para probar la ubicación del incidente..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !file}
            >
              {loading ? "Subiendo..." : "Enviar Solicitud"}
            </Button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
