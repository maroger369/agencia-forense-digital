"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, FileText, Clock, CheckCircle2, AlertTriangle,
  Users, Search, Eye, TrendingUp, BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    revisando: 0,
    terminados: 0,
    clientes: 0,
  });
  const [recentEvidencias, setRecentEvidencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/evidencias?limit=5");
      if (!res.ok) { router.push("/auth/login"); return; }
      const data = await res.json();

      const evidencias = data.evidencias || [];
      setRecentEvidencias(evidencias);
      setStats({
        total: data.pagination?.total || evidencias.length,
        pendientes: evidencias.filter((e: any) => e.status === "PENDIENTE").length,
        revisando: evidencias.filter((e: any) => e.status === "REVISANDO").length,
        terminados: evidencias.filter((e: any) => ["TERMINADO", "RECEPCIONADO"].includes(e.status)).length,
        clientes: new Set(evidencias.map((e: any) => e.userId)).size,
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestión de evidencias y certificaciones forenses
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Total Evidencias", value: stats.total, icon: FileText, color: "text-blue-400" },
          { label: "Pendientes", value: stats.pendientes, icon: Clock, color: "text-amber-400" },
          { label: "En Revisión", value: stats.revisando, icon: Search, color: "text-blue-400" },
          { label: "Completados", value: stats.terminados, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Clientes", value: stats.clientes, icon: Users, color: "text-purple-400" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color} opacity-50`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Acciones rápidas */}
      <div className="flex gap-3">
        <Link href="/admin/evidencias">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Eye className="w-4 h-4" />
            Ver todas las evidencias
          </span>
        </Link>
      </div>

      {/* Recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Evidencias Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvidencias.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay evidencias registradas
            </p>
          ) : (
            <div className="space-y-3">
              {recentEvidencias.map((ev: any) => (
                <Link key={ev.id} href={`/admin/evidencias/${ev.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{ev.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {ev.user?.name || "Cliente"} • {new Date(ev.createdAt).toLocaleDateString("es-BO")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(ev.status)}
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
