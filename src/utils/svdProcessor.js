import { Matrix, SVD } from "ml-matrix";

function channelSVD(values, rows, columns, k) {
  const matrix = new Matrix(values);
  const decomposition = new SVD(matrix, { autoTranspose: true });
  const singular = decomposition.diagonal;
  const left = decomposition.leftSingularVectors;
  const right = decomposition.rightSingularVectors;
  const output = Array.from({ length: rows }, () => Array(columns).fill(0));
  for (let component = 0; component < k; component += 1) {
    for (let row = 0; row < rows; row += 1) {
      const factor = left.get(row, component) * singular[component];
      for (let column = 0; column < columns; column += 1) {
        output[row][column] += factor * right.get(column, component);
      }
    }
  }
  return {
    output,
    u: Array.from({ length: rows }, (_, row) => Array.from({ length: k }, (_, component) => left.get(row, component))),
    singularValues: singular.slice(0, k),
    vt: Array.from({ length: k }, (_, component) => Array.from({ length: columns }, (_, column) => right.get(column, component)))
  };
}

export function processImage(imageData, k) {
  const { width, height, data } = imageData;
  const channels = Array.from(
    { length: 3 },
    () => Array.from({ length: height }, () => Array(width).fill(0))
  );
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const index = (row * width + column) * 4;
      channels[0][row][column] = data[index];
      channels[1][row][column] = data[index + 1];
      channels[2][row][column] = data[index + 2];
    }
  }
  const decompositions = channels.map((channel) => channelSVD(channel, height, width, k));
  const reconstructedChannels = decompositions.map((decomposition) => decomposition.output);
  const reconstructed = new Uint8ClampedArray(data.length);
  let error = 0;
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const pixel = (row * width + column) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        const value = Math.max(0, Math.min(255, reconstructedChannels[channel][row][column]));
        reconstructed[pixel + channel] = value;
        error += (data[pixel + channel] - value) ** 2;
      }
      reconstructed[pixel + 3] = 255;
    }
  }
  const originalSize = width * height * 3;
  const compressedSize = k * (height + width + 1) * 3;
  return {
    pixels: reconstructed,
    rows: height,
    columns: width,
    k,
    originalSize,
    compressedSize,
    compression: (1 - compressedSize / originalSize) * 100,
    mse: error / (width * height * 3),
    svdPackage: {
      format: "svd-image-v1",
      width,
      height,
      channels: decompositions.map(({ u, singularValues, vt }) => ({
        u,
        singularValues,
        vt
      })),
      k
    }
  };
}

export function reconstructImage(svdPackage) {
  if (!svdPackage || svdPackage.format !== "svd-image-v1") {
    throw new Error("El archivo no contiene una matriz SVD compatible.");
  }
  const { width, height, channels, k } = svdPackage;
  if (!Number.isInteger(width) || !Number.isInteger(height) || !Number.isInteger(k) || k < 1 || !Array.isArray(channels) || channels.length !== 3) {
    throw new Error("La matriz SVD tiene metadatos inválidos.");
  }
  const reconstructedChannels = channels.map(({ u, singularValues, vt }) => {
    if (!Array.isArray(u) || !Array.isArray(singularValues) || !Array.isArray(vt) || u.length !== height || vt.length !== k || singularValues.length !== k) {
      throw new Error("La matriz SVD está incompleta o dañada.");
    }
    return Array.from({ length: height }, (_, row) => Array.from({ length: width }, (_, column) => {
      let value = 0;
      for (let component = 0; component < k; component += 1) {
        value += u[row][component] * singularValues[component] * vt[component][column];
      }
      return value;
    }));
  });
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const pixel = (row * width + column) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        pixels[pixel + channel] = Math.max(0, Math.min(255, reconstructedChannels[channel][row][column]));
      }
      pixels[pixel + 3] = 255;
    }
  }
  const originalSize = width * height * 3;
  const compressedSize = k * (height + width + 1) * 3;
  return {
    pixels,
    rows: height,
    columns: width,
    k,
    originalSize,
    compressedSize,
    compression: (1 - compressedSize / originalSize) * 100,
    mse: null
  };
}
