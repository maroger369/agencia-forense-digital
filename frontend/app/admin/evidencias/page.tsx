"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

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
      const res = await fetch(`/api/admin/evidencias?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEvidencias(data.evidencias || []);
      } else if (res.status === 404) {
        const altRes = await fetch(`/api/evidencias?${params}`);
        if (altRes.ok) {
          const data = await altRes.json();
          setEvidencias(data.evidencias || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PENDIENTE": return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-medium border border-amber-500/20">Pendiente de pago</span>;
      case "REVISANDO": return <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded text-[10px] font-medium border border-sky-500/20">En revisión</span>;
      case "TERMINADO": return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-500/20">Análisis finalizado</span>;
      default: return <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px] font-medium border border-border">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-6 rounded-3xl shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text">Dashboard de Casos</h1>
            <p className="text-sm text-muted-foreground mt-1">Agencia de Análisis Forense Digital • v2.0</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-5 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-bold">Listado de Evidencias</h2>
          
          <div className="flex bg-muted p-1 rounded-md overflow-x-auto max-w-full">
            {["TODAS", "PENDIENTE", "REVISANDO", "TERMINADO"].map(status => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition whitespace-nowrap ${statusFilter === status ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {status === "TODAS" ? "Todas" : status === "PENDIENTE" ? "Nuevas" : status === "REVISANDO" ? "En Proceso" : "Completadas"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">Cargando evidencias...</div>
        ) : evidencias.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No se encontraron casos.</div>
        ) : (
          <div className="overflow-x-auto p-5">
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
                      <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      {evidence.originalName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(evidence.createdAt).toLocaleDateString("es-BO")}</td>
                    <td className="px-4 py-3">
                      {getStatusBadge(evidence.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/analisis/${evidence.id}`}>
                        <Button size="sm" className="flex items-center gap-2">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
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
