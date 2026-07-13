import json
import subprocess
from pathlib import Path


def analyze_exif(filepath: Path) -> dict:
    """
    Analiza los metadatos EXIF utilizando ExifTool.

    Retorna información relevante para análisis forense.
    """

    try:

        result = subprocess.run(
            ["exiftool", "-j", str(filepath)],
            capture_output=True,
            text=True,
            check=True,
        )

        metadata = json.loads(result.stdout)

        if not metadata:
            return {"success": False, "message": "No se encontraron metadatos."}

        metadata = metadata[0]

        return {
            "success": True,
            # ==========================
            # INFORMACIÓN DEL ARCHIVO
            # ==========================
            "file": {
                "file_name": metadata.get("FileName"),
                "file_size": metadata.get("FileSize"),
                "file_type": metadata.get("FileType"),
                "mime_type": metadata.get("MIMEType"),
                "extension": metadata.get("FileTypeExtension"),
                "image_width": metadata.get("ImageWidth"),
                "image_height": metadata.get("ImageHeight"),
                "megapixels": metadata.get("Megapixels"),
                "color_components": metadata.get("ColorComponents"),
                "bits_per_sample": metadata.get("BitsPerSample"),
            },
            # ==========================
            # INFORMACIÓN DE CÁMARA
            # ==========================
            "camera": {
                "make": metadata.get("Make"),
                "model": metadata.get("Model"),
                "lens": metadata.get("LensModel"),
                "serial": metadata.get("SerialNumber"),
            },
            # ==========================
            # FECHAS IMPORTANTES
            # ==========================
            "dates": {
                "create_date": metadata.get("CreateDate"),
                "modify_date": metadata.get("ModifyDate"),
                "datetime_original": metadata.get("DateTimeOriginal"),
            },
            # ==========================
            # SOFTWARE / EDICIÓN
            # ==========================
            "software": {
                "software": metadata.get("Software"),
                "creator_tool": metadata.get("CreatorTool"),
            },
            # ==========================
            # UBICACIÓN GPS
            # ==========================
            "gps": {
                "latitude": metadata.get("GPSLatitude"),
                "longitude": metadata.get("GPSLongitude"),
                "altitude": metadata.get("GPSAltitude"),
            },
            # ==========================
            # CONFIGURACIÓN FOTOGRÁFICA
            # ==========================
            "photo": {
                "orientation": metadata.get("Orientation"),
                "color_space": metadata.get("ColorSpace"),
                "flash": metadata.get("Flash"),
                "iso": metadata.get("ISO"),
                "f_number": metadata.get("FNumber"),
                "exposure_time": metadata.get("ExposureTime"),
                "focal_length": metadata.get("FocalLength"),
                "white_balance": metadata.get("WhiteBalance"),
            },
            # ==========================
            # COMPRESIÓN JPEG
            # ==========================
            "compression": {
                "encoding_process": metadata.get("EncodingProcess"),
                "sub_sampling": metadata.get("YCbCrSubSampling"),
                "jpeg_quality": metadata.get("JPEGQuality"),
            },
            # ==========================
            # INFORMACIÓN RAW REDUCIDA
            # ==========================
            # Solo campos útiles para investigación
            "raw": {
                "format": metadata.get("FileType"),
                "jfif_version": metadata.get("JFIFVersion"),
                "resolution_unit": metadata.get("ResolutionUnit"),
                "x_resolution": metadata.get("XResolution"),
                "y_resolution": metadata.get("YResolution"),
                "profile_description": metadata.get("ProfileDescription"),
            },
        }

    except subprocess.CalledProcessError as e:

        return {"success": False, "error": str(e)}

    except Exception as e:

        return {"success": False, "error": str(e)}
