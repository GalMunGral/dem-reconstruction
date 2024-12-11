import { Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { array2D } from "./utils";

const exaggeration = 20;
const phi = 45;

export function render(dem: number[][], theta: number) {
  const height = dem.length;
  const width = dem[0].length;

  const res = array2D(height, width);
  for (let i = 1; i < height - 1; ++i) {
    for (let j = 1; j < width - 1; ++j) {
      const n = new Vector3(
        (exaggeration * (dem[i][j - 1] - dem[i][j + 1])) / 2,
        (exaggeration * (dem[i + 1][j] - dem[i - 1][j])) / 2,
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
