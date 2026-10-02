import { safeDistance } from './deterministic';

export enum DistanceRegimeType {
  NORMAL = 'NORMAL',
  AMPLIFIED = 'AMPLIFIED',
  GREAT_SEA = 'GREAT_SEA',
  OUTER_WORLD = 'OUTER_WORLD',
  FARLANDS = 'FARLANDS',
  ULTRA_DEEP = 'ULTRA_DEEP',
}

export interface DistanceRegimeInfo {
  type: DistanceRegimeType;
  name: string;
  minDist: number;
  maxDist: number;
  baseAmp: number;
  maxDensity: number;
  accentColor: string;
  description: string;
}

export const REGIMES: Record<DistanceRegimeType, DistanceRegimeInfo> = {
  [DistanceRegimeType.NORMAL]: {
    type: DistanceRegimeType.NORMAL,
    name: 'Normal Spawn Zone',
    minDist: 0,
    maxDist: 60_000,
    baseAmp: 1.0,
    maxDensity: 0.05,
    accentColor: '#10b981', // emerald
    description: 'Vanilla-like biome balance, recognizable mountains, gentle cave systems, and standard physical laws.',
  },
  [DistanceRegimeType.AMPLIFIED]: {
    type: DistanceRegimeType.AMPLIFIED,
    name: 'Amplified Terrain',
    minDist: 60_000,
    maxDist: 300_000,
    baseAmp: 2.8,
    maxDensity: 0.25,
    accentColor: '#f59e0b', // amber
    description: 'Mountains ascending to world height (Y=319), vertical cliffs, narrow stone arches, and deep abyssal chasms.',
  },
  [DistanceRegimeType.GREAT_SEA]: {
    type: DistanceRegimeType.GREAT_SEA,
    name: 'The Great Sea',
    minDist: 300_000,
    maxDist: 1_000_000,
    baseAmp: 0.4,
    maxDensity: 0.45,
    accentColor: '#0ea5e9', // ocean sky blue
    description: 'Vast oceanic expanse with sparse volcanic archipelagoes, deep sea trenches, and submarine basalt ridges.',
  },
  [DistanceRegimeType.OUTER_WORLD]: {
    type: DistanceRegimeType.OUTER_WORLD,
    name: 'Outer World',
    minDist: 1_000_000,
    maxDist: 12_550_821,
    baseAmp: 1.8,
    maxDensity: 0.70,
    accentColor: '#8b5cf6', // purple
    description: 'Unusual biome boundaries, isolated colossal landmasses, subterranean folds, and emerging physical anomalies.',
  },
  [DistanceRegimeType.FARLANDS]: {
    type: DistanceRegimeType.FARLANDS,
    name: 'The Farlands',
    minDist: 12_550_821,
    maxDist: 20_000_000,
    baseAmp: 3.5,
    maxDensity: 0.90,
    accentColor: '#ec4899', // pink/magenta
    description: 'Iconic 3D repeating lattice tunnels, soaring Corner Farlands monoliths, linear wall plates, and void channels.',
  },
  [DistanceRegimeType.ULTRA_DEEP]: {
    type: DistanceRegimeType.ULTRA_DEEP,
    name: 'Ultra-Deep Farlands',
    minDist: 20_000_000,
    maxDist: 30_000_000,
    baseAmp: 5.0,
    maxDensity: 1.00,
    accentColor: '#ef4444', // red
    description: 'Extreme spatial breakdown, reality-altering physical laws, historical architecture echoes, and deep instability.',
  },
};

export function getRegimeForDistance(dist: number): DistanceRegimeInfo {
  if (dist < 60_000) return REGIMES[DistanceRegimeType.NORMAL];
  if (dist < 300_000) return REGIMES[DistanceRegimeType.AMPLIFIED];
  if (dist < 1_000_000) return REGIMES[DistanceRegimeType.GREAT_SEA];
  if (dist < 12_550_821) return REGIMES[DistanceRegimeType.OUTER_WORLD];
  if (dist < 20_000_000) return REGIMES[DistanceRegimeType.FARLANDS];
  return REGIMES[DistanceRegimeType.ULTRA_DEEP];
}

export interface DirectionalBias {
  north: number;
  south: number;
  east: number;
  west: number;
  corner: number;
  dominant: string;
}

export function computeDirectionalBias(x: number, z: number, worldSeed: bigint): DirectionalBias {
  const dist = safeDistance(x, z);
  if (dist < 1000) {
    return { north: 0.25, south: 0.25, east: 0.25, west: 0.25, corner: 0.0, dominant: 'Spawn Center' };
  }

  const baseAngle = Math.atan2(z, x); // +Z is South, -Z is North, +X is East, -X is West
  const cosA = Math.cos(baseAngle);
  const sinA = Math.sin(baseAngle);

  const east = Math.max(0, cosA);
  const west = Math.max(0, -cosA);
  const south = Math.max(0, sinA);
  const north = Math.max(0, -sinA);

  const corner = Math.min(Math.abs(cosA), Math.abs(sinA)) * 1.4142;

  let dominant = 'Center';
  if (corner > 0.72) {
    if (sinA < 0 && cosA > 0) dominant = 'Northeast Corner';
    else if (sinA < 0 && cosA < 0) dominant = 'Northwest Corner';
    else if (sinA > 0 && cosA > 0) dominant = 'Southeast Corner';
    else dominant = 'Southwest Corner';
  } else {
    if (north > south && north > east && north > west) dominant = 'Northern Farlands';
    else if (south > north && south > east && south > west) dominant = 'Southern Farlands';
    else if (east > north && east > south && east > west) dominant = 'Eastern Farlands';
    else dominant = 'Western Farlands';
  }

  return { north, south, east, west, corner, dominant };
}
