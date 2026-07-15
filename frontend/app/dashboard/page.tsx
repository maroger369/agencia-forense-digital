"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, Upload, Shield, Clock, CheckCircle2, 
  Search, Eye, Plus, AlertTriangle, QrCode, CreditCard 
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";

type Evidence = {
  id: string;
  originalName: string;
  status: string;
  amount: number;
  paymentVerified: boolean;
  createdAt: string;
  hash: string | null;
  analysis: any;
  certificate: any;
};

const statusConfig: Record<string, { label: string; variant: "warning" | "info" | "success" | "purple" }> = {
  PENDIENTE: { label: "Pendiente", variant: "warning" },
  REVISANDO: { label: "En Revisión", variant: "info" },
  TERMINADO: { label: "Completado", variant: "success" },
  RECEPCIONADO: { label: "Recepcionado", variant: "purple" },
};

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [evidencias, setEvidencias] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUser();
    fetchEvidencias();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) { router.push("/auth/login"); return; }
      const data = await res.json();
      setUser(data.user);
    } catch {
      router.push("/auth/login");
    }
  };

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

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: status, variant: "default" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredEvidencias = evidencias.filter((e) =>
    e.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = {
    total: evidencias.length,
    pendientes: evidencias.filter((e) => e.status === "PENDIENTE").length,
    revisando: evidencias.filter((e) => e.status === "REVISANDO").length,
    completados: evidencias.filter((e) => e.status === "TERMINADO" || e.status === "RECEPCIONADO").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-forensic-purple p-2 rounded-xl shadow-lg shadow-primary/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold">Agencia Forense Digital</h1>
              <p className="text-xs text-muted-foreground">Cliente</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name}
            </span>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/");
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Bienvenida */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-1">
            Bienvenido, {user?.name || "Usuario"}
          </h2>
          <p className="text-muted-foreground">
            Gestiona tus solicitudes de certificación forense
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
          {[
            { label: "Total Solicitudes", value: stats.total, icon: FileText, color: "text-blue-400" },
            { label: "Pendientes", value: stats.pendientes, icon: Clock, color: "text-amber-400" },
            { label: "En Revisión", value: stats.revisando, icon: Search, color: "text-blue-400" },
            { label: "Completados", value: stats.completados, icon: CheckCircle2, color: "text-emerald-400" },
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

        {/* Acciones */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/evidencias/nueva">
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              Nueva Solicitud
            </Button>
          </Link>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre de archivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Lista de Evidencias */}
        <div className="space-y-3 animate-fade-in">
          {filteredEvidencias.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay solicitudes aún</h3>
                <p className="text-muted-foreground mb-6">
                  Crea tu primera solicitud de certificación forense
                </p>
                <Link href="/dashboard/evidencias/nueva">
                  <Button>
                    <Plus className="w-4 h-4" />
                    Nueva Solicitud
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredEvidencias.map((evidence) => {
              const needsPayment = !evidence.paymentVerified;
              return (
                <Link key={evidence.id} href={`/dashboard/evidencias/${evidence.id}`}>
                  <Card className="hover:border-primary/50 transition-all duration-200 cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{evidence.originalName}</p>
                            <div className="flex items-center gap-3 mt-1">
                              {getStatusBadge(evidence.status)}
                              {needsPayment && (
                                <span className="flex items-center gap-1 text-xs text-amber-400">
                                  <CreditCard className="w-3 h-3" />
                                  Pago pendiente
                                </span>
                              )}
                              {evidence.certificate && (
                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                  <QrCode className="w-3 h-3" />
                                  Certificado generado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {new Date(evidence.createdAt).toLocaleDateString("es-BO")}
                          </span>
                          <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
