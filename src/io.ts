import { IMG_SIZE } from "./constants";
import { clamp, zeros2D } from "./utils";

export function displayGray(canvasId: string, data: image2D) {
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
      const intensity = clamp(data[i][j], 0, 1);
      imageData.data[4 * (i * width + j)] = intensity * 255;
      imageData.data[4 * (i * width + j) + 1] = intensity * 255;
      imageData.data[4 * (i * width + j) + 2] = intensity * 255;
      imageData.data[4 * (i * width + j) + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export function displayRGBA(canvasId: string, data: vec4<image2D>) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const height = data[0].length;
  const width = data[0][0].length;
  canvas.width = width;
  canvas.height = height;

  const imageData = new ImageData(width, height);
  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) {
      const r = clamp(data[0][i][j], 0, 1);
      const g = clamp(data[1][i][j], 0, 1);
      const b = clamp(data[2][i][j], 0, 1);
      const a = clamp(data[3][i][j], 0, 1);
      imageData.data[4 * (i * width + j)] = r * 255;
      imageData.data[4 * (i * width + j) + 1] = g * 255;
      imageData.data[4 * (i * width + j) + 2] = b * 255;
      imageData.data[4 * (i * width + j) + 3] = a * 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export function onInput(
  elementId: string,
  fn: (value: float) => void,
  initalValue: float
) {
  const el = document.getElementById(elementId) as HTMLInputElement | null;
  if (el) {
    el.value = String(initalValue);
    el.addEventListener("input", () => fn(Number(el.value)));
  }
}

export function onChange(elementId: string, fn: (value: float) => void) {
  const el = document.getElementById(elementId) as HTMLInputElement | null;
  if (el) {
    el.addEventListener("change", () => fn(Number(el.value)));
  }
}

export function onClick(elementId: string, fn: () => void) {
  const el = document.getElementById(elementId) as HTMLInputElement | null;
  if (el) {
    el.addEventListener("click", () => fn());
  }
}

export async function loadDemData(): Promise<image2D> {
  const url = `https://data.isgs.illinois.edu/arcgis/rest/services/Elevation/IL_Statewide_Lidar_DEM_WGS/ImageServer/exportImage?f=image&bbox=-10214509.2568,4397450.9011,-9695960.6009,5270667.2563&bboxSR=3857&imageSR=3857&size=${IMG_SIZE},${IMG_SIZE}&format=png`;
  const res = await fetch(url);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);

  const canvas = new OffscreenCanvas(IMG_SIZE, IMG_SIZE);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, IMG_SIZE, IMG_SIZE);

  const data = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
  for (let i = 0; i < IMG_SIZE; ++i) {
    for (let j = 0; j < IMG_SIZE; ++j) {
      data[i][j] = imageData.data[4 * (i * IMG_SIZE + j)] / 255;
    }
  }
  return data;
}
