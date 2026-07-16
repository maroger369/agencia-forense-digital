"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Shield, LayoutDashboard, FileSearch, FileBadge, LogOut, Moon, Sun, CheckCircle2, ChevronRight, Search, FileText, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push("/auth/login");
        }
      } catch {
        router.push("/auth/login");
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  const isClient = user?.role === "CLIENTE";
  const isAdmin = user?.role === "ADMIN" || user?.role === "REVISOR";

  return (
    <div className="bg-background text-foreground min-h-screen font-sans flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <Image src="/logo/logo-afd.png" alt="AFD Logo" width={32} height={32} className="w-8 h-8 object-contain" priority />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold leading-tight">Agencia de Análisis Forense Digital</h1>
              <p className="text-xs text-muted-foreground leading-tight">Cochabamba · Bolivia · Demo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Cambiar tema"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <span className="hidden md:flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Conectado como {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Salir</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden w-9 h-9 ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 pt-16 bg-background/95 backdrop-blur-sm animate-fade-in">
          <div className="h-full overflow-y-auto p-4 border-b border-border shadow-lg">
            <nav className="space-y-6">
              {isClient && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Cliente</p>
                  <div className="space-y-1">
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`w-full flex items-center gap-2 px-3 py-3 rounded-md text-sm transition-colors ${pathname === "/dashboard" ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Mis solicitudes</span>
                    </Link>
                    <Link href="/dashboard/nueva-solicitud" onClick={() => setIsMobileMenuOpen(false)} className={`w-full flex items-center gap-2 px-3 py-3 rounded-md text-sm transition-colors ${pathname === "/dashboard/nueva-solicitud" ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Nueva solicitud</span>
                    </Link>
                  </div>
                </div>
              )}

              {isAdmin && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Agencia</p>
                  <div className="space-y-1">
                    <Link href="/admin/evidencias" onClick={() => setIsMobileMenuOpen(false)} className={`w-full flex items-center gap-2 px-3 py-3 rounded-md text-sm transition-colors ${pathname === "/admin/evidencias" ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard Agencia</span>
                    </Link>
                    <Link href="/admin/analisis" onClick={() => setIsMobileMenuOpen(false)} className={`w-full flex items-center gap-2 px-3 py-3 rounded-md text-sm transition-colors ${pathname.startsWith("/admin/analisis") ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                      <FileSearch className="w-5 h-5" />
                      <span>Análisis Forense</span>
                    </Link>
                    <Link href="/admin/certificados" onClick={() => setIsMobileMenuOpen(false)} className={`w-full flex items-center gap-2 px-3 py-3 rounded-md text-sm transition-colors ${pathname.startsWith("/admin/certificados") ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                      <FileBadge className="w-5 h-5" />
                      <span>Certificados Emitidos</span>
                    </Link>
                  </div>
                </div>
              )}
            </nav>
            <p className="text-xs text-muted-foreground mt-8 px-2">v0.1 · Demo interna · Datos reales.</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          <nav className="bg-card border border-border rounded-xl p-3 space-y-4 shadow-sm transition-colors duration-200">
            
            {isClient && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Cliente</p>
                <div className="space-y-1">
                  <Link href="/dashboard" className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${pathname === "/dashboard" ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Mis solicitudes</span>
                  </Link>
                  <Link href="/dashboard/nueva-solicitud" className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${pathname === "/dashboard/nueva-solicitud" ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Nueva solicitud</span>
                  </Link>
                </div>
              </div>
            )}

            {isAdmin && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Agencia</p>
                <div className="space-y-1">
                  <Link href="/admin/evidencias" className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${pathname === "/admin/evidencias" ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard Agencia</span>
                  </Link>
                  <Link href="/admin/analisis" className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${pathname.startsWith("/admin/analisis") ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                    <FileSearch className="w-4 h-4" />
                    <span>Análisis Forense</span>
                  </Link>
                  <Link href="/admin/certificados" className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${pathname.startsWith("/admin/certificados") ? "bg-primary text-primary-foreground font-medium shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                    <FileBadge className="w-4 h-4" />
                    <span>Certificados Emitidos</span>
                  </Link>
                </div>
              </div>
            )}
            
          </nav>
          <p className="text-xs text-muted-foreground mt-4 px-2">v0.1 · Demo interna · Datos reales.</p>
        </aside>

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
