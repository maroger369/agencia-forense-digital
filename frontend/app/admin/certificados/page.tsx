"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileBadge, Download, Eye, QrCode } from "lucide-react";
import PortalLayout from "@/app/components/PortalLayout";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CertificadosPage() {
  const [evidencias, setEvidencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvidencias = async () => {
      try {
        const res = await fetch("/api/evidencias");
        if (res.ok) {
          const data = await res.json();
          // Filter only evidences that have a certificate
          const certificated = (data.evidencias || []).filter((e: any) => e.certificate);
          setEvidencias(certificated);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvidencias();
  }, []);

  return (
    <PortalLayout>
      <div className="bg-card border border-border rounded-xl shadow-sm p-5 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileBadge className="w-5 h-5 text-primary" />
              Certificados Emitidos
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Documentos con validez legal generados por la agencia.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Cargando certificados...</div>
        ) : evidencias.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center">
            <QrCode className="w-10 h-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-lg">No hay certificados</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
              Aún no se ha generado ningún certificado digital. Estos se generan después de completar un análisis forense.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Hash de Certificado</th>
                  <th className="px-4 py-3 font-medium">Evidencia</th>
                  <th className="px-4 py-3 font-medium">Emitido en</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {evidencias.map((evidence) => (
                  <tr key={evidence.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-primary">
                      {evidence.certificate.certificateHash.substring(0, 32)}...
                    </td>
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      {evidence.originalName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(evidence.certificate.createdAt).toLocaleDateString("es-BO")}
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <a href={`/api/evidencias/${evidence.id}/certificado`} download>
                        <Button variant="outline" size="sm" title="Descargar">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        title="Previsualizar"
                        onClick={() => setSelectedPdf(`/api/evidencias/${evidence.id}/certificado`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!selectedPdf} onOpenChange={(open) => !open && setSelectedPdf(null)}>
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Previsualización del Certificado</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-muted/20 w-full h-full relative">
            {selectedPdf && (
              <iframe 
                src={selectedPdf} 
                className="w-full h-full border-0 absolute inset-0"
                title="Certificado PDF"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
