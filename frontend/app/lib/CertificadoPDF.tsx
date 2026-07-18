import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

export interface CertificadoData {
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

export interface CertificadoPDFProps {
  data: CertificadoData;
  logoBase64: string;
  qrBase64: string;
}

// Estilos modernos y tecnológicos
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    padding: 0,
    position: "relative",
  },
  // Barra de cabecera oscura
  headerBar: {
    backgroundColor: "#0f172a", // slate-900
    height: 10,
    width: "100%",
  },
  headerContent: {
    padding: 15,
    paddingTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "2 solid #1e40af", // blue-800
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 45,
    height: 45,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  qrContainerHeader: {
    width: 45,
    height: 45,
  },
  mainBody: {
    padding: 20,
    paddingTop: 10,
    flex: 1,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e40af",
    textAlign: "center",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  certificateCode: {
    fontSize: 8,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Courier",
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    backgroundColor: "#f1f5f9", // slate-100
    padding: 4,
    borderLeft: "4 solid #1e40af",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTop: "1 solid #e2e8f0",
    borderLeft: "1 solid #e2e8f0",
  },
  gridCell: {
    width: "50%",
    padding: 4,
    borderRight: "1 solid #e2e8f0",
    borderBottom: "1 solid #e2e8f0",
  },
  gridLabel: {
    fontSize: 7,
    color: "#64748b",
    fontWeight: "bold",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  gridValue: {
    fontSize: 9,
    color: "#0f172a",
  },
  // Veredicto
  verdictContainer: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    alignItems: "center",
  },
  verdictAuthentic: {
    backgroundColor: "#ecfdf5", // emerald-50
    border: "1 solid #34d399", // emerald-400
  },
  verdictManipulated: {
    backgroundColor: "#fef2f2", // red-50
    border: "1 solid #f87171", // red-400
  },
  verdictTextAuthentic: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#059669", // emerald-600
  },
  verdictTextManipulated: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#dc2626", // red-600
  },
  // Resumen text
  summaryText: {
    fontSize: 8,
    color: "#334155",
    lineHeight: 1.4,
    textAlign: "justify",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  signaturesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    marginBottom: 15,
  },
  signatureBox: {
    alignItems: "center",
    width: 140, // Ampliado para evitar que el texto se rompa
  },
  signatureLine: {
    width: "100%",
    height: 1,
    backgroundColor: "#94a3b8",
    marginBottom: 6,
  },
  signatureName: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
  },
  signatureRole: {
    fontSize: 7,
    color: "#64748b",
  },
  // Sello Digital
  digitalSealContainer: {
    position: "absolute",
    bottom: 60,
    right: 30,
    opacity: 0.10,
    width: 100,
    height: 100,
  },
  footerBar: {
    backgroundColor: "#0f172a",
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    color: "#cbd5e1",
    fontSize: 6,
  },
  hashMono: {
    fontFamily: "Courier",
    fontSize: 6,
    color: "#60a5fa",
  }
});

// Helper component for Grid rows
const InfoGrid = ({ data }: { data: { label: string; value: string }[] }) => (
  <View style={styles.grid}>
    {data.map((item, idx) => (
      <View key={idx} style={styles.gridCell}>
        <Text style={styles.gridLabel}>{item.label}</Text>
        <Text style={styles.gridValue}>{item.value}</Text>
      </View>
    ))}
  </View>
);

export const CertificadoPDF = ({ data, logoBase64, qrBase64 }: CertificadoPDFProps) => {
  const isManipulated = data.analysis.elaResult === "POSIBLE_MANIPULACION";
  const elaScore = data.analysis.elaScore || 0;
  const riskLevel = elaScore > 50 ? "ALTO" : elaScore > 18 ? "MEDIO" : "BAJO";

  const report = data.analysis.forensicReport?.detalles || {};
  const hashes = data.analysis.forensicReport?.hashes || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.headerBar} />
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            {logoBase64 && <Image src={logoBase64} style={styles.logo} />}
            <View>
              <Text style={styles.headerTitle}>AGENCIA DE ANÁLISIS FORENSE DIGITAL</Text>
              <Text style={styles.headerSubtitle}>CERTIFICACIÓN TÉCNICA E INFORME PERICIAL</Text>
            </View>
          </View>
          {qrBase64 && <Image src={qrBase64} style={styles.qrContainerHeader} />}
        </View>

        {/* BODY */}
        <View style={styles.mainBody}>
          <Text style={styles.certificateTitle}>Certificado Digital de Autenticidad</Text>
          <Text style={styles.certificateCode}>
            HASH: {data.certificateHash} | EMITIDO: {new Date().toLocaleDateString("es-BO")}
          </Text>

          {/* DATOS SOLICITANTE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>1. Datos del Solicitante</Text>
            </View>
            <InfoGrid
              data={[
                { label: "Nombre Completo", value: data.evidence.user.name },
                { label: "Cédula de Identidad", value: data.evidence.user.ci },
                { label: "Correo Electrónico", value: data.evidence.user.email || "No especificado" },
                { label: "Fecha de Solicitud", value: new Date(data.evidence.createdAt).toLocaleDateString("es-BO") },
              ]}
            />
          </View>

          {/* DATOS EVIDENCIA */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>2. Identificación de la Evidencia Digital</Text>
            </View>
            <InfoGrid
              data={[
                { label: "Nombre de Archivo Original", value: data.evidence.originalName },
                { label: "Formato y Extensión", value: report.formato || "No disponible" },
                { label: "Resolución de Imagen", value: report.resolucion || "No disponible" },
                { label: "Modelo de Cámara / Dispositivo", value: report.camara || "No detectado" },
                { label: "Software / Edición Detectada", value: report.software || "Ninguno detectado" },
                { label: "Tamaño de Archivo", value: report.tamaño || "No disponible" },
              ]}
            />
          </View>

          {/* VEREDICTO */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>3. Veredicto del Análisis Técnico</Text>
            </View>
            
            <View style={[styles.verdictContainer, isManipulated ? styles.verdictManipulated : styles.verdictAuthentic]}>
              <Text style={isManipulated ? styles.verdictTextManipulated : styles.verdictTextAuthentic}>
                {isManipulated ? "[ ALERTA ] POSIBLE MANIPULACIÓN DETECTADA" : "[ OK ] IMAGEN APARENTEMENTE AUTÉNTICA"}
              </Text>
            </View>

            <InfoGrid
              data={[
                { label: "Score ELA (Nivel de Error)", value: `${elaScore.toFixed(2)}%` },
                { label: "Nivel de Riesgo General", value: riskLevel },
                { label: "Nivel de Ruido Promedio", value: report.ruidoMedio || "N/A" },
                { label: "Brillo / Contraste Promedio", value: `${report.brillo || "N/A"} / ${report.contraste || "N/A"}` },
              ]}
            />
          </View>

          {/* HASHES CRIPTOGRÁFICOS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>4. Huellas Digitales (Integridad)</Text>
            </View>
            <View style={{ backgroundColor: "#f8fafc", padding: 10, border: "1 solid #e2e8f0", borderRadius: 4 }}>
              <Text style={{ fontSize: 8, color: "#64748b", fontFamily: "Courier", marginBottom: 3 }}><Text style={{fontWeight:"bold", color:"#0f172a"}}>MD5:</Text> {hashes.md5 || "N/A"}</Text>
              <Text style={{ fontSize: 8, color: "#64748b", fontFamily: "Courier", marginBottom: 3 }}><Text style={{fontWeight:"bold", color:"#0f172a"}}>SHA-1:</Text> {hashes.sha1 || "N/A"}</Text>
              <Text style={{ fontSize: 8, color: "#64748b", fontFamily: "Courier" }}><Text style={{fontWeight:"bold", color:"#0f172a"}}>SHA-256:</Text> {hashes.sha256 || "N/A"}</Text>
            </View>
          </View>

          {/* DICTAMEN FINAL */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>5. Resumen del Dictamen Pericial</Text>
            </View>
            <Text style={styles.summaryText}>
              {data.analysis.forensicReport?.resumen || "No hay resumen disponible."}
            </Text>
          </View>
        </View>

        {/* WATERMARK / SELLO DIGITAL */}
        {logoBase64 && <Image src={logoBase64} style={styles.digitalSealContainer} />}

        {/* FOOTER & FIRMAS */}
        <View style={styles.footer}>
          
          <View style={styles.signaturesContainer}>
            {/* Firma Analista */}
            <View style={styles.signatureBox}>
              <Text style={{ fontFamily: "Courier", fontSize: 14, color: "#1e40af", marginBottom: 5, transform: "rotate(-5deg)", textAlign: "center" }}>
                {data.analystName}
              </Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{data.analystName.toUpperCase()}</Text>
              <Text style={styles.signatureRole}>PERITO INFORMÁTICO FORENSE</Text>
            </View>

            {/* Firma Director */}
            <View style={styles.signatureBox}>
              <Text style={{ fontFamily: "Courier", fontSize: 16, color: "#0f172a", marginBottom: 5, transform: "rotate(-2deg)", textAlign: "center" }}>
                A.F.D. Dir
              </Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>DIRECCIÓN GENERAL</Text>
              <Text style={styles.signatureRole}>AGENCIA FORENSE DIGITAL</Text>
            </View>
          </View>

          <View style={styles.footerBar}>
            <View>
              <Text style={styles.footerText}>© {new Date().getFullYear()} Agencia de Análisis Forense Digital - Bolivia</Text>
              <Text style={styles.footerText}>Documento generado automáticamente por sistema.</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.footerText}>Verificación en línea:</Text>
              <Text style={styles.hashMono}>agenciaforense.bo/verificar</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
};
