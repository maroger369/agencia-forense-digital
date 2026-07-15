import { jsPDF } from "jspdf";

interface CertificadoData {
  certificateHash: string;
  qrCodePath: string;
  evidence: {
    originalName: string;
    createdAt: string;
    user: {
      name: string;
      ci: string;
      email?: string;
    };
  };
  analysis: {
    elaScore: number;
    elaResult: string;
    forensicReport: any;
    histogramData?: any;
    exifData?: any;
    hashesData?: any;
    compressionData?: any;
    noiseData?: any;
  };
  analystName: string;
}

export async function generarPDFCertificado(data: CertificadoData): Promise<Buffer> {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const primaryColor = [30, 64, 175] as const; // #1e40af
  const goldColor = [217, 119, 6] as const; // #d97706
  const grayColor = [100, 116, 139] as const;
  const darkColor = [15, 23, 42] as const;

  // === HEADER ===
  // Barra superior decorativa
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 8, "F");

  // Logo institucional
  doc.setFillColor(...primaryColor);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);

  // Shield icon (simple geometric)
  doc.setFillColor(...primaryColor);
  doc.circle(30, 22, 8, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(30, 22, 5, "F");
  doc.setFillColor(...primaryColor);
  doc.circle(30, 22, 3, "F");

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text("AGENCIA DE ANÁLISIS FORENSE DIGITAL", pageWidth / 2, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text("Cochabamba - Bolivia", pageWidth / 2, 27, { align: "center" });

  y = 38;

  // === TÍTULO DEL CERTIFICADO ===
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text("CERTIFICADO DE ANÁLISIS FORENSE DIGITAL", pageWidth / 2, y, { align: "center" });
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`Código: ${data.certificateHash.substring(0, 16)}... | Emitido: ${new Date().toLocaleDateString("es-BO")}`, pageWidth / 2, y, { align: "center" });
  y += 4;

  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // === DATOS DEL SOLICITANTE ===
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text("DATOS DEL SOLICITANTE", margin + 3, y + 5.5);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  const solicData = [
    { label: "Nombre Completo", value: data.evidence.user.name },
    { label: "Cédula de Identidad", value: data.evidence.user.ci },
    { label: "Email", value: data.evidence.user.email || "—" },
    { label: "Fecha de Solicitud", value: new Date(data.evidence.createdAt).toLocaleDateString("es-BO") },
  ];

  solicData.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (contentWidth / 2);
    const ry = y + row * 7;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(item.label, x, ry);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(item.value, x, ry + 4);
  });

  y += 20;

  // === DATOS DE LA EVIDENCIA ===
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text("DATOS DE LA EVIDENCIA ANALIZADA", margin + 3, y + 5.5);
  y += 12;

  const report = data.analysis.forensicReport?.detalles || {};
  const evData = [
    { label: "Nombre del Archivo", value: data.evidence.originalName },
    { label: "Tamaño", value: report.tamaño || "No disponible" },
    { label: "Formato", value: report.formato || "No disponible" },
    { label: "Resolución", value: report.resolucion || "No disponible" },
    { label: "Modo de Color", value: report.modoColor || "No disponible" },
    { label: "Megapíxeles", value: report.megapixeles || "No disponible" },
  ];

  evData.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (contentWidth / 2);
    const ry = y + row * 7;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(item.label, x, ry);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(item.value, x, ry + 4);
  });

  y += 28;

  // === RESULTADOS DEL ANÁLISIS ===
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text("RESULTADOS DEL ANÁLISIS FORENSE", margin + 3, y + 5.5);
  y += 12;

  // Veredicto
  const isManipulated = data.analysis.elaResult === "POSIBLE_MANIPULACION";
  doc.setFillColor(isManipulated ? 254 : 220, isManipulated ? 226 : 252, isManipulated ? 226 : 231);
  doc.rect(margin, y, contentWidth, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(isManipulated ? 220 : 22, isManipulated ? 38 : 163, isManipulated ? 38 : 74);
  doc.text(
    isManipulated ? "⚠ POSIBLE MANIPULACIÓN DETECTADA" : "✅ IMAGEN APARENTEMENTE AUTÉNTICA",
    pageWidth / 2,
    y + 7,
    { align: "center" }
  );
  y += 16;

  // Score ELA y nivel de riesgo
  const elaScore = data.analysis.elaScore || 0;
  const nivel = elaScore > 0.5 ? "ALTO" : elaScore > 0.2 ? "MEDIO" : "BAJO";
  const nivelColor = elaScore > 0.5 ? [220, 38, 38] : elaScore > 0.2 ? [217, 119, 6] : [22, 163, 74];

  const resultData = [
    { label: "Score ELA", value: elaScore.toFixed(4) },
    { label: "Nivel de Riesgo", value: nivel, color: nivelColor },
    { label: "Brillo", value: report.brillo || "N/A" },
    { label: "Contraste", value: report.contraste || "N/A" },
    { label: "Nitidez", value: report.nitidez || "N/A" },
    { label: "Ruido Medio", value: report.ruidoMedio || "N/A" },
    { label: "Cámara", value: report.camara || "N/A" },
    { label: "Software", value: report.software || "N/A" },
  ];

  resultData.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (contentWidth / 2);
    const ry = y + row * 7;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(item.label, x, ry);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if ("color" in item && item.color) {
      doc.setTextColor(...(item.color as [number, number, number]));
      doc.setFont("helvetica", "bold");
    } else {
      doc.setTextColor(0, 0, 0);
    }
    doc.text(item.value.toString(), x, ry + 4);
  });

  y += 34;

  // === HASHES ===
  if (data.analysis.forensicReport?.hashes) {
    const hashes = data.analysis.forensicReport.hashes;
    
    // Check if we need a new page
    if (y > 200) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.text("HUELLAS DIGITALES (HASHES CRIPTOGRÁFICOS)", margin + 3, y + 5.5);
    y += 12;

    const hashEntries = [
      { label: "MD5", value: hashes.md5 },
      { label: "SHA-1", value: hashes.sha1 },
      { label: "SHA-256", value: hashes.sha256 },
      { label: "SHA-512", value: hashes.sha512 },
    ];

    hashEntries.forEach((item) => {
      if (item.value) {
        doc.setFont("courier", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...grayColor);
        doc.text(`${item.label}:`, margin, y);
        
        doc.setFont("courier", "normal");
        doc.setFontSize(5.5);
        doc.setTextColor(0, 0, 0);
        doc.text(item.value, margin + 25, y);
        y += 4;
      }
    });
    y += 4;
  }

  // === RESUMEN / DICTAMEN ===
  if (y > 220) {
    doc.addPage();
    y = margin;
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text("DICTAMEN FORENSE", margin + 3, y + 5.5);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  
  const resumen = data.analysis.forensicReport?.resumen || "No hay resumen disponible.";
  const lines = doc.splitTextToSize(resumen, contentWidth);
  doc.text(lines, margin, y);
  y += lines.length * 4 + 6;

  // Recomendación
  if (data.analysis.forensicReport?.recomendacion) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    const recLines = doc.splitTextToSize(`Recomendación: ${data.analysis.forensicReport.recomendacion}`, contentWidth);
    doc.text(recLines, margin, y);
    y += recLines.length * 4 + 6;
  }

  // === FOOTER ===
  if (y > 240) {
    doc.addPage();
    y = margin;
  }

  // Línea separadora
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Información del certificado
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  
  doc.setFont("helvetica", "bold");
  doc.text("Hash de verificación:", margin, y);
  doc.setFont("courier", "normal");
  doc.setFontSize(5.5);
  doc.text(data.certificateHash, margin + 40, y);
  y += 3.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text(`Analizado por: ${data.analystName}`, margin, y);
  doc.text(`Fecha de emisión: ${new Date().toLocaleString("es-BO")}`, margin + 80, y);
  y += 3.5;

  doc.text("Este certificado es válido y puede ser verificado escaneando el código QR", margin, y);
  y += 3.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...primaryColor);
  doc.text(`Agencia de Análisis Forense Digital © ${new Date().getFullYear()} - Cochabamba, Bolivia`, pageWidth / 2, y, { align: "center" });

  // Barra inferior
  doc.setFillColor(...primaryColor);
  doc.rect(0, pageHeight - 6, pageWidth, 6, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.text(`Certificado: ${data.certificateHash.substring(0, 20)}... | Verificar en: agenciaforense.bo/verificar`, pageWidth / 2, pageHeight - 2, { align: "center" });

  // Generar PDF como buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}
