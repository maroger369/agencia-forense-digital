"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Eye, Search, Filter,
  ArrowUpDown, Shield
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";

const statusFilterOptions = [
  { value: "", label: "Todos" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "REVISANDO", label: "En Revisión" },
  { value: "TERMINADO", label: "Completado" },
  { value: "RECEPCIONADO", label: "Recepcionado" },
];

export default function AdminEvidenciasPage() {
  const router = useRouter();
  const [evidencias, setEvidencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEvidencias();
  }, [statusFilter, page]);

  const fetchEvidencias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/evidencias?${params}`);
      if (!res.ok) { router.push("/auth/login"); return; }
      const data = await res.json();
      setEvidencias(data.evidencias || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const filteredEvidencias = evidencias.filter((e) =>
    e.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Evidencias</h1>
          <p className="text-muted-foreground">
            Administra y revisa las solicitudes de certificación
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por archivo o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-2">
          {statusFilterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredEvidencias.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron evidencias</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Archivo</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">CI</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pago</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvidencias.map((ev) => (
                    <tr key={ev.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {ev.originalName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{ev.user?.name || "—"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{ev.user?.ci || "—"}</td>
                      <td className="p-4">{getStatusBadge(ev.status)}</td>
                      <td className="p-4">
                        {ev.paymentVerified ? (
                          <Badge variant="success">Verificado</Badge>
                        ) : (
                          <Badge variant="warning">Pendiente</Badge>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(ev.createdAt).toLocaleDateString("es-BO")}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/evidencias/${ev.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                page === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
