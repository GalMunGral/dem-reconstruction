import { Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { array2D } from "./utils";

const phi = 45;
export const size = 100;

export function indexToNormal(i: number, j: number): Vector3 | null {
  const x = -2 + j * (4 / size);
  const y = 2 + i * (-4 / size);
  const r2 = x * x + y * y;
  if (r2 >= 4) return null;
  const z = (4 - r2) / (r2 + 4);
  return new Vector3(x * z, y * z, z).normalize();
}

export function reflectance(theta: number) {
  const res = array2D(size, size);
  for (let i = 0; i < size; ++i) {
    for (let j = 0; j < size; ++j) {
      const n = indexToNormal(i, j);
      if (!n) {
        res[i][j] = -1;
      } else {
        const l = new Vector3(
          Math.cos(degToRad(phi)) * Math.cos(degToRad(theta)),
          Math.cos(degToRad(phi)) * Math.sin(degToRad(theta)),
          Math.sin(degToRad(phi))
        ).normalize();
        res[i][j] = l.dot(n);
      }
    }
  }
  return res;
}
