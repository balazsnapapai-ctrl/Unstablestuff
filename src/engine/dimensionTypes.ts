export type DimensionId = 'overworld' | 'nether' | 'underworld';

export interface DimensionRegime {
  name: string;
  minDist: number;
  maxDist: number;
  accentColor: string;
  description: string;
  dangerLevel: 'Safe' | 'Hazardous' | 'Extreme' | 'Reality-Bending';
}

export const NETHER_REGIMES: DimensionRegime[] = [
  {
    name: 'Nether Spawn Caldera',
    minDist: 0,
    maxDist: 7_500,
    accentColor: '#dc2626', // crimson
    description: 'Standard Nether wastes, crimson & warped forests, with standard Nether fortress generation.',
    dangerLevel: 'Safe',
  },
  {
    name: 'Basalt Ridge Spires',
    minDist: 7_500,
    maxDist: 37_500,
    accentColor: '#f97316', // orange
    description: 'Towering volcanic columns connecting the lava sea to the bedrock ceiling at Y=127.',
    dangerLevel: 'Hazardous',
  },
  {
    name: 'The Great Lava Sea',
    minDist: 37_500,
    maxDist: 125_000,
    accentColor: '#ea580c', // deep orange
    description: 'Endless boiling lava oceans extending tens of thousands of blocks with sparse glowstone clusters.',
    dangerLevel: 'Hazardous',
  },
  {
    name: 'Outer Nether Fracture',
    minDist: 125_000,
    maxDist: 1_568_852,
    accentColor: '#b91c1c', // dark crimson
    description: 'Tectonic netherrack shifts, zero water mechanics, weeping obsidian arches, and hyper-dense magma.',
    dangerLevel: 'Extreme',
  },
  {
    name: 'The Nether Farlands',
    minDist: 1_568_852,
    maxDist: 3_750_000,
    accentColor: '#f43f5e', // rose neon
    description: 'The iconic Nether Farlands! Occurs at 1,568,852 blocks (Overworld 12.55M / 8). 3D orthogonal netherrack honeycomb.',
    dangerLevel: 'Reality-Bending',
  },
  {
    name: 'Sub-Void Pyrocene',
    minDist: 3_750_000,
    maxDist: 30_000_000,
    accentColor: '#991b1b', // blood red
    description: 'Infinite boiling plasma, fragmented bedrock boundaries, and reverse coordinate flux.',
    dangerLevel: 'Reality-Bending',
  },
];

export const UNDERWORLD_REGIMES: DimensionRegime[] = [
  {
    name: 'Sub-Crustal Void Basin',
    minDist: 0,
    maxDist: 60_000,
    accentColor: '#0284c7', // cyan
    description: 'Cavernous chambers directly beneath the Overworld bedrock layer (Y < -64). Dim bioluminescent moss.',
    dangerLevel: 'Hazardous',
  },
  {
    name: 'The Abyssal Chasm',
    minDist: 60_000,
    maxDist: 300_000,
    accentColor: '#0f766e', // teal
    description: 'Enormous bottomless chasms dropping to Y=-256. Floating islands of fossilized grimstone.',
    dangerLevel: 'Hazardous',
  },
  {
    name: 'Sculk Resonance Vaults',
    minDist: 300_000,
    maxDist: 1_500_000,
    accentColor: '#06b6d4', // bright cyan
    description: 'Massive acoustic caverns where vibrations cause sonic shockwaves. Sonic shrieker formations.',
    dangerLevel: 'Extreme',
  },
  {
    name: 'Tectonic Fracture Nexus',
    minDist: 1_500_000,
    maxDist: 12_550_821,
    accentColor: '#6366f1', // indigo
    description: 'Continental bedrock plates colliding in total darkness. Gravity fluctuations and anti-matter vapor.',
    dangerLevel: 'Extreme',
  },
  {
    name: 'Inverse Farlands Singularity',
    minDist: 12_550_821,
    maxDist: 30_000_000,
    accentColor: '#a855f7', // purple
    description: 'The inverted shadow of the Overworld Farlands. Monolithic dark matter pillars repeating into infinity.',
    dangerLevel: 'Reality-Bending',
  },
];

export function getNetherRegime(dist: number): DimensionRegime {
  for (const reg of NETHER_REGIMES) {
    if (dist >= reg.minDist && dist < reg.maxDist) return reg;
  }
  return NETHER_REGIMES[NETHER_REGIMES.length - 1];
}

export function getUnderworldRegime(dist: number): DimensionRegime {
  for (const reg of UNDERWORLD_REGIMES) {
    if (dist >= reg.minDist && dist < reg.maxDist) return reg;
  }
  return UNDERWORLD_REGIMES[UNDERWORLD_REGIMES.length - 1];
}
