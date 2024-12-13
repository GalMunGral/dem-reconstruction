import { IMG_SIZE } from "./constants";
import { Im, Re, zeros2D, zeros3D } from "./utils";
const { PI, sin, cos } = Math;

export function FFT1D(f: complex<image1D>): complex<image1D> {
  const n = Re(f).length;
  if (n === 1) return f;

  const e = zeros2D(2, n / 2) as complex<image1D>;
  const o = zeros2D(2, n / 2) as complex<image1D>;
  for (let i = 0; i < n / 2; ++i) {
    Re(e)[i] = Re(f)[2 * i];
    Im(e)[i] = Im(f)[2 * i];
    Re(o)[i] = Re(f)[2 * i + 1];
    Im(o)[i] = Im(f)[2 * i + 1];
  }

  const E = FFT1D(e);
  const O = FFT1D(o);

  const F = zeros2D(2, n) as complex<image1D>;
  for (let i = 0; i < n / 2; ++i) {
    const phi = -((2 * PI) / n) * i;
    Re(F)[i] = Re(E)[i] + (cos(phi) * Re(O)[i] - sin(phi) * Im(O)[i]);
    Im(F)[i] = Im(E)[i] + (cos(phi) * Im(O)[i] + sin(phi) * Re(O)[i]);
    Re(F)[n / 2 + i] = Re(E)[i] - (cos(phi) * Re(O)[i] - sin(phi) * Im(O)[i]);
    Im(F)[n / 2 + i] = Im(E)[i] - (cos(phi) * Im(O)[i] + sin(phi) * Re(O)[i]);
  }
  return F;
}

export function IFFT1D(f: complex<image1D>): complex<image1D> {
  const n = Re(f).length;
  if (n === 1) return f;

  const e = zeros2D(2, n / 2) as complex<image1D>;
  const o = zeros2D(2, n / 2) as complex<image1D>;
  for (let i = 0; i < n / 2; ++i) {
    Re(e)[i] = Re(f)[2 * i];
    Im(e)[i] = Im(f)[2 * i];
    Re(o)[i] = Re(f)[2 * i + 1];
    Im(o)[i] = Im(f)[2 * i + 1];
  }

  const E = IFFT1D(e);
  const O = IFFT1D(o);

  const F = zeros2D(2, n) as complex<image1D>;
  for (let i = 0; i < n / 2; ++i) {
    const phi = ((2 * PI) / n) * i;
    Re(F)[i] = 0.5 * (Re(E)[i] + (cos(phi) * Re(O)[i] - sin(phi) * Im(O)[i]));
    Im(F)[i] = 0.5 * (Im(E)[i] + (cos(phi) * Im(O)[i] + sin(phi) * Re(O)[i]));
    Re(F)[n / 2 + i] =
      0.5 * (Re(E)[i] - (cos(phi) * Re(O)[i] - sin(phi) * Im(O)[i]));
    Im(F)[n / 2 + i] =
      0.5 * (Im(E)[i] - (cos(phi) * Im(O)[i] + sin(phi) * Re(O)[i]));
  }
  return F;
}

export function DFT2D(f: image2D): complex<image2D> {
  const F = zeros3D(2, IMG_SIZE, IMG_SIZE) as complex<image2D>;
  const h = zeros2D(2, IMG_SIZE) as complex<image1D>;
  for (let i = 0; i < IMG_SIZE; ++i) {
    for (let j = 0; j < IMG_SIZE; ++j) {
      Re(h)[j] = f[i][j];
    }
    const H = FFT1D(h);
    Re(F)[i] = Re(H);
    Im(F)[i] = Im(H);
  }
  for (let j = 0; j < IMG_SIZE; ++j) {
    for (let i = 0; i < IMG_SIZE; ++i) {
      Re(h)[i] = Re(F)[i][j];
      Im(h)[i] = Im(F)[i][j];
    }
    const H = FFT1D(h);
    for (let i = 0; i < IMG_SIZE; ++i) {
      Re(F)[i][j] = Re(H)[i];
      Im(F)[i][j] = Im(H)[i];
    }
  }
  return F;
}

export function IDFT2D(F: complex<image2D>): complex<image2D> {
  const f = zeros3D(2, IMG_SIZE, IMG_SIZE) as complex<image2D>;
  const h = zeros2D(2, IMG_SIZE) as complex<image1D>;
  for (let i = 0; i < IMG_SIZE; ++i) {
    for (let j = 0; j < IMG_SIZE; ++j) {
      Re(h)[j] = Re(F)[i][j];
      Im(h)[j] = Im(F)[i][j];
    }
    const H = IFFT1D(h);
    Re(f)[i] = Re(H);
    Im(f)[i] = Im(H);
  }
  for (let j = 0; j < IMG_SIZE; ++j) {
    for (let i = 0; i < IMG_SIZE; ++i) {
      Re(h)[i] = Re(f)[i][j];
      Im(h)[i] = Im(f)[i][j];
    }
    const H = IFFT1D(h);
    for (let i = 0; i < IMG_SIZE; ++i) {
      Re(f)[i][j] = Re(H)[i];
      Im(f)[i][j] = Im(H)[i];
    }
  }
  return f;
}
