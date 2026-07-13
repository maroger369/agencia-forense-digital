from pathlib import Path
from PIL import Image
import mimetypes
import os


def get_file_size(filepath: Path) -> int:
    """
    Retorna el tamaño del archivo en bytes.
    """
    return os.path.getsize(filepath)


def get_file_extension(filepath: Path) -> str:
    """
    Retorna la extensión del archivo.
    """
    return filepath.suffix.lower()


def get_mime_type(filepath: Path) -> str:
    """
    Retorna el MIME Type del archivo.
    """
    mime, _ = mimetypes.guess_type(str(filepath))
    return mime or "application/octet-stream"


def get_image(filepath: Path) -> Image.Image:
    """
    Abre la imagen utilizando Pillow.
    """
    return Image.open(filepath)


def get_image_info(filepath: Path) -> dict:
    """
    Información básica de la imagen.
    """

    image = get_image(filepath)

    return {
        "filename": filepath.name,
        "extension": get_file_extension(filepath),
        "mime_type": get_mime_type(filepath),
        "size_bytes": get_file_size(filepath),
        "width": image.width,
        "height": image.height,
        "mode": image.mode,
        "format": image.format,
    }


def bytes_to_mb(size_bytes: int) -> float:
    """
    Convierte bytes a MB.
    """
    return round(size_bytes / (1024 * 1024), 2)


def bytes_to_kb(size_bytes: int) -> float:
    """
    Convierte bytes a KB.
    """
    return round(size_bytes / 1024, 2)


def image_exists(filepath: Path) -> bool:
    """
    Verifica si existe el archivo.
    """
    return filepath.exists()


def validate_image(filepath: Path) -> bool:
    """
    Verifica que el archivo realmente sea una imagen válida.
    """

    try:
        with Image.open(filepath) as img:
            img.verify()
        return True

    except Exception:
        return False
