"use client";

import React, { useEffect, useState } from "react";
import PortalLayout from "@/app/components/PortalLayout";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

type Evidence = {
  id: string;
  originalName: string;
  status: string;
  amount: number;
  paymentVerified: boolean;
  createdAt: string;
  hash: string | null;
};

export default function ClientDashboard() {
  const [evidencias, setEvidencias] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvidencias = async () => {
      try {
        const res = await fetch("/api/evidencias");
        if (res.ok) {
          const data = await res.json();
          setEvidencias(data.evidencias);
        }
      } catch (err) {
        console.error("Error fetching evidencias:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvidencias();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PENDIENTE": return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-medium border border-amber-500/20">Pendiente pago</span>;
      case "REVISANDO": return <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded text-[10px] font-medium border border-sky-500/20">En revisión</span>;
      case "TERMINADO": return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-500/20">Análisis completado</span>;
      default: return <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px] font-medium border border-border">{status}</span>;
    }
  };

  return (
    <PortalLayout>
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          Mis solicitudes
        </h2>
        
        {loading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">Cargando solicitudes...</div>
        ) : evidencias.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed border-border mt-4">
            No tienes solicitudes pendientes.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border mt-4">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Evidencia</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {evidencias.map((evidence) => (
                  <tr key={evidence.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 flex items-center gap-2 font-medium">
                      <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      {evidence.originalName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(evidence.createdAt).toLocaleDateString("es-BO")}</td>
                    <td className="px-4 py-3">
                      {getStatusBadge(evidence.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {evidence.status === "PENDIENTE" ? (
                        <Link href={`/dashboard/pagar/${evidence.id}`}>
                          <Button size="sm">Pagar (Bs. {evidence.amount})</Button>
                        </Link>
                      ) : evidence.status === "TERMINADO" ? (
                        <Link href={`/dashboard/detalle/${evidence.id}`}>
                          <Button size="sm" variant="outline">Ver resultado</Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">En proceso</span>
                      )}
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
