/**
 * High-Quality Procedural Biome Engine for Anomalous World Generator.
 * Defines comprehensive biomes, climate vectors (Temperature, Humidity, Continentalness, Erosion, Weirdness),
 * surface block palettes, foliage colors, and generation characteristics across all 6 distance regimes.
 */

import { DistanceRegimeType } from './regimes';

export interface AnomalousBiome {
  id: string;
  name: string;
  regime: DistanceRegimeType;
  climate: {
    temperature: number; // [-1.0, 1.0]
    humidity: number;    // [-1.0, 1.0]
    continentalness: number; // [-1.0, 1.0]
    erosion: number;     // [-1.0, 1.0]
    weirdness: number;   // [0.0, 2.0]
  };
  palette: {
    topBlock: string;
    fillerBlock: string;
    subsurfaceBlock: string;
    foliageColor: string;
    waterColor: string;
    fogColor: string;
    accentHex: string;
  };
  features: string[];
  description: string;
}

export const BIOMES: Record<string, AnomalousBiome> = {
  // --- NORMAL REGIME (0 - 60k) ---
  'normal:temperate_forest': {
    id: 'normal:temperate_forest',
    name: 'Verdant Forested Basin',
    regime: DistanceRegimeType.NORMAL,
    climate: { temperature: 0.2, humidity: 0.4, continentalness: 0.3, erosion: 0.1, weirdness: 0.05 },
    palette: {
      topBlock: 'Grass Block',
      fillerBlock: 'Dirt',
      subsurfaceBlock: 'Stone',
      foliageColor: '#2e7d32',
      waterColor: '#3f76e4',
      fogColor: '#c0d8ff',
      accentHex: '#388e3c',
    },
    features: ['Dense Oak and Birch Canopy', 'Rolling Pastures', 'Gentle Karst Springs'],
    description: 'Recognizable, peaceful temperate woodland with gentle undulating topography.',
  },
  'normal:alpine_range': {
    id: 'normal:alpine_range',
    name: 'Sub-Alpine Ridge',
    regime: DistanceRegimeType.NORMAL,
    climate: { temperature: -0.5, humidity: 0.1, continentalness: 0.6, erosion: -0.4, weirdness: 0.1 },
    palette: {
      topBlock: 'Snow Block',
      fillerBlock: 'Powder Snow',
      subsurfaceBlock: 'Stone',
      foliageColor: '#4e6856',
      waterColor: '#3f76e4',
      fogColor: '#d6e4ff',
      accentHex: '#78909c',
    },
    features: ['Glacial Scree', 'Snow-Dusted Slopes', 'Deep Exposed Granite Strata'],
    description: 'Crisp mountain slopes with natural snowy valleys and exposed stone peaks.',
  },

  // --- AMPLIFIED REGIME (60k - 300k) ---
  'amplified:skyward_spires': {
    id: 'amplified:skyward_spires',
    name: 'Skyward Spires & Terraces',
    regime: DistanceRegimeType.AMPLIFIED,
    climate: { temperature: 0.1, humidity: 0.2, continentalness: 0.8, erosion: -0.8, weirdness: 0.45 },
    palette: {
      topBlock: 'Calcite & Stone',
      fillerBlock: 'Granite & Andesite',
      subsurfaceBlock: 'Deepslate',
      foliageColor: '#33691e',
      waterColor: '#0288d1',
      fogColor: '#b0bec5',
      accentHex: '#e0e0e0',
    },
    features: ['Sheer Cliffs ascending to Y=319', 'Hanging Mountain Terraces', 'Massive Natural Stone Arches'],
    description: 'Monumental vertical geology with cliffs plunging hundreds of blocks into mist-shrouded chasms.',
  },
  'amplified:rift_valley': {
    id: 'amplified:rift_valley',
    name: 'Abyssal Gorge & Cataracts',
    regime: DistanceRegimeType.AMPLIFIED,
    climate: { temperature: 0.3, humidity: 0.8, continentalness: 0.2, erosion: 0.9, weirdness: 0.5 },
    palette: {
      topBlock: 'Moss Block & Mud',
      fillerBlock: 'Cobbled Deepslate',
      subsurfaceBlock: 'Deepslate',
      foliageColor: '#1b5e20',
      waterColor: '#00acc1',
      fogColor: '#90a4ae',
      accentHex: '#43a047',
    },
    features: ['Cascading 200m Waterfalls', 'Deep Basalt Sinks', 'Subterranean Skylights'],
    description: 'Vast tectonic gorges carved by colossal waterfalls cascading through deepslate chasms.',
  },

  // --- GREAT SEA REGIME (300k - 1M) ---
  'sea:abyssal_trench': {
    id: 'sea:abyssal_trench',
    name: 'Hadopelagic Trench',
    regime: DistanceRegimeType.GREAT_SEA,
    climate: { temperature: -0.2, humidity: 1.0, continentalness: -0.9, erosion: 0.8, weirdness: 0.7 },
    palette: {
      topBlock: 'Gravel & Magma Block',
      fillerBlock: 'Basalt & Deepslate',
      subsurfaceBlock: 'Obsidian',
      foliageColor: '#004d40',
      waterColor: '#001026',
      fogColor: '#000b18',
      accentHex: '#0277bd',
    },
    features: ['Trench Floor down to Y=12', 'Hydrothermal Magma Vents', 'Submarine Obsidian Arches'],
    description: 'Pitch-black ocean chasms hundreds of thousands of blocks wide with towering hydrothermal vents.',
  },
  'sea:basalt_archipelago': {
    id: 'sea:basalt_archipelago',
    name: 'Pelagic Basalt Islands',
    regime: DistanceRegimeType.GREAT_SEA,
    climate: { temperature: 0.6, humidity: 0.9, continentalness: -0.4, erosion: -0.5, weirdness: 0.6 },
    palette: {
      topBlock: 'Smooth Basalt',
      fillerBlock: 'Blackstone',
      subsurfaceBlock: 'Dark Prismarine',
      foliageColor: '#00796b',
      waterColor: '#004d40',
      fogColor: '#37474f',
      accentHex: '#26a69a',
    },
    features: ['Steep Hexagonal Columns', 'Isolated Coral Atolls', 'Prismarine Geysers'],
    description: 'Sparse volcanic needles protruding from violent oceanic swells.',
  },

  // --- OUTER WORLD REGIME (1M - 12.55M) ---
  'outer:calcified_forest': {
    id: 'outer:calcified_forest',
    name: 'Calcified Petrified Steppe',
    regime: DistanceRegimeType.OUTER_WORLD,
    climate: { temperature: 0.4, humidity: -0.6, continentalness: 0.5, erosion: 0.3, weirdness: 1.1 },
    palette: {
      topBlock: 'White Concrete Powder & Calcite',
      fillerBlock: 'Dripstone Block',
      subsurfaceBlock: 'Tuff & Bone Block',
      foliageColor: '#78909c',
      waterColor: '#546e7a',
      fogColor: '#cfd8dc',
      accentHex: '#b0bec5',
    },
    features: ['Petrified Fossilized Trunks', 'Chalk Needles', 'Silent Desiccated Plains'],
    description: 'An eerie bone-white landscape where geological structures resemble ancient petrified biological relics.',
  },
  'outer:prismatic_shatterland': {
    id: 'outer:prismatic_shatterland',
    name: 'Prismatic Folded Shards',
    regime: DistanceRegimeType.OUTER_WORLD,
    climate: { temperature: -0.1, humidity: 0.3, continentalness: 0.7, erosion: -0.9, weirdness: 1.35 },
    palette: {
      topBlock: 'Amethyst Block & Purpur',
      fillerBlock: 'End Stone & Calcite',
      subsurfaceBlock: 'Smooth Quartz',
      foliageColor: '#9c27b0',
      waterColor: '#7b1fa2',
      fogColor: '#4a148c',
      accentHex: '#ba68c8',
    },
    features: ['Floating Tilted Slabs', 'Resonant Geodes Exposed to Sky', 'Impossible Overhang Angles'],
    description: 'Folded geometric terrain defying standard gravity curves, sparkling with crystalline strata.',
  },

  // --- THE FARLANDS REGIME (12.55M - 20M) ---
  'farlands:orthogonal_lattice': {
    id: 'farlands:orthogonal_lattice',
    name: 'The Orthogonal Lattice',
    regime: DistanceRegimeType.FARLANDS,
    climate: { temperature: 0.0, humidity: 0.0, continentalness: 1.0, erosion: -1.0, weirdness: 1.7 },
    palette: {
      topBlock: 'Stone & Deepslate Tiles',
      fillerBlock: 'Polished Andesite',
      subsurfaceBlock: 'Bedrock Fractures',
      foliageColor: '#607d8b',
      waterColor: '#263238',
      fogColor: '#1c2024',
      accentHex: '#ec4899',
    },
    features: ['Repeating 32m Matrix Tunnels', 'Endless Geometric Voids', 'Square Air Apertures'],
    description: 'Mathematical 3D coordinate overflow carving infinite orthogonal tunnels through impenetrable stone.',
  },
  'farlands:corner_abyss': {
    id: 'farlands:corner_abyss',
    name: 'Corner Farlands Monolith Complex',
    regime: DistanceRegimeType.FARLANDS,
    climate: { temperature: 0.0, humidity: 0.0, continentalness: 1.0, erosion: 1.0, weirdness: 1.95 },
    palette: {
      topBlock: 'Deepslate Bricks & Obsidian',
      fillerBlock: 'Crying Obsidian',
      subsurfaceBlock: 'Reinforced Deepslate',
      foliageColor: '#212121',
      waterColor: '#0d0d0d',
      fogColor: '#0a000f',
      accentHex: '#d81b60',
    },
    features: ['Dual-Axis Superposition Monoliths', 'Void Ravines descending to Y=-64', 'Infinite Linear Pillars'],
    description: 'Where X and Z coordinate limits interact, soaring solid stone towers pierce the sky adjacent to abyssal cubic voids.',
  },

  // --- ULTRA-DEEP FARLANDS REGIME (20M+) ---
  'ultradeep:chrono_fracture': {
    id: 'ultradeep:chrono_fracture',
    name: 'Chrono-Fracture Expanse',
    regime: DistanceRegimeType.ULTRA_DEEP,
    climate: { temperature: 0.0, humidity: 0.0, continentalness: 0.0, erosion: 0.0, weirdness: 2.0 },
    palette: {
      topBlock: 'Bedrock & Sculk Catalyst',
      fillerBlock: 'Reinforced Deepslate',
      subsurfaceBlock: 'Void',
      foliageColor: '#004d40',
      waterColor: '#00251a',
      fogColor: '#000000',
      accentHex: '#ef4444',
    },
    features: ['Inverted Bedrock Ribs', 'Non-Euclidean Spatial Loops', 'Ghost Architecture Echoes'],
    description: 'Reality-breaking borderland where physical simulation coordinates and spatial coherence break down entirely.',
  },
};

/**
 * Determines the procedural biome at a given block coordinate based on distance regime and multi-scale climate noise.
 */
export function determineBiomeAt(
  x: number,
  z: number,
  dist: number,
  regimeType: DistanceRegimeType,
  seedHash: bigint
): AnomalousBiome {
  const normHash = Number(seedHash & 0xffffn) / 65535;

  if (regimeType === DistanceRegimeType.NORMAL) {
    return normHash > 0.45 ? BIOMES['normal:temperate_forest'] : BIOMES['normal:alpine_range'];
  }
  if (regimeType === DistanceRegimeType.AMPLIFIED) {
    return normHash > 0.5 ? BIOMES['amplified:skyward_spires'] : BIOMES['amplified:rift_valley'];
  }
  if (regimeType === DistanceRegimeType.GREAT_SEA) {
    return normHash > 0.25 ? BIOMES['sea:abyssal_trench'] : BIOMES['sea:basalt_archipelago'];
  }
  if (regimeType === DistanceRegimeType.OUTER_WORLD) {
    return normHash > 0.5 ? BIOMES['outer:calcified_forest'] : BIOMES['outer:prismatic_shatterland'];
  }
  if (regimeType === DistanceRegimeType.FARLANDS) {
    const isCorner = Math.abs(x) > 12_550_821 && Math.abs(z) > 12_550_821;
    return isCorner ? BIOMES['farlands:corner_abyss'] : BIOMES['farlands:orthogonal_lattice'];
  }
  return BIOMES['ultradeep:chrono_fracture'];
}
