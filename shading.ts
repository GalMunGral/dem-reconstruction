import { Vector3 } from "three";
import { clamp, degToRad } from "three/src/math/MathUtils.js";
import { array2D } from "./utils";

const exaggeration = 20;
const phi = 45;

function sample(image: number[][], i: number, j: number) {
  i = clamp(i, 0, image.length - 1);
  j = clamp(j, 0, image[0].length - 1);
  return image[i][j];
}

export function render(dem: number[][], theta: number) {
  const m = dem.length;
  const n = dem[0].length;

  const res = array2D(m, n);
  for (let i = 0; i < m; ++i) {
    for (let j = 0; j < n; ++j) {
      const n = new Vector3(
        (exaggeration * (sample(dem, i, j - 1) - sample(dem, i, j + 1))) / 2,
        (exaggeration * (sample(dem, i + 1, j) - sample(dem, i - 1, j))) / 2,
        1
      ).normalize();
      const l = new Vector3(
        Math.cos(degToRad(phi)) * Math.cos(degToRad(theta)),
        Math.cos(degToRad(phi)) * Math.sin(degToRad(theta)),
        Math.sin(degToRad(phi))
      ).normalize();
      res[i][j] = Math.max(0, l.dot(n));
    }
  }
  return res;
}
