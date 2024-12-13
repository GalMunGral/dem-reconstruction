import { IMG_SIZE } from "./constants";
import {
  displayGray,
  displayRGBA,
  loadDemData as loadDEM,
  onChange,
  onClick,
  onInput,
} from "./io";
import { updateNormal } from "./normal";
import { frankotChellappa, integrate } from "./reconstruct";
import { computeReflectanceMap, diffuseShading } from "./shading";
import {
  clamp,
  map,
  mapLinear,
  rand,
  remapped,
  transform,
  zeros2D,
  zeros3D,
} from "./utils";

(async () => {
  let prevPhi = 30;
  let prevTheta = 0;
  let prevShading = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
  let prevReflectance = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;

  let phi = 30;
  let theta = 0;
  let shading = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
  let reflectance = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;

  let normal = zeros3D(4, IMG_SIZE, IMG_SIZE) as vec4<image2D>;
  let gradient = zeros3D(2, IMG_SIZE, IMG_SIZE) as vec2<image2D>;
  let integral = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
  let amplitudes = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
  let reconstructed = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;

  const DEM = await loadDEM();
  displayGray("dem", DEM);

  captureImage();
  updateGradients();
  fitModel();

  onInput(
    "theta",
    (value) => {
      theta = value;
      captureImage();
    },
    theta
  );

  onChange("theta", () => {
    updateGradients();
    fitModel();
  });

  onInput(
    "phi",
    (value) => {
      phi = value;
      captureImage();
    },
    phi
  );

  onChange("phi", () => {
    updateGradients();
    fitModel();
  });

  let rafHandle = -1;
  onClick("reconstruct", () => {
    cancelAnimationFrame(rafHandle);
    reset();
    let iter = 30;
    rafHandle = requestAnimationFrame(function step() {
      if (!iter--) {
        fitModel();
        return;
      }
      theta = (theta + rand(1, 5)) % 360;
      captureImage();
      updateGradients();
      rafHandle = requestAnimationFrame(step);
    });
  });

  function reset() {
    prevPhi = 30;
    prevTheta = 0;
    prevShading = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
    prevReflectance = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;

    phi = 30;
    theta = 0;
    shading = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
    reflectance = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;

    normal = zeros3D(4, IMG_SIZE, IMG_SIZE) as vec4<image2D>;
    gradient = zeros3D(2, IMG_SIZE, IMG_SIZE) as vec2<image2D>;
    integral = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
    amplitudes = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;
    reconstructed = zeros2D(IMG_SIZE, IMG_SIZE) as image2D;

    captureImage();
    updateGradients();
    fitModel();
  }

  function captureImage() {
    shading = diffuseShading(DEM, theta, phi);
    reflectance = computeReflectanceMap(theta, phi);
    displayGray("shading", shading);
    displayGray("reflectance", reflectance);
  }

  function updateGradients() {
    if (theta !== prevTheta || phi !== prevPhi) {
      updateNormal(normal, shading, prevShading, reflectance, prevReflectance);
      transform(normal[0], normal[2], gradient[0], (x, z) => {
        return z === 0 ? 0 : -(x / z);
      });
      transform(normal[1], normal[2], gradient[1], (y, z) => {
        return z === 0 ? 0 : y / z;
      });
      integral = remapped(integrate(gradient));
    }
    prevShading = shading;
    prevReflectance = reflectance;
    prevPhi = phi;
    prevTheta = theta;

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
})();
