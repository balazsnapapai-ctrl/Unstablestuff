import React from 'react';
import { RegionStateSimulation } from '../engine/regionState';
import { DimensionId, getNetherRegime, getUnderworldRegime } from '../engine/dimensionTypes';
import { sampleSeedGeography } from '../engine/seedGeography';
import {
  ShieldAlert,
  Compass,
  Droplet,
  Wind,
  Layers,
  AlertTriangle,
  Trees,
  Flame,
  Mountain,
  Zap,
  Gauge,
  Activity,
  Box,
  Radio,
  Globe,
  CheckCircle,
} from 'lucide-react';

interface RegionInspectorCardProps {
  state: RegionStateSimulation;
  currentX: number;
  currentZ: number;
  dimension?: DimensionId;
  worldSeed: bigint;
}

export const RegionInspectorCard: React.FC<RegionInspectorCardProps> = ({
  state,
  currentX,
  currentZ,
  dimension = 'overworld',
  worldSeed,
}) => {
  const hexSeed = '0x' + state.regionSeed.toString(16).toUpperCase().padStart(16, '0');

  // Compute seed-driven geographic sample at this coordinate
  const geo = sampleSeedGeography(currentX, currentZ, worldSeed, dimension);

  // Dimension-specific Regime and Title resolution
  let dimensionRegimeName = state.regime.name;
  let dimensionDanger = 'Nominal Frontier';

  if (dimension === 'nether') {
    const nr = getNetherRegime(state.distance);
    dimensionRegimeName = nr.name;
    dimensionDanger = nr.dangerLevel;
  } else if (dimension === 'underworld') {
    const ur = getUnderworldRegime(state.distance);
    dimensionRegimeName = ur.name;
    dimensionDanger = ur.dangerLevel;
  }

  // Qualitative environmental readouts (NO numerical spoilers or specific gravity/error metrics)
  const isGravitationalAnomalous = state.laws.gravityMultiplier !== 1.0 || dimension === 'underworld';
  const isCompassAnomalous = state.laws.compassDisrupted || dimension === 'nether';
  const isTelemetryAnomalous = state.laws.f3CoordinatesMalfunctioning || dimension === 'underworld';

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 space-y-5">
      {/* Header & Coordinates */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="capitalize font-semibold text-white flex items-center gap-1">
              {dimension === 'nether' ? (
                <Flame className="w-3.5 h-3.5 text-red-400" />
              ) : dimension === 'underworld' ? (
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {dimension}
            </span>
            <span aria-hidden="true">·</span>
            <span>Region [{state.regionX}, {state.regionZ}]</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-medium">{dimensionDanger}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>{dimensionRegimeName}</span>
          </h2>
          <div className="text-xs text-neutral-300 mt-0.5">
            Geographic Landform: <span className="font-semibold text-white">{geo.terrainLabel}</span>
            <span className="mx-1.5 text-neutral-600">|</span>
            Biome: <span className="text-emerald-400 font-medium">{geo.biomeName}</span>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xs text-neutral-400">Distance from Origin</div>
          <div className="text-lg font-mono font-semibold text-emerald-400 tabular-nums">
            {Math.round(state.distance).toLocaleString()} <span className="text-xs text-neutral-400 font-sans">blocks</span>
          </div>
        </div>
      </div>

      {/* Seed Procedural Topography & Strata Synthesis */}
      <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800/80">
          <div className="flex items-center gap-1.5 font-semibold text-neutral-200 uppercase tracking-wider text-[11px]">
            <Mountain className="w-3.5 h-3.5 text-emerald-400" />
            <span>Seed Topography & Strata Synthesis</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span>Terrain Relief: <span className="text-white font-semibold">Active</span></span>
          </div>
        </div>

        {/* Vertical Geological Strata Column (Dimension-Specific) */}
        <div className="pt-1 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <Box className="w-3 h-3 text-emerald-400" />
              <span>Stratigraphic Column Profile</span>
            </span>
            <span className="font-mono text-neutral-300">
              {dimension === 'underworld' ? 'Underworld Floor Y ≈ -264 to -580' : `Est. Surface Y ≈ ${geo.elevationY}`}
            </span>
          </div>

          {dimension === 'nether' ? (
            <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-center">
              <div className="p-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-400">
                <span className="block text-neutral-500 text-[9px]">Ceiling (Y=127)</span>
                <span className="font-semibold truncate block">Bedrock Roof</span>
              </div>
              <div className="p-1.5 bg-red-950/40 border border-red-800/40 rounded text-red-300">
                <span className="block text-neutral-400 text-[9px]">Strata (Y=64)</span>
                <span className="font-semibold truncate block">Netherrack</span>
              </div>
              <div className="p-1.5 bg-orange-950/40 border border-orange-800/40 rounded text-orange-300">
                <span className="block text-neutral-400 text-[9px]">Lava Sea (Y=31)</span>
                <span className="font-semibold truncate block">Basalt / Magma</span>
              </div>
              <div className="p-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-400">
                <span className="block text-neutral-500 text-[9px]">Floor (Y=0)</span>
                <span className="font-semibold truncate block">Bedrock Base</span>
              </div>
            </div>
          ) : dimension === 'underworld' ? (
            <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-center">
              <div className="p-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-400">
                <span className="block text-neutral-500 text-[9px]">Crust (Y=-64)</span>
                <span className="font-semibold truncate block">Bedrock Barrier</span>
              </div>
              <div className="p-1.5 bg-neutral-950 border border-cyan-900/50 rounded text-cyan-300">
                <span className="block text-cyan-500 text-[9px]">200-Block Drop</span>
                <span className="font-semibold truncate block">Abyssal Void Gap</span>
              </div>
              <div className="p-1.5 bg-cyan-950/60 border border-cyan-800/60 rounded text-cyan-200">
                <span className="block text-neutral-400 text-[9px]">Cavern (Y=-264 to -580)</span>
                <span className="font-semibold truncate block">Chaotic Blotches</span>
              </div>
              <div className="p-1.5 bg-black border border-purple-900/60 rounded text-purple-400">
                <span className="block text-neutral-600 text-[9px]">Below Y=-600</span>
                <span className="font-semibold truncate block">True Void Floor</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-center">
              <div className="p-1.5 bg-emerald-950/40 border border-emerald-800/40 rounded text-emerald-200">
                <span className="block text-neutral-400 text-[9px]">Top (Y={geo.elevationY})</span>
                <span className="font-semibold truncate block">{geo.biomeName === 'Ocean' ? 'Water Sea' : 'Surface Turf'}</span>
              </div>
              <div className="p-1.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-300">
                <span className="block text-neutral-400 text-[9px]">Middle (Y=0)</span>
                <span className="font-semibold truncate block">Solid Stone</span>
              </div>
              <div className="p-1.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-300">
                <span className="block text-neutral-400 text-[9px]">Deep (Y=-40)</span>
                <span className="font-semibold truncate block">Deepslate</span>
              </div>
              <div className="p-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-400">
                <span className="block text-neutral-500 text-[9px]">Floor (Y=-64)</span>
                <span className="font-semibold truncate block">Bedrock Crust</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Environmental Qualitative Diagnostics (No Spoilers) */}
      <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-800/80">
          <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Environmental Telemetry & Rules</span>
          </span>
          <span className="text-[10px] font-mono text-neutral-400">Qualitative Sensors</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono">
          {/* Gravitational Field Status */}
          <div className="p-2.5 bg-neutral-900/60 rounded border border-neutral-800/60 flex items-start justify-between">
            <div>
              <span className="text-neutral-400 text-[10px] block">Gravitational State</span>
              <span className={isGravitationalAnomalous ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {isGravitationalAnomalous ? 'Anomalous Variance' : 'Nominal Gravity'}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Explore in-game to measure</span>
            </div>
          </div>

          {/* Redstone Status: Guaranteed 100% functional */}
          <div className="p-2.5 bg-neutral-900/60 rounded border border-neutral-800/60 flex items-start justify-between">
            <div>
              <span className="text-neutral-400 text-[10px] block">Redstone Logic</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>100% Operational</span>
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Vanilla timing unmodified</span>
            </div>
          </div>

          {/* Build Height & Verticality Status */}
          <div className="p-2.5 bg-neutral-900/60 rounded border border-neutral-800/60 flex items-start justify-between">
            <div>
              <span className="text-neutral-400 text-[10px] block">Build Height Restrictions</span>
              <span className="text-emerald-400 font-bold">Uncapped / Removed</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Vertical limit unlocked</span>
            </div>
          </div>

          {/* Compass / Magnetic Status */}
          <div className="p-2.5 bg-neutral-900/60 rounded border border-neutral-800/60 flex items-start justify-between">
            <div>
              <span className="text-neutral-400 text-[10px] block">Magnetic Compass</span>
              <span className={isCompassAnomalous ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {isCompassAnomalous ? 'Polar Disruption' : 'Locked Heading'}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Needle field response</span>
            </div>
          </div>

          {/* F3 Screen Telemetry Status */}
          <div className="p-2.5 bg-neutral-900/60 rounded border border-neutral-800/60 flex items-start justify-between">
            <div>
              <span className="text-neutral-400 text-[10px] block">Coordinate Stability</span>
              <span className={isTelemetryAnomalous ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {isTelemetryAnomalous ? 'Sensor Glitch Detected' : 'Stable Positioning'}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Hardware telemetry</span>
            </div>
          </div>

          {/* Underworld Void Safety Threshold */}
          <div className="p-2.5 bg-neutral-900/60 rounded border border-neutral-800/60 flex items-start justify-between">
            <div>
              <span className="text-neutral-400 text-[10px] block">Void Damage Immunity</span>
              <span className={dimension === 'underworld' ? 'text-cyan-400 font-bold' : 'text-neutral-400 font-medium'}>
                {dimension === 'underworld' ? 'Immune Down to Y=-600' : 'Standard World Threshold'}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Sub-bedrock traversal safe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
