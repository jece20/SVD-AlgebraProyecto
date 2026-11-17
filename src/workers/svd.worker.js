import { processImage, reconstructImage } from "../utils/svdProcessor";

self.onmessage = ({ data }) => {
  try {
    const result = data.type === "decompress"
      ? reconstructImage(data.svdPackage)
      : processImage(
        { width: data.width, height: data.height, data: new Uint8ClampedArray(data.pixels) },
        data.k
      );
    self.postMessage(
      { type: "complete", result: { ...result, pixels: result.pixels.buffer } },
      [result.pixels.buffer]
    );
  } catch (error) {
    self.postMessage({ type: "error", message: error instanceof Error ? error.message : "Error al calcular la SVD." });
  }
};
