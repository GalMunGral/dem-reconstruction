import { IMG_SIZE, REFLECTANCE_MAP_SIZE } from "./constants";
import { indexToNormal } from "./shading";
import { W, X, Y, Z } from "./utils";
const { floor } = Math;

const BIT_DEPTH = 12;

function index(c1: float, c2: float, c3: float): int {
  const n = 1 << BIT_DEPTH;
  return (c1 * n + c2) * n + c3;
}

export function resolveSurfaceNormal(
  normal: vec4<image2D>,
  photo1: Photo,
  photo2: Photo,
  photo3: Photo
): void {
  const size = 1 << BIT_DEPTH;
  const normalLookup: vec4[] = [];
  for (let i = 0; i < REFLECTANCE_MAP_SIZE; ++i) {
    for (let j = 0; j < REFLECTANCE_MAP_SIZE; ++j) {
      if (
        photo1.reflectance[i][j] <= 0 ||
        photo2.reflectance[i][j] <= 0 ||
        photo3.reflectance[i][j] <= 0
      ) {
        continue;
      }
      const n = indexToNormal(i, j);
      if (!n) continue;
      const c1 = floor(photo1.reflectance[i][j] * (size - 1));
      const c2 = floor(photo2.reflectance[i][j] * (size - 1));
      const c3 = floor(photo3.reflectance[i][j] * (size - 1));
      normalLookup[index(c1, c2, c3)] = [X(n), Y(n), Z(n), 1];
    }
  }
  for (let i = 0; i < IMG_SIZE; ++i) {
    for (let j = 0; j < IMG_SIZE; ++j) {
      const c1 = floor(photo1.shading[i][j] * (size - 1));
      const c2 = floor(photo2.shading[i][j] * (size - 1));
      const c3 = floor(photo3.shading[i][j] * (size - 1));
      const n = normalLookup[index(c1, c2, c3)];
      if (normal[3][i][j] === 0 && n != null) {
        X(normal)[i][j] = X(n);
        Y(normal)[i][j] = Y(n);
        Z(normal)[i][j] = Z(n);
        W(normal)[i][j] = W(n);
      }
    }
  }
}
