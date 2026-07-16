import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { CertificadoPDF, CertificadoData } from "./CertificadoPDF";
import fs from "fs";
import path from "path";

export async function generarPDFCertificado(data: CertificadoData, qrBase64: string): Promise<Buffer> {
  let logoBase64 = "";
  try {
    const logoPath = path.join(process.cwd(), "public", "logo", "logo-afd.png");
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    }
  } catch (e) {
    console.error("Error loading logo", e);
  }

  const element = React.createElement(CertificadoPDF, { data, logoBase64, qrBase64 });
  const buffer = await renderToBuffer(element as any);
  return buffer;
}
