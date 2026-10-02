import { ANOMALIES, AnomalyDefinition } from './anomalies';
import { hash64, hashString, safeDistance, toDouble } from './deterministic';
import { computeDirectionalBias, DirectionalBias, DistanceRegimeInfo, getRegimeForDistance } from './regimes';
import { AnomalousBiome, determineBiomeAt } from './biomes';

export interface ActiveAnomaly {
  definition: AnomalyDefinition;
  strengthLevel: number;
  strengthLabel: string;
  score: number;
}

export interface RegionStateSimulation {
  regionX: number;
  regionZ: number;
  centerBlockX: number;
  centerBlockZ: number;
  distance: number;
  regime: DistanceRegimeInfo;
  direction: DirectionalBias;
  regionSeed: bigint;
  terrainAmplitude: number;
  terrainRoughness: number;
  anomalyDensity: number;
  biome: AnomalousBiome;
  anomalies: ActiveAnomaly[];
  laws: {
    elytraPropulsionAllowed: boolean;
    gravityMultiplier: number;
    fluidFlowRate: number;
    compassDisrupted: boolean;
    f3CoordinatesMalfunctioning: boolean;
    f3GlitchIntensity: number;
    mistFogActive: boolean;
  };
}

export function computeRegionState(
  blockX: number,
  blockZ: number,
  worldSeed: bigint,
  maxAnomalyLimit = 8
): RegionStateSimulation {
  const REGION_SIZE = 2048;
  const regX = Math.floor(blockX / REGION_SIZE);
  const regZ = Math.floor(blockZ / REGION_SIZE);

  const centerBlockX = regX * REGION_SIZE + 1024;
  const centerBlockZ = regZ * REGION_SIZE + 1024;

  const dist = safeDistance(centerBlockX, centerBlockZ);
  const regime = getRegimeForDistance(dist);
  const direction = computeDirectionalBias(centerBlockX, centerBlockZ, worldSeed);

  const regSeed = hash64(worldSeed, BigInt(regX), BigInt(regZ), 7007n);
  const densityCheck = toDouble(hash64(regSeed, 11n, 22n, 1001n));

  // Determine local procedural biome
  const biome = determineBiomeAt(centerBlockX, centerBlockZ, dist, regime.type, regSeed);

  // Amplitude and roughness
  const noiseSeed = hash64(regSeed, 33n, 44n, 4004n);
  const spatialNoise = toDouble(noiseSeed);
  const terrainAmplitude = regime.baseAmp * (0.8 + 0.4 * spatialNoise);
  const terrainRoughness = Math.min(3.0, 0.5 + dist / 5_000_000 + spatialNoise * 0.3);

  // Active Anomalies selection with deterministic conflict resolution
  const selectedAnomalies: ActiveAnomaly[] = [];
  const activeTags = new Set<string>();

  const regimeTier = [
    'NORMAL',
    'AMPLIFIED',
    'GREAT_SEA',
    'OUTER_WORLD',
    'FARLANDS',
    'ULTRA_DEEP',
  ].indexOf(regime.type);

  // Check if anomalies spawn (higher density allowance)
  if (densityCheck <= Math.min(1.0, regime.maxDensity * 1.5)) {
    const candidates: { def: AnomalyDefinition; strLevel: number; strLabel: string; score: number }[] = [];

    for (const def of ANOMALIES) {
      if (def.minRegimeTier > regimeTier) continue;

      const candHash = hashString(regSeed, def.id, 2002n);
      const baseScore = toDouble(candHash) * def.baseWeight;

      let dirBonus = 1.0;
      if (def.category === 'WEATHER' && direction.north > 0.4) dirBonus += 0.4;
      if (def.category === 'MOVEMENT' && direction.west > 0.4) dirBonus += 0.5;
      if (def.category === 'PHYSICS' && direction.south > 0.4) dirBonus += 0.4;
      if (def.category === 'TERRAIN' && direction.corner > 0.5) dirBonus += 0.7;
      if (def.category === 'NAVIGATION' && (direction.dominant.includes('Farlands') || regimeTier >= 2)) dirBonus += 0.6;

      const finalScore = baseScore * dirBonus;
      if (finalScore > 0.35) {
        const strHash = hash64(candHash, 777n, 888n, 3003n);
        const maxStr = Math.min(5, Math.max(1, regimeTier + 1));
        const strLevel = 1 + Math.floor(toDouble(strHash) * maxStr);
        const labels = ['Normal', 'Subtle', 'Noticeable', 'Severe', 'Extreme', 'Reality-Breaking'];
        candidates.push({
          def,
          strLevel,
          strLabel: labels[strLevel] || 'Unknown',
          score: finalScore,
        });
      }
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    // Allow more anomalies per region (up to maxAnomalyLimit, e.g. 8)
    const allowedCount = Math.min(maxAnomalyLimit, Math.max(2, regimeTier * 2));
    for (const c of candidates) {
      if (!activeTags.has(c.def.conflictTag)) {
        selectedAnomalies.push({
          definition: c.def,
          strengthLevel: c.strLevel,
          strengthLabel: c.strLabel,
          score: c.score,
        });
        activeTags.add(c.def.conflictTag);
        if (selectedAnomalies.length >= allowedCount) break;
      }
    }
  }

  // Derive world laws
  let elytraPropulsionAllowed = true;
  let gravityMultiplier = 1.0;
  let fluidFlowRate = 1.0;
  let compassDisrupted = false;
  let f3CoordinatesMalfunctioning = false;
  let f3GlitchIntensity = 0;
  let redstoneDelay = 0;
  let mistFogActive = false;

  for (const a of selectedAnomalies) {
    if (a.definition.id === 'anomalousworld:elytra_propulsion_failure') {
      elytraPropulsionAllowed = false;
    } else if (a.definition.id === 'anomalousworld:gravitational_drift') {
      gravityMultiplier = 0.4;
    } else if (a.definition.id === 'anomalousworld:fluid_stasis') {
      fluidFlowRate = 0.25;
    } else if (a.definition.id === 'anomalousworld:compass_flux') {
      compassDisrupted = true;
    } else if (a.definition.id === 'anomalousworld:f3_coordinate_malfunction') {
      f3CoordinatesMalfunctioning = true;
      f3GlitchIntensity = a.strengthLevel;
    } else if (a.definition.id === 'anomalousworld:mist_veil') {
      mistFogActive = true;
    }
  }

  // If compass is disrupted, F3 coordinates naturally also experience paired magnetic jitter
  if (compassDisrupted && !f3CoordinatesMalfunctioning) {
    f3CoordinatesMalfunctioning = true;
    f3GlitchIntensity = 2;
  }

  return {
    regionX: regX,
    regionZ: regZ,
    centerBlockX,
    centerBlockZ,
    distance: dist,
    regime,
    direction,
    regionSeed: regSeed,
    terrainAmplitude,
    terrainRoughness,
    anomalyDensity: regime.maxDensity,
    biome,
    anomalies: selectedAnomalies,
    laws: {
      elytraPropulsionAllowed,
      gravityMultiplier,
      fluidFlowRate,
      compassDisrupted,
      f3CoordinatesMalfunctioning,
      f3GlitchIntensity,
      mistFogActive,
    },
  };
}
