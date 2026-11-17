"""Carga y guardado de imágenes para el compresor SVD."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from numpy.typing import NDArray
from PIL import Image

ImageArray = NDArray[np.uint8]


def load_image(path: str | Path) -> ImageArray:
    """Carga una imagen como escala de grises, RGB o RGBA."""
    image_path = Path(path)
    if not image_path.is_file():
        raise FileNotFoundError(f"No existe la imagen: {image_path}")
    try:
        with Image.open(image_path) as image:
            mode = "L" if image.mode in ("1", "L", "I", "F") else "RGBA" if "A" in image.mode else "RGB"
            return np.asarray(image.convert(mode), dtype=np.uint8)
    except (OSError, ValueError) as error:
        raise ValueError(f"No se pudo leer la imagen '{image_path}': {error}") from error


def save_image(array: NDArray[np.number], path: str | Path) -> Path:
    """Recorta valores al rango de píxeles y guarda la imagen resultante."""
    output_path = Path(path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    values = np.clip(np.rint(array), 0, 255).astype(np.uint8)
    try:
        Image.fromarray(values).save(output_path)
    except (OSError, ValueError) as error:
        raise ValueError(f"No se pudo guardar la imagen '{output_path}': {error}") from error
    return output_path

