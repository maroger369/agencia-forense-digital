from pathlib import Path
import hashlib

from PIL import Image
import imagehash


def calculate_hash(filepath: Path, algorithm: str) -> str:
    """
    Calcula un hash criptográfico del archivo.
    """

    hash_object = hashlib.new(algorithm)

    with open(filepath, "rb") as file:

        while True:

            chunk = file.read(8192)

            if not chunk:
                break

            hash_object.update(chunk)

    return hash_object.hexdigest()


def analyze_hashes(filepath: Path) -> dict:
    """
    Calcula hashes criptográficos y perceptuales.
    """
    try:
        image = Image.open(filepath)

        result = {
            "success": True,
            "cryptographic": {
                "md5": calculate_hash(filepath, "md5"),
                "sha1": calculate_hash(filepath, "sha1"),
                "sha256": calculate_hash(filepath, "sha256"),
                "sha512": calculate_hash(filepath, "sha512"),
            },
            "perceptual": {
                "average_hash": str(imagehash.average_hash(image)),
                "phash": str(imagehash.phash(image)),
                "dhash": str(imagehash.dhash(image)),
                "whash": str(imagehash.whash(image)),
            },
        }

        return result
    except Exception as e:
        return {
            "success": False,
            "error": f"Error al calcular hashes: {str(e)}"
        }
