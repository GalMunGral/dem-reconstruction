function getUrl(size: number) {
  return `https://data.isgs.illinois.edu/arcgis/rest/services/Elevation/IL_Statewide_Lidar_DEM_WGS/ImageServer/exportImage?f=image&bbox=-10214509.2568,4397450.9011,-9695960.6009,5270667.5123&bboxSR=3857&imageSR=3857&size=${size},${size}&format=png`;
}

export async function loadDemData(size: number) {
  const res = await fetch(getUrl(size));
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const { width, height } = bitmap;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = new Array(height).fill(0).map(() => new Array(width).fill(0));
  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) {
      data[i][j] = imageData.data[4 * (i * width + j)] / 255;
    }
  }
  return data;
}
