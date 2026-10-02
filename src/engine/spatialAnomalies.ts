import { safeDistance, splitMix64, toDouble } from './deterministic';

export interface SpatialPocket {
  id: string;
  name: string;
  entranceX: number;
  entranceY: number;
  entranceZ: number;
  exteriorSize: { width: number; depth: number; height: number }; // In blocks (e.g. 3x3x3)
  interiorSize: { width: number; depth: number; height: number }; // In blocks (e.g. 320x320x140)
  dilationFactor: number; // e.g. 50x
  anomalyType: 'Pocket Dimension' | 'Recursive Corridors' | 'Hyperbolic Vault' | 'Klein Cavern';
  description: string;
}

export const UNDERWORLD_SPATIAL_POCKETS: SpatialPocket[] = [
  {
    id: 'pocket_1',
    name: 'The Whispering Alcove',
    entranceX: 120_400,
    entranceY: -310,
    entranceZ: -84_200,
    exteriorSize: { width: 3, depth: 3, height: 3 },
    interiorSize: { width: 340, depth: 340, height: 120 },
    dilationFactor: 68.0,
    anomalyType: 'Pocket Dimension',
    description: 'A modest 3x3 stone fissure that opens into an immense vaulted hollow over 300 blocks across with floating weeping stalactites.',
  },
  {
    id: 'pocket_2',
    name: 'The Endless Scholar Scriptorium',
    entranceX: 8_420_000,
    entranceY: -420,
    entranceZ: -6_110_000,
    exteriorSize: { width: 4, depth: 4, height: 4 },
    interiorSize: { width: 512, depth: 512, height: 256 },
    dilationFactor: 85.3,
    anomalyType: 'Hyperbolic Vault',
    description: 'The legendary hidden citadel of the ancient scholars. Exterior looks like an abandoned stone archway, but inside lies an endless library of forgotten tomes.',
  },
  {
    id: 'pocket_3',
    name: 'The Klein Chasm',
    entranceX: 450_000,
    entranceY: -280,
    entranceZ: 320_000,
    exteriorSize: { width: 2, depth: 2, height: 3 },
    interiorSize: { width: 280, depth: 280, height: 90 },
    dilationFactor: 46.5,
    anomalyType: 'Klein Cavern',
    description: 'Walking through a narrow crawlspace turns space inside-out. The floor becomes the ceiling upon exiting the threshold.',
  },
  {
    id: 'pocket_4',
    name: 'The Tesseract Rift',
    entranceX: 12_550_821,
    entranceY: -500,
    entranceZ: 12_550_821,
    exteriorSize: { width: 5, depth: 5, height: 5 },
    interiorSize: { width: 640, depth: 640, height: 320 },
    dilationFactor: 128.0,
    anomalyType: 'Pocket Dimension',
    description: 'Deep in the Inverse Farlands. A tiny fracture in the void contains an entire sub-reality spanning over half a kilometer.',
  },
];

/**
 * Computes non-Euclidean spatial coordinate translation across an anomaly horizon.
 */
export function evaluateSpatialWarp(
  localX: number,
  localZ: number,
  pocket: SpatialPocket
): { dilatedX: number; dilatedZ: number; dilationFactor: number; isInsidePocket: boolean } {
  const dx = localX - pocket.entranceX;
  const dz = localZ - pocket.entranceZ;
  const extRadius = Math.max(pocket.exteriorSize.width, pocket.exteriorSize.depth);

  if (Math.abs(dx) <= extRadius && Math.abs(dz) <= extRadius) {
    // Inside the spatial expansion threshold! Space dilates by dilationFactor
    return {
      dilatedX: Math.round(dx * pocket.dilationFactor),
      dilatedZ: Math.round(dz * pocket.dilationFactor),
      dilationFactor: pocket.dilationFactor,
      isInsidePocket: true,
    };
  }

  return {
    dilatedX: dx,
    dilatedZ: dz,
    dilationFactor: 1.0,
    isInsidePocket: false,
  };
}
