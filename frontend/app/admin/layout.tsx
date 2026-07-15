"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Shield, LayoutDashboard, FileText, Users,
  ChevronLeft, LogOut, Menu
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/evidencias", label: "Evidencias", icon: FileText },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) { router.push("/auth/login"); return; }
      const data = await res.json();
      if (data.user.role === "CLIENTE") { router.push("/dashboard"); return; }
      setUser(data.user);
    } catch {
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-sidebar border-r border-border/50 transition-all duration-300 flex flex-col fixed h-full z-40`}
      >
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-forensic-purple p-2 rounded-xl flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">Admin Forense</p>
                <p className="text-xs text-sidebar-foreground truncate">
                  {user?.name || "Cargando..."}
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/50 space-y-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen && "rotate-180"}`} />
            {sidebarOpen && <span>Colapsar</span>}
          </button>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
