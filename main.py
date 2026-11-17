"""CLI del compresor de imágenes basado en Descomposición SVD."""

from __future__ import annotations

import argparse
import math
from pathlib import Path

import numpy as np

from image_processor import load_image, save_image
from math_engine import approximate_image
from metrics import channel_count, compression_ratio, matrix_storage, mse, psnr, svd_storage


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Comprime una imagen mediante SVD truncada por canal."
    )
    parser.add_argument("--image", required=True, help="Ruta de la imagen de entrada.")
    selector = parser.add_mutually_exclusive_group(required=True)
    selector.add_argument("--k", type=int, help="Número de valores singulares a conservar.")
    selector.add_argument(
        "--compression",
        type=float,
        metavar="PORCENTAJE",
        help="Reducción matemática objetivo del almacenamiento (0 a 100%%).",
    )
    parser.add_argument(
        "--output",
        help="Ruta de salida (por defecto: output/<nombre>_svd.<extensión>).",
    )
    return parser


def resolve_k(compression: float, shape: tuple[int, int]) -> int:
    """Calcula el mayor k que mantiene la reducción solicitada, si es posible."""
    if not 0 <= compression <= 100:
        raise ValueError("--compression debe estar entre 0 y 100.")
    rows, columns = shape
    rank_limit = min(shape)
    target_elements = (1 - compression / 100) * rows * columns
    k = max(1, math.floor(target_elements / (rows + columns + 1)))
    return min(k, rank_limit)


def default_output(image_path: Path) -> Path:
    return Path("output") / f"{image_path.stem}_svd{image_path.suffix.lower()}"


def main() -> int:
    args = build_parser().parse_args()
    image_path = Path(args.image)
    try:
        original = load_image(image_path)
        shape = (original.shape[0], original.shape[1])
        k = args.k if args.k is not None else resolve_k(args.compression, shape)
        reconstructed, effective_k = approximate_image(original, k)
        output_path = save_image(
            reconstructed,
            args.output or default_output(image_path),
        )
    except (FileNotFoundError, ValueError) as error:
        print(f"Error: {error}")
        return 2

    channels = channel_count(original)
    original_size = matrix_storage(*shape, channels)
    compressed_size = svd_storage(*shape, effective_k, channels)
    error = mse(original, reconstructed)
    print(f"Imagen: {image_path}")
    print(f"Dimensiones originales: {shape[0]} x {shape[1]} x {channels}")
    print(f"Componentes conservados (k): {effective_k}")
    print(f"Dimensiones truncadas por canal: U={shape[0]}x{effective_k}, Sigma={effective_k}x{effective_k}, V^T={effective_k}x{shape[1]}")
    print(f"Almacenamiento original (elementos): {original_size}")
    print(f"Almacenamiento SVD (k * (m + n + 1)): {compressed_size}")
    print(f"Reduccion matematica: {compression_ratio(original_size, compressed_size):.2f}%")
    print(f"MSE: {error:.6f}")
    print(f"PSNR: {'infinito' if math.isinf(psnr(error)) else f'{psnr(error):.2f} dB'}")
    print(f"Imagen guardada en: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
