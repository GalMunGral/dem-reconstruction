type int = number;
type float = number;
type vec2<T = float> = [T, T];
type vec3<T = float> = [T, T, T];
type vec4<T = float> = [T, T, T, T];
type image1D<T = float> = T[];
type image2D<T = float> = T[][];
type image3D<T = float> = T[][][];
type image4D<T = float> = T[][][][];
type complex<T> = [T, T];

type Photo = {
  phi: float;
  theta: float;
  shading: image2D;
  reflectance: image2D;
};

type Control = {
  get(): float;
  set(value: float): void;
};
