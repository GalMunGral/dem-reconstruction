import { indexToNormal, size } from "./reflectance";
import { array2D, array3D } from "./utils";

export function updateNormal(
  normal: number[][][],
  shading1: number[][],
  shading2: number[][],
  reflectance1: number[][],
  reflectance2: number[][]
): void {
  const normalLookup = array3D(256, 256, 3, -1);
  for (let k = 0; k < size; ++k) {
    for (let l = 0; l < size; ++l) {
      if (reflectance1[k][l] < 0 || reflectance2[k][l] < 0) continue;
      const n = indexToNormal(k, l);
      if (!n) continue;
      const c1 = Math.floor(reflectance1[k][l] * 255);
      const c2 = Math.floor(reflectance2[k][l] * 255);
      normalLookup[c1][c2][0] = n.x;
      normalLookup[c1][c2][1] = n.y;
      normalLookup[c1][c2][2] = n.z;
    }
  }

  const height = shading1.length;
  const width = shading1[0].length;
  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) {
      const c1 = Math.floor(shading1[i][j] * 255);
      const c2 = Math.floor(shading2[i][j] * 255);
      const n = normalLookup[c1][c2];
      if (n[2] >= 0 && normal[i][j][2] < 0) {
        normal[i][j] = n;
      }
    }
  }
}
