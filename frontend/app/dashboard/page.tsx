import React from "react";
import PortalLayout from "@/app/components/PortalLayout";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getServerUser } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { FileText, FolderSearch, PlusCircle } from "lucide-react";

export default async function DashboardPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/auth/login");
  }

  const evidencias = await prisma.evidence.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDIENTE":
        return (
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-xs font-medium border border-amber-500/20">
            Pendiente pago
          </span>
        );
      case "REVISANDO":
        return (
          <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded text-xs font-medium border border-sky-500/20">
            En revisión
          </span>
        );
      case "TERMINADO":
        return (
          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-medium border border-emerald-500/20">
            Análisis completado
          </span>
        );
      default:
        return (
          <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-medium border border-border">
            {status}
          </span>
        );
    }
  };

  return (
    <PortalLayout>
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            Mis solicitudes
          </h2>
          {evidencias.length > 0 && (
            <Link href="/dashboard/nueva-solicitud">
              <Button size="sm" className="w-full sm:w-auto">
                <PlusCircle className="w-4 h-4 mr-2" />
                Nueva solicitud
              </Button>
            </Link>
          )}
        </div>

        {evidencias.length === 0 ? (
          <div className="text-center py-16 px-4 bg-muted/20 rounded-lg border border-dashed border-border mt-4 flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary mb-2">
              <FolderSearch className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-medium text-base mb-1">
                No tienes solicitudes pendientes
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Aún no has enviado ninguna evidencia digital para análisis.
                Crea tu primera solicitud para comenzar.
              </p>
            </div>
            <Link href="/dashboard/nueva-solicitud">
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Crear primera solicitud
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto w-full max-w-full rounded-lg border border-border mt-4">
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
                {evidencias.map((evidence: any) => (
                  <tr
                    key={evidence.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 flex items-center gap-2 font-medium">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {evidence.originalName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(evidence.createdAt).toLocaleDateString("es-BO")}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(evidence.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {evidence.status === "PENDIENTE" ? (
                        <Link href={`/dashboard/pagar/${evidence.id}`}>
                          <Button size="sm">
                            Pagar (Bs. {evidence.amount})
                          </Button>
                        </Link>
                      ) : evidence.status === "TERMINADO" ? (
                        <Link href={`/dashboard/evidencias/${evidence.id}`}>
                          <Button size="sm" variant="outline">
                            Ver resultado
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          En proceso
                        </span>
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
