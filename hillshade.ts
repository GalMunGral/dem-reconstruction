import { mapLinear } from "three/src/math/MathUtils.js";
import { loadDemData } from "./loader";
import { updateNormal } from "./normal";
import { reflectance } from "./reflectance";
import { render } from "./shading";
import { array3D, displayGray, displayRGB } from "./utils";
import { DFT, InverseDFT } from "./fourier";

(async () => {
  let theta1 = 0;
  let theta2 = 90;

  let shading1: number[][] = [[]];
  let reflectance1: number[][] = [[]];
  let shading2: number[][] = [[]];
  let reflectance2: number[][] = [[]];
  let normal: number[][][] = [[[]]];
  let fx: number[][] = [[]];
  let fy: number[][] = [[]];

  function computeShading1() {
    shading1 = render(dem, theta1);
    reflectance1 = reflectance(theta1);
    displayGray("hillshade-1", shading1);
    displayGray("reflectance-1", reflectance1);
  }

  function computeShading2() {
    shading2 = render(dem, theta2);
    reflectance2 = reflectance(theta2);
    displayGray("hillshade-2", shading2);
    displayGray("reflectance-2", reflectance2);
  }

  let rafHandle = -1;
  async function computeNormal() {
    return new Promise<void>((resolve) => {
      cancelAnimationFrame(rafHandle);
      normal = array3D(shading1.length, shading1[0].length, 3, -1);
      let iter = 30;
      rafHandle = requestAnimationFrame(function update() {
        if (!iter--) {
          resolve();
          return;
        }
        theta1 = (theta1 + 10) % 360;
        theta2 = (theta2 + 10) % 360;
        thetaInput1.value = String(theta1);
        thetaInput2.value = String(theta2);
        computeShading1();
        computeShading2();
        updateNormal(normal!, shading1, shading2, reflectance1, reflectance2);
        displayRGB("normal", normal!);
        fx = normal!.map((row) => row.map((vec) => -(vec[0] / vec[2])));
        fy = normal!.map((row) => row.map((vec) => vec[1] / vec[2])); // TODO: sign
        rafHandle = requestAnimationFrame(update);
      });
    });
  }

  let Fx: number[][][] = [[[]]];
  let Fy: number[][][] = [[[]]];
  async function computeDFT() {
    const m = fx.length;
    const n = fx[0].length;

    Fx = array3D(3, m, n);
    Fy = array3D(3, m, n);

    const Z: number[][][] = array3D(3, fy.length, fy[0].length);
    const z = array3D(3, m, n);
    const rangeFx = [Infinity, -Infinity];
    const rangeFy = [Infinity, -Infinity];
    const rangeZ = [Infinity, -Infinity];
    const range = [Infinity, -Infinity];

    for (let s = 0; s < m + n - 1; ++s) {
      let i = s < m ? s : m - 1;
      let j = s - i;
      while (i >= 0 && j < n) {
        DFT(Fx, fx, i, j, rangeFx);
        DFT(Fy, fy, i, j, rangeFy);

        const re = (Z[0][i][j] =
          (Fx[1][i][j] * j + Fy[1][i][j] * i) / (i * i + j * j) || 0);
        const im = (Z[1][i][j] =
          -(Fx[0][i][j] * j + Fy[0][i][j] * i) / (i * i + j * j) || 0);
        Z[2][i][j] = Math.log(Math.sqrt(re * re + im * im) + 1);
        rangeZ[0] = Math.min(rangeZ[0], Z[2][i][j]);
        rangeZ[1] = Math.max(rangeZ[1], Z[2][i][j]);

        InverseDFT(z, Z, i, j, range);

        displayGray(
          "dft-fx",
          Fx[2].map((row) =>
            row.map((v) => mapLinear(v, rangeFx[0], rangeFx[1], 0, 1))
          )
        );
        displayGray(
          "dft-fy",
          Fy[2].map((row) =>
            row.map((v) => mapLinear(v, rangeFy[0], rangeFy[1], 0, 1))
          )
        );
        displayGray(
          "dft-z",
          Z[2].map((row) =>
            row.map((v) => mapLinear(v, rangeZ[0], rangeZ[1], 0, 1))
          )
        );
        displayGray(
          "best-fit",
          z[0].map((row) =>
            row.map((v) => mapLinear(v, range[0], range[1], 0, 1))
          )
        );
        --i;
        ++j;
        await new Promise((resolve) => setTimeout(resolve));
      }
    }
  }

  const thetaInput1 = document.querySelector("#theta-1")! as HTMLInputElement;
  thetaInput1.value = String(theta1);
  thetaInput1.oninput = () => {
    theta1 = +thetaInput1.value;
    computeShading1();
  };

  const thetaInput2 = document.querySelector("#theta-2")! as HTMLInputElement;
  thetaInput2.value = String(theta2);
  thetaInput2.oninput = () => {
    theta2 = +thetaInput2.value;
    computeShading2();
  };

  const reconstructButton = document.querySelector(
    "#reconstruct"
  )! as HTMLInputElement;
  reconstructButton.onclick = async () => {
    reconstructButton.disabled = true;
    await computeNormal();
    await computeDFT();
  };

  const dem = await loadDemData(300);
  displayGray("dem", dem);
  computeShading1();
  computeShading2();
})();
