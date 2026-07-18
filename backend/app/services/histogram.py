from pathlib import Path

import cv2
import numpy as np


def _channel_statistics(channel: np.ndarray) -> dict:
    return {
        "min": int(channel.min()),
        "max": int(channel.max()),
        "mean": round(float(channel.mean()), 2),
        "std": round(float(channel.std()), 2),
    }


def analyze_histogram(filepath: Path) -> dict:
    try:
        image = cv2.imread(str(filepath))

        if image is None:
            raise Exception("No fue posible abrir la imagen con OpenCV.")

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        r = rgb[:, :, 0]
        g = rgb[:, :, 1]
        b = rgb[:, :, 2]

        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)

        brightness = float(gray.mean())
        contrast = float(gray.std())

        return {
            "success": True,
            "image": {
                "width": int(rgb.shape[1]),
                "height": int(rgb.shape[0]),
                "pixels": int(rgb.shape[0] * rgb.shape[1]),
            },
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2),
            "channels": {
                "red": {"statistics": _channel_statistics(r)},
                "green": {"statistics": _channel_statistics(g)},
                "blue": {"statistics": _channel_statistics(b)},
            },
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error al procesar histograma: {str(e)}"
        }
