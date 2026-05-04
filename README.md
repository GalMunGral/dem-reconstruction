# Shape from Shading

**Live demo:** https://galmungral.github.io/dem-reconstruction/

## Rhetorical Design

### Purpose

For a general technical audience, we show — through the full reconstruction
pipeline — that shading encodes 3D geometry. A single shading image is lossy:
many different surfaces can produce the same pixel intensities under a fixed
light, so depth cannot be uniquely recovered from one image alone. Recovering
it requires images under multiple lighting directions, which in turn requires
the ability to vary the light. This justifies interactivity not as visual
polish but as an epistemic necessity: a static image or video cannot provide
the information required for full depth recovery.

### Strategy

We demonstrate the argument concretely using real elevation data (DEM) as
ground truth. The DEM is rendered under a Lambertian shading model at many
lighting angles; photometric stereo recovers surface normals from three images
at a time; the normals are converted to gradients and integrated back to a
surface, which can be compared directly against the original.

Two integration methods are shown side by side to make the distinction between
local and global approaches concrete: a line integral accumulates gradients
along a path (fast, but errors compound), and the Frankot-Chellappa algorithm
finds the globally optimal surface in the frequency domain. Displaying all
pipeline stages simultaneously — original DEM, shading, normals, gradients,
frequency spectrum, and reconstructed surface — lets the viewer trace how
depth information flows through each transformation.

## Technical Challenges

### Frankot-Chellappa integration

Given gradient fields $`p = \partial z/\partial x`$ and $`q = \partial z/\partial y`$,
line integration accumulates errors along paths and is sensitive to noise. The
Frankot-Chellappa algorithm instead finds the surface $`z`$ minimizing the
global integrability error. In the frequency domain the solution at each
frequency $`(u, v)`$ is:

```math
\hat{Z}(u,v) = -\frac{u\,\hat{P}(u,v) + v\,\hat{Q}(u,v)}{u^2 + v^2}
```

where $`\hat{P}`$ and $`\hat{Q}`$ are the 2D DFTs of $`p`$ and $`q`$. The DC
component is set to zero (arbitrary height offset). Applying IFFT yields the
reconstructed surface.

### Normal estimation via reflectance map lookup

For a Lambertian surface under a known light direction, the observed intensity
at each pixel is determined by the dot product of the surface normal and the
light vector. Photometric stereo recovers the normal by comparing three
observed intensities against precomputed reflectance maps. Rather than solving
per pixel (expensive), the three intensities are each quantized to 4 bits,
forming a 12-bit key into a precomputed lookup table that maps directly to the
closest normal — $`O(1)`$ per pixel.