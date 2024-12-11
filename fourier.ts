export function DFT(
  res: number[][][],
  signal: number[][],
  i: number,
  j: number
): void {
  const m = signal.length;
  const n = signal[0].length;
  for (let k = 0; k < m; ++k) {
    for (let l = 0; l < n; ++l) {
      const phi = ((2 * Math.PI) / m) * i * k + ((2 * Math.PI) / n) * j * l;
      res[0][i][j] += signal[k][l] * Math.cos(-phi);
      res[1][i][j] += signal[k][l] * Math.sin(-phi);
    }
  }
  const re = res[0][i][j];
  const im = res[1][i][j];
  res[2][i][j] = Math.sqrt(re * re + im * im);
}
