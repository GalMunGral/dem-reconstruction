import { IMG_SIZE } from "./constants";
import {
  control,
  displayGray,
  displayRGBA,
  loadDemData as loadDEM,
  button,
} from "./io";
import { resolveSurfaceNormal } from "./normal";
import { frankotChellappa, integrate } from "./integrate";
import { computeReflectanceMap, diffuseShading } from "./shading";
import {
  clamp,
  map,
  mapLinear,
  remapped,
  transform,
  X,
  Y,
  Z,
  zeros2D,
  zeros3D,
} from "./utils";

const INITIAL_PHI = 45;
const INITIAL_THETA = 45;

const photos: Photo[] = [];

let DEM = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
let normal = zeros3D(4, IMG_SIZE, IMG_SIZE) as vec4<image2D>;
let gradient = zeros3D(2, IMG_SIZE, IMG_SIZE) as vec2<image2D>;
let integral = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
let amplitudes = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
let reconstructed = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;

const theta = control("theta", {
  initialValue: INITIAL_THETA,
  onInput() {
    captureImage();
  },
  onChange() {
    updateGradients();
    fitModel();
  },
});

const phi = control("phi", {
  initialValue: INITIAL_PHI,
  onInput() {
    captureImage();
  },
  onChange() {
    updateGradients();
    fitModel();
  },
});

(async () => {
  DEM = await loadDEM();
  displayGray("dem", DEM);
  reconstruct();
  button("reconstruct", () => reconstruct());
})();

let rafHandle = -1;
function reconstruct() {
  cancelAnimationFrame(rafHandle);
  reset();
  let iter = 360 * 10;
  let interval = 1;
  rafHandle = requestAnimationFrame(function step() {
    if (!iter--) return;
    if (iter % 360 == 0) {
      phi.set(clamp(phi.get() - 1, 10, 80));
    }
    theta.set((theta.get() + 1) % 360);
    captureImage();
    updateGradients();
    if (iter % interval == 0) {
      fitModel();
      interval = clamp(interval * 4, 0, 32);
    }
    rafHandle = requestAnimationFrame(step);
  });
}

function reset() {
  photos.length = 0;
  normal = zeros3D(4, IMG_SIZE, IMG_SIZE) as vec4<image2D>;
  gradient = zeros3D(2, IMG_SIZE, IMG_SIZE) as vec2<image2D>;
  integral = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
  amplitudes = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
  reconstructed = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
}

function captureImage() {
  if (
    photos.some(
      (photo) => photo.theta === theta.get() && photo.phi === phi.get()
    )
  ) {
    return;
  }
  const shading = diffuseShading(DEM, theta.get(), phi.get());
  const reflectance = computeReflectanceMap(theta.get(), phi.get());
  photos.push({
    phi: phi.get(),
    theta: theta.get(),
    shading,
    reflectance,
  });
  if (photos.length > 3) {
    photos.shift();
  }
  displayGray("shading", shading);
  displayGray("reflectance", reflectance);
}

function updateGradients() {
  if (photos.length < 3) return;
  resolveSurfaceNormal(normal, photos[0], photos[1], photos[2]);
  transform(X(normal), Z(normal), X(gradient), (x, z) => {
    return z === 0 ? 0 : -(x / z);
  });
  transform(Y(normal), Z(normal), Y(gradient), (y, z) => {
    return z === 0 ? 0 : y / z;
  });
  integral = remapped(integrate(gradient));

  displayRGBA("normal", [
    map(normal[0], (v) => clamp(mapLinear(v, -1, 1, 0, 1), 0, 1)),
    map(normal[1], (v) => clamp(mapLinear(v, -1, 1, 0, 1), 0, 1)),
    map(normal[2], (v) => clamp(mapLinear(v, -1, 1, 0, 1), 0, 1)),
    normal[3],
  ]);
  displayGray("integral", integral);
}

function fitModel() {
  [reconstructed, amplitudes] = frankotChellappa(gradient);
  displayGray("amplitudes", amplitudes);
  displayGray("reconstructed", reconstructed);
}
