import { IMG_SIZE } from "./constants";
import { DFT2D, IDFT2D } from "./fourier";
import { Im, map2, remapped, Re, zeros2D, zeros3D } from "./utils";
const { log, sqrt } = Math;

export function integrate([fx, fy]: vec2<image2D>): image2D {
  const res = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
  const h = 1;
  for (let j = 1; j < IMG_SIZE; ++j) {
    res[0][j] = res[0][j - 1] + fx[0][j - 1];
  }
  for (let i = 1; i < IMG_SIZE; ++i) {
    res[i][0] = res[i - 1][0] - fx[i - 1][0];
    for (let j = 1; j < IMG_SIZE; ++j) {
      const v1 =
        res[i - 1][j - 1] + fx[i - 1][j - 1] * h - fy[i - 1][j - 1] * h;
      const v2 = res[i - 1][j] - fy[i - 1][j] * h;
      const v3 = res[i][j - 1] + fx[i][j - 1] * h;
      res[i][j] = (v1 + v2 + v3) / 3;
    }
  }
  return res;
}

export function frankotChellappa([fx, fy]: vec2<image2D>): vec2<image2D> {
  const Fx = DFT2D(fx);
  const Fy = DFT2D(fy);
  const Z = zeros3D(2, IMG_SIZE, IMG_SIZE) as complex<image2D>;
  for (let i = 0; i < IMG_SIZE; ++i) {
    for (let j = 0; j < IMG_SIZE; ++j) {
      if (i === 0 && j === 0) continue;
      Re(Z)[i][j] = (Im(Fx)[i][j] * j + Im(Fy)[i][j] * i) / (i * i + j * j);
      Im(Z)[i][j] = -(Re(Fx)[i][j] * j + Re(Fy)[i][j] * i) / (i * i + j * j);
    }
  }
  const z = IDFT2D(Z);
  const reconstructed = remapped(z[0]);
  const amplitudes = remapped(
    map2(Re(Z), Im(Z), (re, im) => {
      return log(sqrt(re * re + im * im) + 1);
    })
  );
  return [reconstructed, amplitudes];
}
