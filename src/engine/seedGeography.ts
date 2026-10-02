import { splitMix64, toDouble, toSignedDouble, safeDistance } from './deterministic';
import { DimensionId } from './dimensionTypes';

// Seed-derived pseudo-random noise generator with multi-octave bicubic smoothing
function pseudoNoise2D(x: number, z: number, seedMod: bigint): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;

  // Smoothstep interpolation curve: 3t^2 - 2t^3
  const sx = fx * fx * (3 - 2 * fx);
  const sz = fz * fz * (3 - 2 * fz);

  const h00 = sampleGrid(ix, iz, seedMod);
  const h10 = sampleGrid(ix + 1, iz, seedMod);
  const h01 = sampleGrid(ix, iz + 1, seedMod);
  const h11 = sampleGrid(ix + 1, iz + 1, seedMod);

  const top = h00 + sx * (h10 - h00);
  const bottom = h01 + sx * (h11 - h01);
  return top + sz * (bottom - top);
}

function sampleGrid(gx: number, gz: number, seedMod: bigint): number {
  const bx = BigInt(gx | 0);
  const bz = BigInt(gz | 0);
  let h = (seedMod ^ (bx * 0x1f1f1f1fn) ^ (bz * 0x9e3779b9n)) & 0xffffffffffffffffn;
  h = splitMix64(h);
  return toSignedDouble(h);
}

export interface GeographicSample {
  continentalness: number; // -1 to +1
  erosion: number;         // -1 to +1
  peaksAndValleys: number; // -1 to +1
  temperature: number;     // -1 to +1
  humidity: number;        // -1 to +1
  weirdness: number;       // -1 to +1
  elevationY: number;      // Actual Y level in blocks
  terrainLabel: string;
  biomeName: string;
  colorHex: string;
}

/**
 * Computes exact procedural seed-driven geography at coordinate (x, z) for any dimension.
 * Every mountain range, continent, ocean, basalt pillar, lava sea, and sculk chasm is
 * mathematically derived from the 64-bit world seed.
 */
export function sampleSeedGeography(
  x: number,
  z: number,
  worldSeed: bigint,
  dimension: DimensionId
): GeographicSample {
  const dist = safeDistance(x, z);

  // Derive dimensional seed modulators
  const s0 = splitMix64(worldSeed ^ 0xa1b2c3d4e5f60718n);
  const s1 = splitMix64(worldSeed ^ 0x9988776655443322n);
  const s2 = splitMix64(worldSeed ^ 0xfeedfacedeadbeefn);

  if (dimension === 'nether') {
    // --- THE NETHER GEOGRAPHY ---
    // Nether uses higher frequency thermal and volcanic noise
    const scale = 0.00015; // Nether features repeat faster
    const octave1 = pseudoNoise2D(x * scale, z * scale, s0);
    const octave2 = pseudoNoise2D(x * scale * 2.5, z * scale * 2.5, s1) * 0.5;
    const magmaSeaNoise = pseudoNoise2D(x * scale * 0.35, z * scale * 0.35, s2);

    const volcanicHeat = octave1 + octave2;
    const isLavaSea = magmaSeaNoise < -0.25 || (dist > 37_500 && dist < 125_000 && magmaSeaNoise < 0.2);

    let elevY = 32;
    let biomeName = 'Nether Wastes';
    let terrainLabel = 'Basalt Lowland';
    let colorHex = '#450a0a';

    if (dist >= 1_568_852) {
      // Nether Farlands: 3D Orthogonal Matrix
      terrainLabel = 'Nether Farlands Lattice';
      biomeName = 'Nether Farlands Wall';
      colorHex = '#701a75';
      elevY = 64 + Math.round(volcanicHeat * 40);
    } else if (isLavaSea) {
      terrainLabel = 'Boiling Lava Ocean';
      biomeName = volcanicHeat > 0 ? 'Crimson Shallows' : 'The Great Lava Sea';
      colorHex = '#ea580c';
      elevY = 31;
    } else if (volcanicHeat > 0.5) {
      terrainLabel = 'Basalt Ridge Spire';
      biomeName = 'Basalt Deltas';
      colorHex = '#292524';
      elevY = Math.min(125, 75 + Math.round(volcanicHeat * 45));
    } else if (volcanicHeat > 0.1) {
      terrainLabel = 'Crimson Spore Canopy';
      biomeName = 'Crimson Forest';
      colorHex = '#991b1b';
      elevY = 50 + Math.round(volcanicHeat * 25);
    } else if (volcanicHeat > -0.2) {
      terrainLabel = 'Warped Fungal Plateau';
      biomeName = 'Warped Forest';
      colorHex = '#0f766e';
      elevY = 48 + Math.round(volcanicHeat * 20);
    } else {
      terrainLabel = 'Soul Sand Valley Basin';
      biomeName = 'Soul Sand Valley';
      colorHex = '#44403c';
      elevY = 35 + Math.round(volcanicHeat * 15);
    }

    return {
      continentalness: magmaSeaNoise,
      erosion: volcanicHeat,
      peaksAndValleys: octave2 * 2,
      temperature: 0.95,
      humidity: -0.8,
      weirdness: Math.abs(octave1),
      elevationY: elevY,
      terrainLabel,
      biomeName,
      colorHex,
    };
  }

  if (dimension === 'underworld') {
    // --- THE UNDERWORLD GEOGRAPHY (200 Blocks Below Bedrock: Y <= -264) ---
    // High-entropy, obscenely chaotic and unpredictable with large irregular geological blotches
    const blotchScale = 0.00035;
    const chaosScale1 = 0.0012;
    const chaosScale2 = 0.0045;

    const bNoise1 = pseudoNoise2D(x * blotchScale, z * blotchScale, s0);
    const bNoise2 = pseudoNoise2D((x + 1000) * blotchScale * 1.6, (z - 1000) * blotchScale * 1.6, s1);
    const chaosDetail = pseudoNoise2D(x * chaosScale1, z * chaosScale1, s2);
    const highFreqTick = pseudoNoise2D(x * chaosScale2, z * chaosScale2, s0 ^ s1);

    // Blotch selector hash
    const cellX = Math.floor(x * blotchScale * 2);
    const cellZ = Math.floor(z * blotchScale * 2);
    const blotchHash = Math.abs(Number(splitMix64(worldSeed ^ BigInt(cellX * 73856093 ^ cellZ * 19349663)) % 10n));

    // Underworld begins 200 blocks below bedrock (Y = -64 - 200 = -264)
    // Terrain spans from Y=-264 down to Y=-580
    const baseFloorY = -264 - Math.round(Math.abs(bNoise1) * 260);

    let elevY = Math.max(-580, Math.min(-264, baseFloorY));
    let biomeName = 'Chaotic Underworld Abyss';
    let terrainLabel = 'Sub-Bedrock Void Gap';
    let colorHex = '#0c4a6e';

    if (dist >= 12_550_821) {
      terrainLabel = 'Inverse Farlands Singularity';
      biomeName = 'Monolithic Reality Tear';
      colorHex = '#581c87';
      elevY = -380;
    } else if (Math.abs(bNoise1 + bNoise2) > 0.85) {
      // Massive irregular blotches!
      switch (blotchHash) {
        case 0:
        case 1:
          terrainLabel = 'Colossal Crying Obsidian Blotch';
          biomeName = 'Weeping Obsidian Calamity';
          colorHex = '#3b0764';
          elevY = -320 + Math.round(chaosDetail * 50);
          break;
        case 2:
        case 3:
          terrainLabel = 'Primordial Magma Blister';
          biomeName = 'Abyssal Pyrocene Pocket';
          colorHex = '#c2410c';
          elevY = -450 + Math.round(highFreqTick * 60);
          break;
        case 4:
        case 5:
          terrainLabel = 'Sprawling Sculk Tumor Mass';
          biomeName = 'Resonant Neuro-Sculk Hive';
          colorHex = '#0891b2';
          elevY = -290 + Math.round(chaosDetail * 80);
          break;
        case 6:
          terrainLabel = 'Petrified Titan Spine Formation';
          biomeName = 'Megalithic Bone Stratum';
          colorHex = '#e2e8f0';
          elevY = -340 + Math.round(highFreqTick * 90);
          break;
        case 7:
          terrainLabel = 'Bismuth Prismatic Cluster';
          biomeName = 'Crystalline Singularity Fault';
          colorHex = '#ec4899';
          elevY = -410;
          break;
        case 8:
          terrainLabel = 'Anti-Gravity Void Well';
          biomeName = 'Atmospheric Null-Zone';
          colorHex = '#020617';
          elevY = -520;
          break;
        default:
          terrainLabel = 'Phosphorescent Mycelium Swarm';
          biomeName = 'Bioluminescent Spore Chasm';
          colorHex = '#059669';
          elevY = -360 + Math.round(chaosDetail * 70);
          break;
      }
    } else if (bNoise1 > 0.3) {
      terrainLabel = 'Shattered Grimstone Spires';
      biomeName = 'Tectonic Shards';
      colorHex = '#1e293b';
      elevY = -280 + Math.round(chaosDetail * 40);
    } else if (bNoise2 < -0.3) {
      terrainLabel = 'Bottomless Sub-Bedrock Chasm';
      biomeName = 'Abyssal Void Fall';
      colorHex = '#030712';
      elevY = -550;
    } else {
      terrainLabel = 'Chaotic Deep Slate Shallows';
      biomeName = 'Sub-Crustal Void';
      colorHex = '#0f172a';
      elevY = -340 + Math.round(highFreqTick * 50);
    }

    return {
      continentalness: bNoise1,
      erosion: chaosDetail,
      peaksAndValleys: bNoise2,
      temperature: chaosDetail,
      humidity: highFreqTick,
      weirdness: 0.99,
      elevationY: elevY,
      terrainLabel,
      biomeName,
      colorHex,
    };
  }

  // --- OVERWORLD PROCEDURAL GEOGRAPHY ---
  // Continental noise determines landmasses, Great Sea, and oceans
  const continentalScale = 0.00003; // Large continents (~60,000 blocks wide)
  const mountainScale = 0.00012;
  const detailScale = 0.00045;

  const continent = pseudoNoise2D(x * continentalScale, z * continentalScale, s0);
  const mountain = pseudoNoise2D(x * mountainScale, z * mountainScale, s1);
  const detail = pseudoNoise2D(x * detailScale, z * detailScale, s2) * 0.35;

  const combinedElevation = continent * 0.6 + mountain * 0.3 + detail * 0.1;

  // Check Great Sea regime influence (300k to 1M blocks)
  let effectiveCont = continent;
  if (dist >= 300_000 && dist <= 1_000_000) {
    const seaDip = Math.sin(((dist - 300_000) / 700_000) * Math.PI);
    effectiveCont -= seaDip * 0.7; // Forces ocean basins in Great Sea
  }

  // Check Amplified regime influence (60k to 300k blocks)
  let ampFactor = 1.0;
  if (dist >= 60_000 && dist < 300_000) {
    ampFactor = 2.8;
  }

  let elevY = 64;
  let biomeName = 'Plains';
  let terrainLabel = 'Lowland Meadow';
  let colorHex = '#166534';

  if (dist >= 12_550_821) {
    // Farlands Wall / Corner
    terrainLabel = 'Farlands 3D Lattice';
    biomeName = 'Farlands Edge';
    colorHex = '#831843';
    elevY = 128 + Math.round(combinedElevation * 80);
  } else if (effectiveCont < -0.3) {
    // Deep Ocean / Trench
    terrainLabel = 'Abyssal Ocean Trench';
    biomeName = 'Deep Ocean';
    colorHex = '#082f49';
    elevY = Math.max(10, Math.round(28 + combinedElevation * 15));
  } else if (effectiveCont < 0.0) {
    // Coastal Ocean
    terrainLabel = 'Continental Shelf';
    biomeName = 'Ocean';
    colorHex = '#0369a1';
    elevY = Math.max(38, Math.round(52 + combinedElevation * 10));
  } else if (combinedElevation > 0.45) {
    // High Alpine Mountain Peak
    terrainLabel = 'Alpine Mountain Massif';
    biomeName = 'Jagged Peaks';
    colorHex = '#f8fafc'; // snow white
    elevY = Math.min(319, Math.round(140 + combinedElevation * 110 * ampFactor));
  } else if (combinedElevation > 0.2) {
    // Mountain Slopes / Forested Highlands
    terrainLabel = 'Highland Ridge';
    biomeName = 'Windswept Hills';
    colorHex = '#475569';
    elevY = Math.round(95 + combinedElevation * 60 * ampFactor);
  } else if (continent > 0.3 && mountain < -0.2) {
    // Dense Forest
    terrainLabel = 'Old-Growth Forest';
    biomeName = 'Dark Forest';
    colorHex = '#14532d';
    elevY = Math.round(68 + combinedElevation * 15);
  } else {
    // Standard Plains / Meadow
    terrainLabel = 'Valley Lowlands';
    biomeName = 'Plains';
    colorHex = '#15803d';
    elevY = Math.round(64 + combinedElevation * 12);
  }

  return {
    continentalness: effectiveCont,
    erosion: mountain,
    peaksAndValleys: combinedElevation,
    temperature: mountain * 0.5,
    humidity: continent * 0.5,
    weirdness: Math.abs(detail),
    elevationY: elevY,
    terrainLabel,
    biomeName,
    colorHex,
  };
}

/**
 * Analyzes the global seed personality to show macroscopic statistics on the map.
 */
export function analyzeSeedGeography(worldSeed: bigint, dimension: DimensionId) {
  // Sample 25 points around the world origin to compute macro traits
  let oceanCount = 0;
  let mountainCount = 0;
  let totalSamples = 25;

  for (let i = 0; i < totalSamples; i++) {
    const angle = (i / totalSamples) * Math.PI * 2;
    const testDist = 25_000 + (i % 5) * 50_000;
    const sx = Math.cos(angle) * testDist;
    const sz = Math.sin(angle) * testDist;
    const geo = sampleSeedGeography(sx, sz, worldSeed, dimension);
    if (geo.continentalness < 0) oceanCount++;
    if (geo.peaksAndValleys > 0.3) mountainCount++;
  }

  const oceanPercent = Math.round((oceanCount / totalSamples) * 100);
  const landPercent = 100 - oceanPercent;
  const mountainPercent = Math.round((mountainCount / totalSamples) * 100);

  const hexSeed = '0x' + worldSeed.toString(16).toUpperCase().padStart(16, '0');

  let dominantGeography = 'Continental Basins & Alpine Spines';
  if (dimension === 'nether') {
    dominantGeography = oceanPercent > 50 ? 'Expansive Magma Oceans with Basalt Atolls' : 'Dense Netherrack Caverns & Volcanic Ridges';
  } else if (dimension === 'underworld') {
    dominantGeography = 'Sub-Crustal Tectonic Chasms & Sculk Resonance Wells';
  } else {
    dominantGeography = oceanPercent > 60 ? 'Archipelago World with Vast Great Sea Trenches' : 'Interconnected Super-Continents with Mountain Massifs';
  }

  return {
    hexSeed,
    landPercent,
    oceanPercent,
    mountainPercent,
    dominantGeography,
  };
}
