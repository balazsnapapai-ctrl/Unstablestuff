/**
 * Mathematical 3D Farlands Lattice & Voxel Slicer.
 * Calculates density across 2D slices (XZ, XY, YZ) for interactive canvas rendering.
 */

export const FARLANDS_LIMIT = 12_550_821;

export function evaluateFarlandsDensity(
  x: number,
  y: number,
  z: number,
  latticePeriod = 32,
  cornerFactor = 1.0
): number {
  const absX = Math.abs(x);
  const absZ = Math.abs(z);
  const isFarlandsX = absX >= FARLANDS_LIMIT;
  const isFarlandsZ = absZ >= FARLANDS_LIMIT;

  // Scale coordinates into repeating lattice waves
  const fx = (x % 2048) / latticePeriod;
  const fy = (y % 128) / (latticePeriod * 0.5);
  const fz = (z % 2048) / latticePeriod;

  const waveX = Math.sin(fx * Math.PI) * Math.cos(fy * Math.PI);
  const waveZ = Math.sin(fz * Math.PI) * Math.cos(fy * Math.PI);
  const waveY = Math.cos(fx * Math.PI) * Math.sin(fz * Math.PI);

  const baseLattice = (waveX + waveZ + waveY) * 0.3333;

  // Corner Farlands superposition (where both axes interact)
  let corner = 0.0;
  if (isFarlandsX && isFarlandsZ) {
    const cWave = Math.sin(fx * Math.PI * 0.5) * Math.sin(fz * Math.PI * 0.5);
    if (Math.abs(cWave) > 0.6) {
      corner = 2.2 * Math.sign(cWave) * cornerFactor;
    }
  }

  // Periodic vertical void fissure
  let voidFissure = 0.0;
  if (Math.abs(x % 512) < 14 || Math.abs(z % 512) < 14) {
    voidFissure = -1.8;
  }

  // Elevation gradient (dense stone towards bottom Y=0, airy towards top Y=256)
  const verticalBias = (128 - y) / 48.0;

  return verticalBias + baseLattice * 2.5 + corner + voidFissure;
}

export function generateVoxelSlice(
  plane: 'XZ' | 'XY' | 'YZ',
  coordX: number,
  coordY: number,
  coordZ: number,
  resolution = 64,
  step = 2,
  latticePeriod = 32
): Float32Array {
  const data = new Float32Array(resolution * resolution);
  const half = resolution / 2;

  for (let row = 0; row < resolution; row++) {
    for (let col = 0; col < resolution; col++) {
      let x = coordX;
      let y = coordY;
      let z = coordZ;

      if (plane === 'XZ') {
        x += (col - half) * step;
        z += (row - half) * step;
      } else if (plane === 'XY') {
        x += (col - half) * step;
        y += (half - row) * step;
      } else {
        z += (col - half) * step;
        y += (half - row) * step;
      }

      data[row * resolution + col] = evaluateFarlandsDensity(x, y, z, latticePeriod);
    }
  }

  return data;
}
