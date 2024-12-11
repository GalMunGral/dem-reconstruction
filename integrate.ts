import { array2D } from "./utils";

const h = 0.001;

export function integrate(fx: number[][], fy: number[][]) {
  const m = fx.length;
  const n = fx[0].length;
  const res = array2D(m, n);
  for (let j = 1; j < n; ++j) {
    res[0][j] = res[0][j - 1] + fx[0][j - 1];
  }
  for (let i = 1; i < m; ++i) {
    res[i][0] = res[i - 1][0] - fx[i - 1][0];
    for (let j = 1; j < n; ++j) {
      const v1 =
        res[i - 1][j - 1] + fx[i - 1][j - 1] * h - fy[i - 1][j - 1] * h;
      const v2 = res[i - 1][j] - fy[i - 1][j] * h;
      const v3 = res[i][j - 1] + fx[i][j - 1] * h;
      res[i][j] = (v1 + v2 + v3) / 3;
    }
  }
  return res;
}
