"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Shield, LayoutDashboard, FileText, Users,
  LogOut, Menu, PanelLeftClose, PanelLeftOpen, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

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
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-16"
        } bg-sidebar border-r border-border/50 transition-all duration-300 flex flex-col fixed inset-y-0 left-0 h-full z-40`}
      >
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 flex items-center justify-center">
              <Image src="/logo/logo-afd.png" alt="AFD Logo" width={40} height={40} className="w-10 h-10 object-contain rounded-xl" priority />
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
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-16"} flex flex-col min-h-screen w-full overflow-hidden`}>
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 px-4 md:px-6 backdrop-blur">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground flex"
              title={sidebarOpen ? "Colapsar menú" : "Expandir menú"}
            >
              {sidebarOpen ? (
                <>
                  <PanelLeftClose className="w-5 h-5 hidden md:block" />
                  <X className="w-5 h-5 md:hidden" />
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-5 h-5 hidden md:block" />
                  <Menu className="w-5 h-5 md:hidden" />
                </>
              )}
            </Button>
            <div className="flex items-center gap-2">
              {pathname.split("/").filter(Boolean).map((segment, index, arr) => {
              const isLast = index === arr.length - 1;
              const href = "/" + arr.slice(0, index + 1).join("/");
              const label = segment.charAt(0).toUpperCase() + segment.slice(1);
              return (
                <div key={href} className="flex items-center gap-2">
                  {index > 0 && <span>/</span>}
                  {isLast ? (
                    <span className="font-medium text-foreground">{label}</span>
                  ) : (
                    <Link href={href} className="hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  )}
                </div>
              );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
             <ThemeToggle />
          </div>
        </header>

        <div className="p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
