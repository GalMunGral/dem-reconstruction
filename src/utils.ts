const { PI, min, max, sqrt, random } = Math;

export function Re<T>(image: complex<T>) {
  return image[0];
}

export function Im<T>(image: complex<T>) {
  return image[1];
}

export function rand(start: float, end: float) {
  return start + random() * (end - start);
}

export function sample(image: image2D, i: int, j: int) {
  i = clamp(i, 0, image.length - 1);
  j = clamp(j, 0, image[0].length - 1);
  return image[i][j];
}

export function unit(x: float, y: float, z: float): vec3 {
  const length = sqrt(x * x + y * y + z * z);
  return [x / length, y / length, z / length];
}

export function dot(u: vec3, v: vec3): float {
  return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}

export function clamp(v: float, l: float, r: float): float {
  return min(max(v, l), r);
}

export function radians(degree: float) {
  return degree * (PI / 180);
}

export function mapLinear(
  v: float,
  a: float,
  b: float,
  c: float,
  d: float
): float {
  return c + ((d - c) / (b - a)) * (v - a);
}

export function zeros1D(n: int): image1D {
  return Array(n).fill(0);
}

export function zeros2D(m: int, n: int): image2D {
  return zeros1D(m).map(() => zeros1D(n));
}

export function zeros3D(l: int, m: int, n: int): image3D {
  return zeros1D(l).map(() => zeros2D(m, n));
}

export function remapped(image: image2D): image2D {
  let lower = Infinity;
  let upper = -Infinity;
  for (let row of image) {
    for (let v of row) {
      lower = min(lower, v);
      upper = max(upper, v);
    }
  }
  return image.map((row) =>
    row.map((val) => mapLinear(val, lower, upper, 0, 1))
  );
}

export function map(I: image2D, fn: (v: float) => float): image2D {
  return I.map((row) => row.map((val) => fn(val)));
}

export function map2(
  input1: image2D,
  input2: image2D,
  fn: (a: float, b: float) => float
): image2D {
  return input1.map((row, i) => row.map((val, j) => fn(val, input2[i][j])));
}

export function transform(
  input1: image2D,
  input2: image2D,
  output: image2D,
  fn: (a: float, b: float) => float
): void {
  for (let i = 0; i < output.length; ++i) {
    for (let j = 0; j < output[i].length; ++j) {
      output[i][j] = fn(input1[i][j], input2[i][j]);
    }
  }
}
