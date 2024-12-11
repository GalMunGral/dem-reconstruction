export function displayGray(canvasId: string, data: number[][]) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const height = data.length;
  const width = data[0].length;
  canvas.width = width;
  canvas.height = height;

  const imageData = new ImageData(width, height);
  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) {
      if (data[i][j] >= 0) {
        const v = data[i][j] * 255;
        imageData.data[4 * (i * width + j)] = v;
        imageData.data[4 * (i * width + j) + 1] = v;
        imageData.data[4 * (i * width + j) + 2] = v;
        imageData.data[4 * (i * width + j) + 3] = 255;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export function displayRGB(canvasId: string, data: number[][][]) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const height = data.length;
  const width = data[0].length;
  canvas.width = width;
  canvas.height = height;

  const imageData = new ImageData(width, height);
  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) {
      const [r, g, b] = data[i][j];
      if (b >= 0) {
        imageData.data[4 * (i * width + j)] = r * 255;
        imageData.data[4 * (i * width + j) + 1] = g * 255;
        imageData.data[4 * (i * width + j) + 2] = b * 255;
        imageData.data[4 * (i * width + j) + 3] = 255;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export function array2D(m: number, n: number, initialValue = 0): number[][] {
  return Array(m)
    .fill(0)
    .map(() => Array(n).fill(initialValue));
}

export function array3D(
  m: number,
  n: number,
  c: number,
  initialValue = 0
): number[][][] {
  return Array(m)
    .fill(0)
    .map(() =>
      Array(n)
        .fill(0)
        .map(() => Array(c).fill(initialValue))
    );
}
