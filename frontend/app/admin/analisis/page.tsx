"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileSearch, ArrowRight, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import PortalLayout from "@/app/components/PortalLayout";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

export default function AnalisisPage() {
  const [evidencias, setEvidencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvidencias = async () => {
      try {
        const res = await fetch("/api/evidencias");
        if (res.ok) {
          const data = await res.json();
          // Filter only evidences that have an analysis
          const analyzed = (data.evidencias || []).filter((e: any) => e.analysis);
          setEvidencias(analyzed);
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
              <FileSearch className="w-5 h-5 text-primary" />
              Historial de Análisis Forense
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Todos los peritajes realizados en la plataforma.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Cargando historial...</div>
        ) : evidencias.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center">
            <Shield className="w-10 h-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-lg">No hay análisis registrados</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
              Aún no se ha completado ningún análisis forense. Ve al Dashboard para procesar las evidencias pendientes.
            </p>
            <Link href="/admin/evidencias" className="mt-4">
              <Button>Ir al Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">ID Evidencia</th>
                  <th className="px-4 py-3 font-medium">Archivo</th>
                  <th className="px-4 py-3 font-medium">Veredicto ELA</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {evidencias.map((evidence) => (
                  <tr key={evidence.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      #{evidence.id.slice(-6)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {evidence.originalName}
                    </td>
                    <td className="px-4 py-3">
                      {evidence.analysis?.elaResult === "AUTENTICA" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Auténtica
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                          <AlertTriangle className="w-3 h-3" /> Manipulada
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {(evidence.analysis?.elaScore || 0).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(evidence.analysis?.createdAt).toLocaleDateString("es-BO")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/analisis/${evidence.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver Reporte <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
