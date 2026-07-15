import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agencia de Análisis Forense Digital | Cochabamba, Bolivia",
  description:
    "Certificación y análisis forense de evidencia digital. Servicios de autenticación de imágenes, detección de manipulaciones y certificación digital con validez legal.",
  keywords: [
    "forense digital",
    "análisis de imágenes",
    "certificación digital",
    "Bolivia",
    "Cochabamba",
    "evidencia digital",
    "autenticación de imágenes",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
