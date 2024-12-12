import { array3D } from "./utils";

export function DFT2D(f: number[][]) {
  const m = f.length;
  const n = f[0].length;

  const g = array3D(3, m, n);
  for (let i = 0; i < m; ++i) {
    for (let j = 0; j < n; ++j) {
      for (let k = 0; k < n; ++k) {
        const phi = -((2 * Math.PI) / n) * j * k;
        g[0][i][j] += f[i][k] * Math.cos(phi);
        g[1][i][j] += f[i][k] * Math.sin(phi);
      }
    }
  }

  const F = array3D(3, m, n);
  for (let j = 0; j < n; ++j) {
    for (let i = 0; i < m; ++i) {
      for (let k = 0; k < m; ++k) {
        const phi = -((2 * Math.PI) / m) * i * k;
        F[0][i][j] += g[0][k][j] * Math.cos(phi) - g[1][k][j] * Math.sin(phi);
        F[1][i][j] += g[1][k][j] * Math.cos(phi) + g[0][k][j] * Math.sin(phi);
      }
      const re = F[0][i][j];
      const im = F[1][i][j];
      F[2][i][j] = Math.log(Math.sqrt(re * re + im * im) + 1);
    }
  }

  return F;
}

export function IDFT2D(F: number[][][]) {
  const m = F[0].length;
  const n = F[0][0].length;

  const G = array3D(3, m, n);
  for (let i = 0; i < m; ++i) {
    for (let j = 0; j < n; ++j) {
      for (let k = 0; k < n; ++k) {
        const phi = ((2 * Math.PI) / n) * j * k;
        G[0][i][j] +=
          (F[0][i][k] * Math.cos(phi) - F[1][i][k] * Math.sin(phi)) / n;
        G[1][i][j] +=
          (F[1][i][k] * Math.cos(phi) + F[0][i][k] * Math.sin(phi)) / n;
      }
    }
  }

  const f = array3D(3, m, n);
  for (let j = 0; j < n; ++j) {
    for (let i = 0; i < m; ++i) {
      for (let k = 0; k < m; ++k) {
        const phi = ((2 * Math.PI) / m) * i * k;
        f[0][i][j] +=
          (G[0][k][j] * Math.cos(phi) - G[1][k][j] * Math.sin(phi)) / m;
        f[1][i][j] +=
          (G[1][k][j] * Math.cos(phi) + G[0][k][j] * Math.sin(phi)) / m;
      }
      const re = f[0][i][j];
      const im = f[1][i][j];
      f[2][i][j] = Math.log(Math.sqrt(re * re + im * im) + 1);
    }
  }

  return f;
}

export function frankotChellappa(fx: number[][], fy: number[][]) {
  const m = fx.length;
  const n = fx[0].length;

  const Fx = DFT2D(fx);
  const Fy = DFT2D(fy);

  const Z: number[][][] = array3D(3, m, n);
  for (let i = 0; i < m; ++i) {
    for (let j = 0; j < n; ++j) {
      Z[0][i][j] = (Fx[1][i][j] * j + Fy[1][i][j] * i) / (i * i + j * j) || 0;
      Z[1][i][j] = -(Fx[0][i][j] * j + Fy[0][i][j] * i) / (i * i + j * j) || 0;
      const re = Z[0][i][j];
      const im = Z[1][i][j];
      Z[2][i][j] = Math.log(Math.sqrt(re * re + im * im) + 1);
    }
  }

  const z = IDFT2D(Z);
  return [z, Z];
}
