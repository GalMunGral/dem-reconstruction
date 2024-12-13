import { IMG_SIZE, REFLECTANCE_MAP_SIZE } from "./constants";
import { indexToNormal } from "./shading";
import { zeros3D } from "./utils";
const { floor } = Math;

export function updateNormal(
  normal: vec4<image2D>,
  shading1: image2D,
  shading2: image2D,
  reflectance1: image2D,
  reflectance2: image2D
): void {
  const normalLookup = zeros3D(256, 256, 4) as image2D<vec4>;
  for (let i = 0; i < REFLECTANCE_MAP_SIZE; ++i) {
    for (let j = 0; j < REFLECTANCE_MAP_SIZE; ++j) {
      if (reflectance1[i][j] < 0 || reflectance2[i][j] < 0) continue;
      const n = indexToNormal(i, j);
      if (!n) continue;
      const c1 = floor(reflectance1[i][j] * 255);
      const c2 = floor(reflectance2[i][j] * 255);
      normalLookup[c1][c2] = [n[0], n[1], n[2], 1];
    }
  }
  for (let i = 0; i < IMG_SIZE; ++i) {
    for (let j = 0; j < IMG_SIZE; ++j) {
      const c1 = floor(shading1[i][j] * 255);
      const c2 = floor(shading2[i][j] * 255);
      const n = normalLookup[c1][c2];
      if (normal[3][i][j] === 0) {
        normal[0][i][j] = n[0];
        normal[1][i][j] = n[1];
        normal[2][i][j] = n[2];
        normal[3][i][j] = n[3];
      }
    }
  }
}
