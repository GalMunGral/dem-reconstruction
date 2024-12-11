import { mapLinear } from "three/src/math/MathUtils.js";
import { loadDemData } from "./loader";
import { updateNormal } from "./normal";
import { reflectance } from "./reflectance";
import { render } from "./shading";
import { array3D, displayGray, displayRGB } from "./utils";
import { integrate } from "./integrate";

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
  function computeNormal() {
    cancelAnimationFrame(rafHandle);
    normal = array3D(shading1.length, shading1[0].length, 3, -1);
    let iter = 360;
    rafHandle = requestAnimationFrame(function update() {
      if (!iter--) return;
      theta1 = (theta1 + 1) % 360;
      theta2 = (theta2 + 1) % 360;
      thetaInput1.value = String(theta1);
      thetaInput2.value = String(theta2);
      computeShading1();
      computeShading2();
      updateNormal(normal!, shading1, shading2, reflectance1, reflectance2);
      displayRGB("normal", normal!);
      fx = normal!.map((row) => row.map((vec) => -(vec[0] / vec[2])));
      fy = normal!.map((row) => row.map((vec) => -(vec[1] / vec[2])));
      rafHandle = requestAnimationFrame(update);
    });
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

  const computeNormalButton = document.querySelector(
    "#compute-normal"
  )! as HTMLInputElement;
  computeNormalButton.onclick = () => {
    computeNormal();
  };

  const integrateButton = document.querySelector(
    "#integrate"
  )! as HTMLInputElement;
  integrateButton.onclick = () => {
    const z = integrate(fx, fy);
    let min = Infinity;
    let max = -Infinity;
    for (let row of z) {
      for (let n of row) {
        min = Math.min(min, n);
        max = Math.max(max, n);
      }
    }
    displayGray(
      "z",
      z.map((row) => row.map((n) => mapLinear(n, min, max, 0, 1)))
    );
  };

  const dem = await loadDemData(256);
  displayGray("dem", dem);
  computeShading1();
  computeShading2();
})();
