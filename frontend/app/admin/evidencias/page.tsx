"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Shield, FileText, Search, FileX2 } from "lucide-react";

export default function AdminEvidenciasPage() {
  const [evidencias, setEvidencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("TODAS");

  useEffect(() => {
    fetchEvidencias();
  }, [statusFilter]);

  const fetchEvidencias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "TODAS") {
        params.set("status", statusFilter);
      }
      
      const res = await fetch(`/api/evidencias?${params}`);
      
      if (res.ok) {
        const data = await res.json();
        setEvidencias(data.evidencias || []);
      } else {
        setEvidencias([]);
      }
    } catch (err) {
      console.error("Error fetching evidencias:", err);
      setEvidencias([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PENDIENTE": return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-xs font-medium border border-amber-500/20">Pendiente de pago</span>;
      case "REVISANDO": return <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded text-xs font-medium border border-sky-500/20">En revisión</span>;
      case "TERMINADO": return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-medium border border-emerald-500/20">Análisis finalizado</span>;
      default: return <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-medium border border-border">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text">Dashboard de Casos</h1>
            <p className="text-sm text-muted-foreground mt-1">Agencia de Análisis Forense Digital • v2.0</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm w-full overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h2 className="text-lg font-bold">Listado de Evidencias</h2>
          
          <div className="flex bg-muted p-1 rounded-md overflow-x-auto max-w-full w-full lg:w-auto snap-x">
            {["TODAS", "PENDIENTE", "REVISANDO", "TERMINADO"].map(status => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                disabled={loading}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition whitespace-nowrap disabled:opacity-50 ${statusFilter === status ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {status === "TODAS" ? "Todas" : status === "PENDIENTE" ? "Nuevas" : status === "REVISANDO" ? "En Proceso" : "Completadas"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            Cargando evidencias...
          </div>
        ) : evidencias.length === 0 ? (
          <div className="text-center py-16 px-4 bg-muted/20 border border-dashed border-border flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary mb-2">
              <FileX2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-medium text-base mb-1">
                No se encontraron casos
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                No hay evidencias que coincidan con el filtro seleccionado.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto p-4 sm:p-5 w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente / Caso</th>
                  <th className="px-4 py-3 font-medium">Evidencia</th>
                  <th className="px-4 py-3 font-medium">Fecha Recepción</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {evidencias.map((evidence) => (
                  <tr key={evidence.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {evidence.user?.name || "Cliente Anónimo"} <span className="text-muted-foreground font-normal ml-2">CI: {evidence.user?.ci || "N/A"}</span>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {evidence.originalName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(evidence.createdAt).toLocaleDateString("es-BO")}</td>
                    <td className="px-4 py-3">
                      {getStatusBadge(evidence.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/analisis/${evidence.id}`}>
                        <Button size="sm" className="flex items-center gap-2">
                          <Search className="w-3 h-3" />
                          Analizar / Ver
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
    </div>
  );
}
