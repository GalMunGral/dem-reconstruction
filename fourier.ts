export function DFT(
  res: number[][][],
  signal: number[][],
  i: number,
  j: number,
  range: number[]
) {
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
  res[2][i][j] = Math.log(Math.sqrt(re * re + im * im) + 1);
  range[0] = Math.min(range[0], res[2][i][j]);
  range[1] = Math.max(range[1], res[2][i][j]);
}

export function InverseDFT(
  res: number[][][],
  freq: number[][][],
  k: number,
  l: number,
  range: number[]
) {
  const m = freq[0].length;
  const n = freq[1].length;
  for (let i = 0; i < m; ++i) {
    for (let j = 0; j < n; ++j) {
      const phi = ((2 * Math.PI) / m) * k * i + ((2 * Math.PI) / n) * l * j;
      res[0][i][j] +=
        (freq[0][k][l] * Math.cos(phi) - freq[1][k][l] * Math.sin(phi)) /
        (m * n);
      res[1][i][j] +=
        (freq[0][k][l] * Math.sin(phi) + freq[1][k][l] * Math.cos(phi)) /
        (m * n);
      range[0] = Math.min(range[0], res[0][i][j]);
      range[1] = Math.max(range[1], res[0][i][j]);
    }
  }
}
