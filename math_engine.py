"""Núcleo matemático para compresión de matrices mediante SVD."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from numpy.typing import NDArray

FloatMatrix = NDArray[np.float64]


@dataclass(frozen=True)
class SVDApproximation:
    """Resultado de conservar los primeros k valores singulares."""

    matrix: FloatMatrix
    singular_values: NDArray[np.float64]
    k: int


def validate_k(k: int, shape: tuple[int, int]) -> int:
    """Valida que k esté dentro del rango matemático de la matriz."""
    if not isinstance(k, int) or isinstance(k, bool):
        raise ValueError("k debe ser un entero.")
    if k < 1:
        raise ValueError("k debe ser mayor o igual que 1.")

    rank_limit = min(shape)
    if k > rank_limit:
        raise ValueError(
            f"k={k} excede el rango maximo de la matriz ({rank_limit})."
        )
    return k


def approximate_matrix(matrix: NDArray[np.number], k: int) -> SVDApproximation:
    """Reconstruye una matriz con los k componentes principales de su SVD.

    En A = UΣVᵀ, U contiene las direcciones ortogonales de entrada,
    Σ pondera cada dirección mediante sus valores singulares y Vᵀ contiene
    las direcciones ortogonales de salida. La multiplicación truncada
    U[:, :k] @ diag(Σ[:k]) @ Vᵀ[:k, :] produce la mejor aproximación
    de rango k en norma Frobenius.
    """
    source = np.asarray(matrix, dtype=np.float64)
    if source.ndim != 2:
        raise ValueError("La matriz debe ser bidimensional.")

    k = validate_k(k, (source.shape[0], source.shape[1]))
    u, singular_values, vt = np.linalg.svd(source, full_matrices=False)
    reconstructed = (u[:, :k] * singular_values[:k]) @ vt[:k, :]
    return SVDApproximation(
        matrix=reconstructed,
        singular_values=singular_values,
        k=k,
    )


def approximate_image(image: NDArray[np.number], k: int) -> tuple[NDArray[np.float64], int]:
    """Aplica SVD por canal a una imagen en escala de grises o RGB."""
    source = np.asarray(image, dtype=np.float64)
    if source.ndim == 2:
        result = approximate_matrix(source, k)
        return result.matrix, result.k
    if source.ndim == 3 and source.shape[2] in (3, 4):
        channels = []
        effective_k: int | None = None
        for channel in range(3):
            result = approximate_matrix(source[:, :, channel], k)
            channels.append(result.matrix)
            effective_k = result.k
        reconstructed = np.stack(channels, axis=2)
        if source.shape[2] == 4:
            reconstructed = np.dstack((reconstructed, source[:, :, 3]))
        return reconstructed, effective_k or k
    raise ValueError("La imagen debe ser una matriz 2D o tener 3/4 canales.")
