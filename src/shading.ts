import { IMG_SIZE, REFLECTANCE_MAP_SIZE } from "./constants";
import { dot, radians, sample, unit, zeros2D } from "./utils";
const { cos, sin, max } = Math;

const exaggeration = 20;

export function diffuseShading(
  dem: image2D,
  theta: float,
  phi: float
): image2D {
  const res = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
  for (let i = 0; i < IMG_SIZE; ++i) {
    for (let j = 0; j < IMG_SIZE; ++j) {
      const n = unit(
        (exaggeration * (sample(dem, i, j - 1) - sample(dem, i, j + 1))) / 2,
        (exaggeration * (sample(dem, i + 1, j) - sample(dem, i - 1, j))) / 2,
        1
      );
      const l = unit(
        cos(radians(phi)) * cos(radians(theta)),
        cos(radians(phi)) * sin(radians(theta)),
        sin(radians(phi))
      );
      res[i][j] = max(0, dot(l, n));
    }
  }
  return res;
}

export function indexToNormal(i: int, j: int): vec3 | null {
  const x = -2 + j * (4 / REFLECTANCE_MAP_SIZE);
  const y = 2 + i * (-4 / REFLECTANCE_MAP_SIZE);
  const r2 = x * x + y * y;
  if (r2 >= 4) return null;
  const z = (4 - r2) / (r2 + 4);
  return unit(x * z, y * z, z);
}

export function computeReflectanceMap(theta: float, phi: float): image2D {
  const res = zeros2D(REFLECTANCE_MAP_SIZE, REFLECTANCE_MAP_SIZE) as image2D;
  for (let i = 0; i < REFLECTANCE_MAP_SIZE; ++i) {
    for (let j = 0; j < REFLECTANCE_MAP_SIZE; ++j) {
      const n = indexToNormal(i, j);
      if (!n) {
        res[i][j] = -1;
      } else {
        const l = unit(
          cos(radians(phi)) * cos(radians(theta)),
          cos(radians(phi)) * sin(radians(theta)),
          sin(radians(phi))
        );
        res[i][j] = dot(l, n);
      }
    }
  }
  return res;
}
