from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance
import numpy as np
import tempfile
import os

JPEG_QUALITY = 90
ELA_BRIGHTNESS = 15


def analyze_ela(filepath: Path, temp_dir: Path) -> dict:
    """
    Realiza Error Level Analysis (ELA).

    Retorna:
        - estadísticas
        - score (porcentaje)
        - imagen ela temporal
    """
    try:
        image = Image.open(filepath)
        
        # Handle transparency to avoid black backgrounds or errors when converting to RGB
        if image.mode in ('RGBA', 'LA') or (image.mode == 'P' and 'transparency' in image.info):
            alpha = image.convert('RGBA').split()[-1]
            bg = Image.new("RGB", image.size, (255, 255, 255))
            bg.paste(image, mask=alpha)
            image = bg
        else:
            image = image.convert("RGB")

        temp_file = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        temp_path = temp_file.name
        temp_file.close()

        image.save(temp_path, "JPEG", quality=JPEG_QUALITY)

        compressed = Image.open(temp_path)

        ela_image = ImageChops.difference(image, compressed)
        extrema = ela_image.getextrema()
        max_difference = max(value[1] for value in extrema)

        if max_difference == 0:
            max_difference = 1

        scale = 255.0 / max_difference
        ela_image = ImageEnhance.Brightness(ela_image).enhance(scale * ELA_BRIGHTNESS)

        ela_array = np.asarray(ela_image)

        mean_value = float(np.mean(ela_array))
        std_value = float(np.std(ela_array))
        min_value = int(np.min(ela_array))
        max_value = int(np.max(ela_array))

        # Calcular score como porcentaje
        score = round((mean_value / 255.0) * 100, 2)
        
        # Si el error medio supera el 18%, es muy sospechoso de manipulación / alta compresión
        suspicious = score > 18.0

        ela_filename = filepath.stem + "_ela.png"
        ela_path = temp_dir / ela_filename
        ela_image.save(ela_path)

        os.remove(temp_path)

        return {
            "success": True,
            "settings": {"jpeg_quality": JPEG_QUALITY, "brightness_factor": ELA_BRIGHTNESS},
            "statistics": {
                "min": min_value,
                "max": max_value,
                "mean": round(mean_value, 2),
                "std": round(std_value, 2),
            },
            "score": score,
            "possible_manipulation": suspicious,
            "ela_image": str(ela_path),
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error al procesar ELA: {str(e)}"
        }
