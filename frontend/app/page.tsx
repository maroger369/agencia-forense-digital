"use client";

import { Shield, CheckCircle2, FileText, QrCode, ArrowRight, Scale, MapPin, Building2, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-forensic-purple p-2 rounded-xl shadow-lg shadow-primary/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Agencia Forense Digital</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-forensic-purple/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              Cochabamba, Bolivia
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-gradient">Certificación Forense</span>
              <br />
              de Evidencia Digital
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              Somos la primera agencia en Bolivia especializada en el análisis forense 
              y certificación de imágenes digitales. Garantizamos la autenticidad e 
              integridad de tu evidencia con validez legal.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="text-base shadow-2xl shadow-primary/20">
                  Solicitar Certificación
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="text-base">
                  Acceder al Sistema
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-t border-border/50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Proceso simple y seguro para certificar tu evidencia digital
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: Building2,
                title: "Regístrate",
                desc: "Crea tu cuenta como cliente de la agencia con tus datos personales",
              },
              {
                step: "02",
                icon: FileText,
                title: "Envía tu Evidencia",
                desc: "Sube la imagen que deseas certificar y realiza el pago correspondiente",
              },
              {
                step: "03",
                icon: Shield,
                title: "Análisis Forense",
                desc: "Nuestros peritos analizan la imagen con herramientas forenses avanzadas",
              },
              {
                step: "04",
                icon: QrCode,
                title: "Recibe tu Certificado",
                desc: "Descarga el certificado digital con hash, QR y todos los datos técnicos",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-forensic-purple/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-8">
                    <span className="text-5xl font-bold text-primary/20 mb-4 block">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="border-t border-border/50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Certificación con{" "}
                <span className="text-gradient">Validez Legal</span>
              </h2>
              <div className="space-y-4">
                {[
                  "Documento PDF inalterable con código hash único",
                  "Código QR para verificación instantánea",
                  "Análisis forense con detección de manipulaciones",
                  "Metadatos EXIF completos y geolocalización",
                  "Certificación respaldada por técnicos especializados",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-forensic-purple/5 rounded-3xl p-8 border border-border/50">
              <div className="flex items-center gap-4 mb-6">
                <Scale className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Marco Legal</h3>
                  <p className="text-sm text-muted-foreground">
                    Ley 1173 - Bolivia
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Nuestros certificados forenses cumplen con los estándares legales 
                establecidos en la legislación boliviana, proporcionando evidencia 
                digital válida para procesos judiciales, investigaciones fiscales 
                y procedimientos administrativos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="border-t border-border/50 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            ¿Necesitas Certificar una Evidencia?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Protege la integridad de tu evidencia digital con nuestra certificación forense profesional
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="text-base shadow-2xl shadow-primary/20">
                Solicitar Ahora
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="text-base">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-medium">Agencia de Análisis Forense Digital</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} - Cochabamba, Bolivia
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
