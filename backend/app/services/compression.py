from pathlib import Path
from PIL import Image
import os


def analyze_compression(filepath: Path) -> dict:
    """
    Analiza información relacionada con la compresión de la imagen.

    Nota:
    La calidad JPEG original no puede recuperarse exactamente una vez
    que la imagen ha sido guardada. Solo puede estimarse.
    """
    try:
        image = Image.open(filepath)

        result = {
            "success": True,
            "format": image.format,
            "mode": image.mode,
            "size_bytes": os.path.getsize(filepath),
            "compression": {},
        }

        # PNG, TIFF, etc.
        compression = image.info.get("compression")
        if compression:
            result["compression"]["method"] = compression

        # JPEG
        if image.format == "JPEG":

            result["compression"]["progressive"] = bool(
                image.info.get("progressive", False)
            )

            result["compression"]["optimize"] = bool(image.info.get("optimize", False))

            result["compression"]["jfif"] = image.info.get("jfif")

            result["compression"]["jfif_version"] = image.info.get("jfif_version")

            result["compression"]["dpi"] = image.info.get("dpi")

            result["compression"]["subsampling"] = (
                image.layer if hasattr(image, "layer") else None
            )

            result["compression"]["quality_estimation"] = (
                "No es posible determinar la calidad JPEG exacta "
                "a partir de una imagen ya guardada."
            )

        return result
    except Exception as e:
        return {
            "success": False,
            "error": f"Error al analizar compresión: {str(e)}"
        }
