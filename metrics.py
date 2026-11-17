"""Métricas de almacenamiento y calidad de la aproximación."""

from __future__ import annotations

import math

import numpy as np
from numpy.typing import NDArray


def channel_count(image: NDArray[np.number]) -> int:
    """Devuelve el número de canales matemáticos procesados (RGB o gris)."""
    return 1 if image.ndim == 2 else min(image.shape[2], 3)


def matrix_storage(rows: int, columns: int, channels: int = 1) -> int:
    """Cantidad de elementos de la matriz original."""
    return rows * columns * channels


def svd_storage(rows: int, columns: int, k: int, channels: int = 1) -> int:
    """Elementos requeridos por U_k, sigma_k y V_k^T."""
    return k * (rows + columns + 1) * channels


def compression_ratio(original: int, compressed: int) -> float:
    """Porcentaje de reducción matemática del almacenamiento."""
    return (1 - compressed / original) * 100 if original else 0.0


def mse(original: NDArray[np.number], reconstructed: NDArray[np.number]) -> float:
    """Error cuadrático medio entre imágenes."""
    difference = np.asarray(original, dtype=np.float64) - np.asarray(reconstructed, dtype=np.float64)
    return float(np.mean(np.square(difference)))


def psnr(error: float) -> float:
    """Relación señal/ruido máxima; infinito cuando no existe error."""
    return math.inf if error == 0 else 10 * math.log10((255**2) / error)

