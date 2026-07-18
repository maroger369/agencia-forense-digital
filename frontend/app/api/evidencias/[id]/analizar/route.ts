import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";
import { readFile } from "fs/promises";
import path from "path";

const baseUrl = process.env.NEXT_PUBLIC_FORENSIC_API_URL?.replace(/\/$/, "") || "https://api-python-forense.onrender.com";
const FORENSIC_API_URL = `${baseUrl}/analyze`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (auth.role === "CLIENTE") {
      return NextResponse.json(
        { error: "No tienes permiso para analizar evidencias" },
        { status: 403 }
      );
    }

    const evidence = await prisma.evidence.findUnique({ where: { id } });
    if (!evidence) {
      return NextResponse.json(
        { error: "Evidencia no encontrada" },
        { status: 404 }
      );
    }

    if (!evidence.imagePath) {
      return NextResponse.json(
        { error: "No se encontró una imagen para analizar en esta evidencia." },
        { status: 400 }
      );
    }

    // Actualizar estado a REVISANDO
    await prisma.evidence.update({
      where: { id },
      data: { status: "REVISANDO" },
    });

    // Extraer el filename de la ruta de imagen almacenada (que ahora es una URL absoluta)
    // evidence.imagePath será algo como "http://backend/uploads/evidencias/user/archivo.jpg"
    const filename = evidence.imagePath.includes("/uploads/") 
      ? evidence.imagePath.split("/uploads/")[1] 
      : evidence.imagePath;

    // Llamar a la API forense externa
    const formData = new FormData();
    formData.append("filename", filename);
    formData.append("original_name", evidence.originalName);

    let forensicResult;
    try {
      const response = await fetch(FORENSIC_API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API forense respondió con estado ${response.status}`);
      }

      forensicResult = await response.json();
      console.log("✅ Respuesta de API forense recibida correctamente");
    } catch (apiError) {
      console.error("⚠️ Error al conectar con API forense externa:", apiError);
      return NextResponse.json(
        { error: `No se pudo conectar con el servidor de análisis forense. Verifica que la API esté configurada en https://api-python-forense.onrender.com/` },
        { status: 503 }
      );
    }

    // Guardar resultado del análisis con el formato real de la API
    const analysis = await prisma.analysisResult.upsert({
      where: { evidenceId: id },
      create: {
        evidenceId: id,
        elaScore: forensicResult.ela?.score ?? null,
        elaResult: forensicResult.ela?.possible_manipulation ? "POSIBLE_MANIPULACION" : "AUTENTICA",
        elaImagePath: forensicResult.ela?.ela_image || null,
        histogramData: JSON.stringify(forensicResult.histogram || {}),
        exifData: JSON.stringify(forensicResult.exif || {}),
        hashesData: JSON.stringify(forensicResult.hashes || {}),
        compressionData: JSON.stringify(forensicResult.compression || {}),
        noiseData: JSON.stringify(forensicResult.noise || {}),
        forensicReport: generarDictamen(forensicResult, evidence),
        analyzedBy: auth.userId,
      },
      update: {
        elaScore: forensicResult.ela?.score ?? null,
        elaResult: forensicResult.ela?.possible_manipulation ? "POSIBLE_MANIPULACION" : "AUTENTICA",
        elaImagePath: forensicResult.ela?.ela_image || null,
        histogramData: JSON.stringify(forensicResult.histogram || {}),
        exifData: JSON.stringify(forensicResult.exif || {}),
        hashesData: JSON.stringify(forensicResult.hashes || {}),
        compressionData: JSON.stringify(forensicResult.compression || {}),
        noiseData: JSON.stringify(forensicResult.noise || {}),
        forensicReport: generarDictamen(forensicResult, evidence),
        analyzedBy: auth.userId,
      },
    });

    return NextResponse.json({
      analysis,
      forensicResult,
      message: "Análisis forense completado exitosamente",
    });
  } catch (error) {
    console.error("Analyze evidence error:", error);
    return NextResponse.json(
      { error: "Error al analizar evidencia" },
      { status: 500 }
    );
  }
}

function generarDictamen(result: any, evidence: any): string {
  const manipulacion = result.ela?.possible_manipulation || false;
  const score = result.ela?.score || 0; // Ahora viene como porcentaje de 0 a 100
  const nivelRiesgo = score > 50 ? "ALTO" : score > 18 ? "MEDIO" : "BAJO";

  const detallesCamara = result.exif?.camera;
  const tieneCamara = detallesCamara?.make || detallesCamara?.model;
  const tieneGPS = result.exif?.gps?.latitude;
  const tieneSoftware = result.exif?.software?.software || result.exif?.software?.creator_tool;

  const resumenManipulacion = manipulacion
    ? `El análisis ELA (Error Level Analysis) reveló un score de ${score.toFixed(2)}%, superando el umbral normal, lo que sugiere POSIBLE MANIPULACIÓN en la imagen. Se detectaron anomalías en los patrones de compresión que indican posibles alteraciones en áreas específicas de la imagen.`
    : `El análisis ELA (Error Level Analysis) muestra un score de ${score.toFixed(2)}%, dentro del rango normal, lo que indica que la imagen NO PRESENTA EVIDENCIAS de manipulación. Los patrones de compresión son consistentes en toda la imagen.`;

  return JSON.stringify({
    veredicto: manipulacion
      ? "EVIDENCIA DE MANIPULACIÓN DETECTADA"
      : "IMAGEN APARENTEMENTE AUTÉNTICA",
    nivelRiesgo,
    scoreELA: score,
    fechaAnalisis: new Date().toISOString(),
    analista: "Sistema Automatizado",
    resumen: resumenManipulacion,
    recomendacion: manipulacion
      ? "Se recomienda realizar un análisis más profundo con herramientas forenses avanzadas. La imagen debe tratarse como evidencia comprometida hasta que se complete la investigación adicional."
      : "La imagen puede considerarse como evidencia válida para propósitos generales. Para casos legales de alta importancia, se recomienda complementar con análisis adicionales.",
    detalles: {
      nombreArchivo: evidence.originalName,
      resolucion: result.exif?.file?.image_width && result.exif?.file?.image_height
        ? `${result.exif.file.image_width}x${result.exif.file.image_height}`
        : result.histogram?.image?.width && result.histogram?.image?.height
        ? `${result.histogram.image.width}x${result.histogram.image.height}`
        : "No disponible",
      tamaño: result.exif?.file?.file_size || (result.compression?.size_bytes ? `${(result.compression.size_bytes / 1024).toFixed(2)} KB` : "No disponible"),
      formato: result.compression?.format || result.exif?.file?.file_type || "Desconocido",
      modoColor: result.compression?.mode || "No disponible",
      megapixeles: result.exif?.file?.megapixels
        ? `${result.exif.file.megapixels} MP`
        : result.histogram?.image?.pixels
        ? `${(result.histogram.image.pixels / 1000000).toFixed(2)} MP`
        : "No disponible",
      camara: tieneCamara
        ? `${detallesCamara.make || ""} ${detallesCamara.model || ""}`.trim()
        : "No disponible (posible imagen generada o editada)",
      software: tieneSoftware || "No detectado",
      gps: tieneGPS ? "Presente" : "Ausente",
      fechaOriginal: result.exif?.dates?.datetime_original || result.exif?.dates?.modify_date || "No disponible",
      flash: result.exif?.photo?.flash || "No disponible",
      iso: result.exif?.photo?.iso || "No disponible",
      nitidez: result.noise?.sharpness?.classification || "No disponible",
      ruidoMedio: result.noise?.noise?.mean ?? "No disponible",
      brillo: result.histogram?.brightness?.toFixed(2) || "No disponible",
      contraste: result.histogram?.contrast?.toFixed(2) || "No disponible",
      scoreELA: `${score.toFixed(2)}%`,
    },
    hashes: {
      md5: result.hashes?.cryptographic?.md5 || result.hashes?.cryptographic?.MD5 || "",
      sha1: result.hashes?.cryptographic?.sha1 || result.hashes?.cryptographic?.SHA1 || "",
      sha256: result.hashes?.cryptographic?.sha256 || result.hashes?.cryptographic?.SHA256 || "",
      sha512: result.hashes?.cryptographic?.sha512 || result.hashes?.cryptographic?.SHA512 || "",
      pHash: result.hashes?.perceptual?.phash || result.hashes?.perceptual?.PHash || "",
      dHash: result.hashes?.perceptual?.dhash || result.hashes?.perceptual?.DHash || "",
      averageHash: result.hashes?.perceptual?.average_hash || "",
      wHash: result.hashes?.perceptual?.whash || "",
    },
    agencia: "Agencia de Análisis Forense Digital",
    ubicacion: "Cochabamba, Bolivia",
  });
}
