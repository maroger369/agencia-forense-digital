"use client";

import { Shield, CheckCircle2, FileText, QrCode, ArrowRight, Scale, MapPin, Building2, ChevronRight, Lock, Zap, Moon, Sun } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const dashboardPath = user?.role === "ADMIN" || user?.role === "PERITO" ? "/admin/evidencias" : "/dashboard";

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      {/* Background Decorators */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 shadow-sm border border-border/50">
              <Image 
                src="/logo/logo-afd.png" 
                alt="AFD Logo" 
                width={32} 
                height={32} 
                className="w-8 h-8 object-contain"
                priority
              />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Agencia Forense Digital
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {user ? (
              <Link href={dashboardPath}>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all font-medium">
                  Ir al Panel
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-muted/50 transition-colors">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all font-medium">
                    Acceder al Portal
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 md:pt-36 md:pb-40 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border/50 text-sm font-medium mb-8 text-foreground/80 shadow-sm animate-fade-in-up">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Sistema Inteligente Activo en Cochabamba
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  Auditoría Forense <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">
                    Digital de Alta Precisión
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  La plataforma definitiva para certificar la autenticidad e integridad de imágenes digitales. Algoritmos criptográficos y análisis ELA con total validez legal y jurídica.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                  {user ? (
                    <Link href={dashboardPath}>
                      <Button size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-xl shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 transition-all group">
                        Ir al Panel Principal
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/register">
                        <Button size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-xl shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 transition-all group">
                          Certificar Evidencia
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href="/auth/login">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-xl border-border/80 hover:bg-muted/50 transition-all">
                          Validar Documento
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="relative hidden lg:block animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-[2.5rem] blur-3xl" />
                <div className="relative bg-card border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-xl">
                  {/* Decorative Mockup */}
                  <div className="h-12 border-b border-border/50 flex items-center px-6 gap-2 bg-muted/30">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="p-8 aspect-square flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                    <Image 
                      src="/logo/logo-afd.png" 
                      alt="Logo Mockup" 
                      width={200} 
                      height={200} 
                      className="mb-8 drop-shadow-2xl opacity-90 z-10"
                    />
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-full border border-emerald-500/20 font-semibold mb-4 z-10">
                      <Shield className="w-4 h-4" />
                      Análisis 100% Auténtico
                    </div>
                    <p className="text-muted-foreground z-10 max-w-xs text-sm">
                      Código Criptográfico Generado:
                      <br/>
                      <span className="font-mono text-foreground mt-2 block">0x8a9F...c3b1</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-muted/30 border-y border-border/50 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Arquitectura de Nivel Forense</h2>
              <p className="text-lg text-muted-foreground">
                Integración de múltiples capas de seguridad para garantizar que cada dictamen emitido sea irrefutable técnica y legalmente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Seguridad Inalterable",
                  desc: "Generación de hashes criptográficos SHA-256 para preservar la cadena de custodia.",
                },
                {
                  icon: Zap,
                  title: "Análisis ELA en Tiempo Real",
                  desc: "Error Level Analysis para identificar manipulaciones a nivel de píxel invisible al ojo humano.",
                },
                {
                  icon: Lock,
                  title: "Verificación Pública",
                  desc: "Auditoría instantánea mediante códigos QR que enlazan con nuestro registro inmutable.",
                }
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border/50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight">
                  Proceso Transparente y 
                  <span className="text-emerald-500 block">Auditable</span>
                </h2>
                <div className="space-y-8">
                  {[
                    { step: "01", title: "Carga Segura", desc: "Sube tu evidencia digital a nuestra bóveda segura." },
                    { step: "02", title: "Motor Forense", desc: "Nuestros algoritmos y peritos extraen metadatos y examinan anomalías." },
                    { step: "03", title: "Dictamen Legal", desc: "Se emite un documento certificado en PDF con firma y sello digital." }
                  ].map((s, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-muted border border-border/50 flex items-center justify-center font-bold text-xl text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                        {s.step}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{s.title}</h4>
                        <p className="text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-900/10 to-blue-900/10 rounded-[2.5rem] p-10 border border-border/50 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-20">
                    <Scale className="w-48 h-48" />
                 </div>
                 <div className="relative z-10">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-background border border-border text-sm font-semibold mb-6">
                      Marco Legal Vigente
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Conforme a la Ley 1173 (Bolivia)</h3>
                    <p className="text-muted-foreground leading-relaxed mb-8">
                      Nuestros informes técnicos están elaborados para tener peso jurídico total, permitiendo presentarlos como prueba válida en cualquier proceso de auditoría, administrativo o penal.
                    </p>
                    <ul className="space-y-4">
                      {["Custodia de la Cadena de Evidencia", "Dictamen Pericial Inapelable", "Sellos de Tiempo y Geolocalización"].map((el, k) => (
                        <li key={k} className="flex items-center gap-3 font-medium">
                           <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                           {el}
                        </li>
                      ))}
                    </ul>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Asegura tu Evidencia Hoy
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Únete a las empresas, firmas legales e instituciones que confían en nuestro estándar forense digital.
            </p>
            <Link href={user ? dashboardPath : "/auth/register"}>
              <Button size="lg" className="h-16 px-10 text-lg rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
                {user ? "Ir al Panel" : "Comenzar Proceso de Certificación"}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/logo/logo-afd.png" alt="AFD Logo" width={24} height={24} className="w-6 h-6 object-contain grayscale opacity-70" />
              <span className="font-semibold text-muted-foreground">Agencia de Análisis Forense Digital</span>
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              © {new Date().getFullYear()} Cochabamba, Bolivia. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
