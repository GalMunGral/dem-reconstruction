import { array2D, array3D } from "./utils";

function FFT1D(f: number[][]): number[][] {
  const n = f[0].length;
  if (n === 1) return f;

  const e = array2D(2, n / 2);
  const o = array2D(2, n / 2);
  for (let i = 0; i < n / 2; ++i) {
    e[0][i] = f[0][2 * i];
    e[1][i] = f[1][2 * i];
    o[0][i] = f[0][2 * i + 1];
    o[1][i] = f[1][2 * i + 1];
  }
  const E = FFT1D(e);
  const O = FFT1D(o);
  const F = array2D(2, n);
  for (let i = 0; i < n / 2; ++i) {
    const phi = -((2 * Math.PI) / n) * i;
    F[0][i] = E[0][i] + (Math.cos(phi) * O[0][i] - Math.sin(phi) * O[1][i]);
    F[1][i] = E[1][i] + (Math.cos(phi) * O[1][i] + Math.sin(phi) * O[0][i]);
    F[0][n / 2 + i] =
      E[0][i] - (Math.cos(phi) * O[0][i] - Math.sin(phi) * O[1][i]);
    F[1][n / 2 + i] =
      E[1][i] - (Math.cos(phi) * O[1][i] + Math.sin(phi) * O[0][i]);
  }
  return F;
}

function IFFT1D(f: number[][]): number[][] {
  const n = f[0].length;
  if (n === 1) return f;

  const e = array2D(2, n / 2);
  const o = array2D(2, n / 2);
  for (let i = 0; i < n / 2; ++i) {
    e[0][i] = f[0][2 * i];
    e[1][i] = f[1][2 * i];
    o[0][i] = f[0][2 * i + 1];
    o[1][i] = f[1][2 * i + 1];
  }
  const E = IFFT1D(e);
  const O = IFFT1D(o);
  const F = array2D(2, n);
  for (let i = 0; i < n / 2; ++i) {
    const phi = ((2 * Math.PI) / n) * i;
    F[0][i] =
      0.5 * (E[0][i] + (Math.cos(phi) * O[0][i] - Math.sin(phi) * O[1][i]));
    F[1][i] =
      0.5 * (E[1][i] + (Math.cos(phi) * O[1][i] + Math.sin(phi) * O[0][i]));
    F[0][n / 2 + i] =
      0.5 * (E[0][i] - (Math.cos(phi) * O[0][i] - Math.sin(phi) * O[1][i]));
    F[1][n / 2 + i] =
      0.5 * (E[1][i] - (Math.cos(phi) * O[1][i] + Math.sin(phi) * O[0][i]));
  }
  return F;
}

export function DFT2D(f: number[][]) {
  const m = f.length;
  const n = f[0].length;

  const F = array3D(2, m, n);
  for (let i = 0; i < m; ++i) {
    const h = array2D(2, n);
    for (let j = 0; j < n; ++j) {
      h[0][j] = f[i][j];
    }
    const H = FFT1D(h);
    F[0][i] = H[0];
    F[1][i] = H[1];
  }

  for (let j = 0; j < n; ++j) {
    const h = array2D(2, m);
    for (let i = 0; i < m; ++i) {
      h[0][i] = F[0][i][j];
      h[1][i] = F[1][i][j];
    }
    const H = FFT1D(h);
    for (let i = 0; i < m; ++i) {
      F[0][i][j] = H[0][i];
      F[1][i][j] = H[1][i];
    }
  }

  return F;
}

function IDFT2D(F: number[][][]) {
  const m = F[0].length;
  const n = F[0][0].length;

  const f = array3D(2, m, n);
  for (let i = 0; i < m; ++i) {
    const h = array2D(2, n);
    for (let j = 0; j < n; ++j) {
      h[0][j] = F[0][i][j];
      h[1][j] = F[1][i][j];
    }
    const H = IFFT1D(h);
    f[0][i] = H[0];
    f[1][i] = H[1];
  }

  for (let j = 0; j < n; ++j) {
    const h = array2D(2, m);
    for (let i = 0; i < m; ++i) {
      h[0][i] = f[0][i][j];
      h[1][i] = f[1][i][j];
    }
    const H = IFFT1D(h);
    for (let i = 0; i < m; ++i) {
      f[0][i][j] = H[0][i];
      f[1][i][j] = H[1][i];
    }
  }

  return f;
}

export function frankotChellappa(fx: number[][], fy: number[][]) {
  const m = fx.length;
  const n = fx[0].length;

  const Fx = DFT2D(fx);
  const Fy = DFT2D(fy);

  const Z: number[][][] = array3D(4, m, n);
  for (let i = 0; i < m; ++i) {
    for (let j = 0; j < n; ++j) {
      Z[0][i][j] = (Fx[1][i][j] * j + Fy[1][i][j] * i) / (i * i + j * j) || 0;
      Z[1][i][j] = -(Fx[0][i][j] * j + Fy[0][i][j] * i) / (i * i + j * j) || 0;
      const re = Z[0][i][j];
      const im = Z[1][i][j];
      Z[2][i][j] = Math.log(Math.sqrt(re * re + im * im) + 1);
      Z[3][i][j] = Math.atan2(im, re);
    }
  }

  const z = IDFT2D(Z);
  return [z, Z];
}
