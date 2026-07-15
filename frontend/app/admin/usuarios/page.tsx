"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Shield, Search, Mail, Phone, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";

type User = {
  id: string;
  email: string;
  name: string;
  role: "CLIENTE" | "REVISOR" | "ADMIN";
  ci: string;
  phone: string;
  active: boolean;
  createdAt: string;
  _count: { evidences: number };
};

const roleConfig: Record<string, { label: string; variant: "default" | "success" | "info" | "purple" }> = {
  CLIENTE: { label: "Cliente", variant: "default" },
  REVISOR: { label: "Revisor", variant: "info" },
  ADMIN: { label: "Admin", variant: "purple" },
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/usuarios");
      if (!res.ok) { router.push("/auth/login"); return; }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.ci.includes(searchTerm)
  );

  const stats = {
    total: users.length,
    clientes: users.filter((u) => u.role === "CLIENTE").length,
    revisores: users.filter((u) => u.role === "REVISOR").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra los usuarios registrados en el sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Usuarios", value: stats.total, icon: Users, color: "text-blue-400" },
          { label: "Clientes", value: stats.clientes, icon: Users, color: "text-muted-foreground" },
          { label: "Revisores", value: stats.revisores, icon: Shield, color: "text-blue-400" },
          { label: "Administradores", value: stats.admins, icon: Shield, color: "text-purple-400" },
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o CI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contacto</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">CI</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rol</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Evidencias</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Registro</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const role = roleConfig[user.role] || { label: user.role, variant: "default" as const };
                    return (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs flex items-center gap-1">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="text-xs flex items-center gap-1">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm">{user.ci}</td>
                        <td className="p-4">
                          <Badge variant={role.variant}>{role.label}</Badge>
                        </td>
                        <td className="p-4 text-sm">{user._count.evidences}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("es-BO")}
                        </td>
                        <td className="p-4">
                          {user.active ? (
                            <Badge variant="success">Activo</Badge>
                          ) : (
                            <Badge variant="danger">Inactivo</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
