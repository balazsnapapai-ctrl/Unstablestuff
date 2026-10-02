import React, { useRef, useEffect, useState, useMemo } from 'react';
import { safeDistance } from '../engine/deterministic';
import { getRegimeForDistance, REGIMES } from '../engine/regimes';
import { computeRegionState, RegionStateSimulation } from '../engine/regionState';
import {
  DimensionId,
  NETHER_REGIMES,
  UNDERWORLD_REGIMES,
  getNetherRegime,
  getUnderworldRegime,
} from '../engine/dimensionTypes';
import { sampleSeedGeography, analyzeSeedGeography } from '../engine/seedGeography';
import { RegionInspectorCard } from './RegionInspectorCard';
import {
  Crosshair,
  ZoomIn,
  ZoomOut,
  Compass,
  Mountain,
  Move,
  RotateCcw,
  Navigation,
  Layers,
  MapPin,
  Download,
  Bookmark,
  Clock,
  Sparkles,
  Sliders,
  Eye,
  Flame,
  Globe,
  Radio,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface WorldMapViewerProps {
  worldSeed: bigint;
  currentX: number;
  currentZ: number;
  onSelectCoord: (x: number, z: number) => void;
}

interface Waypoint {
  id: string;
  name: string;
  x: number;
  z: number;
  dimension: DimensionId;
  regime: string;
}

export const WorldMapViewer: React.FC<WorldMapViewerProps> = ({
  worldSeed,
  currentX,
  currentZ,
  onSelectCoord,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const profileCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active dimension state
  const [dimension, setDimension] = useState<DimensionId>('overworld');

  // Viewport camera states
  const [viewCenterX, setViewCenterX] = useState<number>(0);
  const [viewCenterZ, setViewCenterZ] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(30_000_000);

  // Interactive panning state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; startCenterX: number; startCenterZ: number } | null>(null);
  const didDragMoveRef = useRef<boolean>(false);

  // Form coordinate inputs
  const [inputX, setInputX] = useState<string>(currentX.toString());
  const [inputZ, setInputZ] = useState<string>(currentZ.toString());

  // Render Theme & Layers
  const [mapTheme, setMapTheme] = useState<'topographical' | 'cyber' | 'thermal' | 'parchment'>('topographical');
  const [layers, setLayers] = useState({
    topography: true,
    regionGrid: true,
    chunkGrid: true,
    regimeRings: true,
    magneticVectors: true,
    structures: true,
  });

  // Expandable panels
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);
  const [showTravelCalc, setShowTravelCalc] = useState<boolean>(false);
  const [showWaypoints, setShowWaypoints] = useState<boolean>(false);
  const [newWaypointName, setNewWaypointName] = useState<string>('');

  // Default Waypoints list across dimensions
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: '1', name: 'Overworld Origin', x: 0, z: 0, dimension: 'overworld', regime: 'Normal Spawn' },
    { id: '2', name: 'Amplified Spires', x: 140_000, z: 90_000, dimension: 'overworld', regime: 'Amplified' },
    { id: '3', name: 'Hadopelagic Trench', x: 550_000, z: -320_000, dimension: 'overworld', regime: 'Great Sea' },
    { id: '4', name: 'Overworld Farlands Wall', x: -12_550_821, z: 0, dimension: 'overworld', regime: 'The Farlands' },
    { id: '5', name: 'Nether Origin Caldera', x: 0, z: 0, dimension: 'nether', regime: 'Nether Spawn' },
    { id: '6', name: 'Nether Farlands Wall', x: 1_568_852, z: 0, dimension: 'nether', regime: 'The Nether Farlands' },
    { id: '7', name: 'Nether Farlands Corner', x: 1_568_852, z: 1_568_852, dimension: 'nether', regime: 'The Nether Farlands' },
    { id: '8', name: 'Sub-Crustal Void Nexus', x: 0, z: 0, dimension: 'underworld', regime: 'Sub-Crustal Basin' },
    { id: '9', name: 'Sculk Resonance Vault', x: 850_000, z: 420_000, dimension: 'underworld', regime: 'Sculk Vaults' },
  ]);

  // Mouse hover information
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    z: number;
    dist: number;
    regimeName: string;
    biomeName: string;
    elevationEstimate: number;
  } | null>(null);

  // Sync internal inputs when prop coordinates change
  useEffect(() => {
    setInputX(currentX.toString());
    setInputZ(currentZ.toString());
  }, [currentX, currentZ]);

  const regionState = useMemo<RegionStateSimulation>(() => {
    return computeRegionState(currentX, currentZ, worldSeed);
  }, [currentX, currentZ, worldSeed]);

  // Global geographic profile of this seed
  const seedAnalysis = useMemo(() => {
    return analyzeSeedGeography(worldSeed, dimension);
  }, [worldSeed, dimension]);

  // Dimension Switcher handler
  const handleDimensionChange = (newDim: DimensionId) => {
    setDimension(newDim);
    if (newDim === 'nether' && dimension === 'overworld') {
      const nx = Math.round(currentX / 8);
      const nz = Math.round(currentZ / 8);
      onSelectCoord(nx, nz);
      setViewCenterX(nx);
      setViewCenterZ(nz);
      setZoomScale(4_000_000);
    } else if (newDim === 'overworld' && dimension === 'nether') {
      const ox = currentX * 8;
      const oz = currentZ * 8;
      onSelectCoord(ox, oz);
      setViewCenterX(ox);
      setViewCenterZ(oz);
      setZoomScale(30_000_000);
    } else {
      setViewCenterX(currentX);
      setViewCenterZ(currentZ);
    }
  };

  // Dimension-specific preset locations
  const dimensionPresets: Record<DimensionId, { label: string; x: number; z: number }[]> = {
    overworld: [
      { label: 'Spawn (0, 0)', x: 0, z: 0 },
      { label: 'Amplified Spires (140k)', x: 140_000, z: 90_000 },
      { label: 'Great Sea Abyss (550k)', x: 550_000, z: -320_000 },
      { label: 'Outer World Fold (3.5M)', x: 3_500_000, z: 1_800_000 },
      { label: 'Western Farlands (-12.55M)', x: -12_550_821, z: 0 },
      { label: 'Corner Farlands (12.55M)', x: 12_550_821, z: 12_550_821 },
      { label: 'Ultra-Deep Reality (23.5M)', x: 23_500_000, z: -19_000_000 },
    ],
    nether: [
      { label: 'Nether Spawn (0, 0)', x: 0, z: 0 },
      { label: 'Basalt Ridge Spires (25k)', x: 25_000, z: 18_000 },
      { label: 'The Great Lava Sea (80k)', x: 80_000, z: -60_000 },
      { label: 'Outer Fracture (600k)', x: 600_000, z: 320_000 },
      { label: 'Nether Farlands Wall (1.568M)', x: 1_568_852, z: 0 },
      { label: 'Nether Farlands Corner (1.568M)', x: 1_568_852, z: 1_568_852 },
      { label: 'Sub-Void Pyrocene (5M)', x: 5_000_000, z: -3_500_000 },
    ],
    underworld: [
      { label: 'Sub-Crustal Void (0, 0)', x: 0, z: 0 },
      { label: 'Abyssal Chasm (180k)', x: 180_000, z: -120_000 },
      { label: 'Sculk Resonance Vault (850k)', x: 850_000, z: 420_000 },
      { label: 'Tectonic Fracture Nexus (4.2M)', x: 4_200_000, z: -2_100_000 },
      { label: 'Inverse Farlands Singularity (12.55M)', x: 12_550_821, z: 12_550_821 },
      { label: 'Deep Matter Void (21M)', x: 21_000_000, z: 16_000_000 },
    ],
  };

  const zoomPresets = dimension === 'nether'
    ? [
        { label: '4M (Nether Max)', scale: 4_000_000 },
        { label: '1.56M (Nether Farlands)', scale: 1_568_852 },
        { label: '300k (Lava Sea)', scale: 300_000 },
        { label: '37k (Basalt Spires)', scale: 37_500 },
        { label: '7.5k (Spawn Caldera)', scale: 7_500 },
        { label: '1k (Chunk Detail)', scale: 1_000 },
      ]
    : [
        { label: '30M (Global)', scale: 30_000_000 },
        { label: '12.5M (Farlands)', scale: 12_550_821 },
        { label: '1M (Outer)', scale: 1_000_000 },
        { label: '300k (Sea)', scale: 300_000 },
        { label: '60k (Amplified)', scale: 60_000 },
        { label: '10k (Region Grid)', scale: 10_000 },
        { label: '1k (Chunk Detail)', scale: 1_000 },
      ];

  // Camera center & reset
  const handleCenterOnPlayer = () => {
    setViewCenterX(currentX);
    setViewCenterZ(currentZ);
  };

  const handleResetToOrigin = () => {
    setViewCenterX(0);
    setViewCenterZ(0);
    setZoomScale(dimension === 'nether' ? 4_000_000 : 30_000_000);
  };

  // Add waypoint
  const handleAddWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaypointName.trim()) return;
    const dist = safeDistance(currentX, currentZ);
    let regName = '';
    if (dimension === 'nether') regName = getNetherRegime(dist).name;
    else if (dimension === 'underworld') regName = getUnderworldRegime(dist).name;
    else regName = getRegimeForDistance(dist).name;

    const wp: Waypoint = {
      id: Date.now().toString(),
      name: newWaypointName.trim(),
      x: currentX,
      z: currentZ,
      dimension,
      regime: regName,
    };
    setWaypoints([wp, ...waypoints]);
    setNewWaypointName('');
  };

  const handleDeleteWaypoint = (id: string) => {
    setWaypoints(waypoints.filter((w) => w.id !== id));
  };

  // Export PNG snapshot
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${dimension}_seed_${worldSeed}_x${currentX}_z${currentZ}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Mouse wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const normX = (mouseX - rect.width / 2) / (rect.width / 2);
      const normZ = (mouseY - rect.height / 2) / (rect.height / 2);

      const zoomFactor = e.deltaY < 0 ? 0.72 : 1.38;
      setZoomScale((prev) => {
        const nextScale = Math.max(500, Math.min(30_000_000, prev * zoomFactor));
        setViewCenterX((cx) => Math.round(cx + normX * (prev - nextScale) * 0.35));
        setViewCenterZ((cz) => Math.round(cz + normZ * (prev - nextScale) * 0.35));
        return nextScale;
      });
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  // Main Canvas Render Loop (Seed-Driven Geographic Topography)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    const blockToScreenX = (bx: number) => cx + ((bx - viewCenterX) / zoomScale) * (width / 2);
    const blockToScreenZ = (bz: number) => cy + ((bz - viewCenterZ) / zoomScale) * (height / 2);

    // Dimension Background Base
    if (dimension === 'nether') {
      ctx.fillStyle = '#0f0505';
    } else if (dimension === 'underworld') {
      ctx.fillStyle = '#02060d';
    } else {
      ctx.fillStyle = mapTheme === 'cyber' ? '#03080c' : mapTheme === 'thermal' ? '#100508' : '#08080a';
    }
    ctx.fillRect(0, 0, width, height);

    // 1. Seed-Derived Geographic Topography & Landforms
    if (layers.topography) {
      if (dimension === 'underworld') {
        // --- REDACTED UNDERWORLD RADAR ---
        // Render high-entropy dark blotches with heavy censorship bars, static scanlines, and redacted stamps
        const gridSteps = 24;
        const stepW = width / gridSteps;
        const stepH = height / gridSteps;

        for (let gy = 0; gy < gridSteps; gy++) {
          for (let gx = 0; gx < gridSteps; gx++) {
            const sampleScreenX = (gx + 0.5) * stepW;
            const sampleScreenZ = (gy + 0.5) * stepH;
            const bx = viewCenterX + ((sampleScreenX - cx) / (width / 2)) * zoomScale;
            const bz = viewCenterZ + ((sampleScreenZ - cy) / (height / 2)) * zoomScale;

            const geo = sampleSeedGeography(bx, bz, worldSeed, 'underworld');
            ctx.fillStyle = geo.colorHex;
            ctx.fillRect(gx * stepW, gy * stepH, stepW + 0.5, stepH + 0.5);
          }
        }

        // Static scanline noise overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 2);
        }

        // Redacted Censorship Bars & Warning Stamps
        const redactedBars = [
          { x: 30, y: 70, w: 220, h: 22, text: '[DATA EXPUNGED]' },
          { x: 220, y: 160, w: 230, h: 22, text: '[CLASSIFIED UNDERWORLD SECTOR]' },
          { x: 60, y: 260, w: 260, h: 24, text: '[SPATIAL ANOMALY: NON-EUCLIDEAN]' },
          { x: 190, y: 360, w: 240, h: 22, text: '[SECTOR TOPOLOGY REDACTED]' },
          { x: 40, y: 410, w: 200, h: 20, text: '[GEOMETRIC DILATION 50x]' },
        ];

        redactedBars.forEach((bar) => {
          ctx.fillStyle = '#050507';
          ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
          ctx.lineWidth = 1;
          ctx.strokeRect(bar.x, bar.y, bar.w, bar.h);

          ctx.fillStyle = '#38bdf8';
          ctx.font = '10px monospace';
          ctx.fillText(bar.text, bar.x + 8, bar.y + 15);
        });

        // Center warning stamp
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(cx - 170, cy - 25, 340, 50);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - 170, cy - 25, 340, 50);

        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('⚠ RADAR SENSORS CORRUPTED IN UNDERWORLD', cx - 150, cy - 6);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('SPACE IS NON-EUCLIDEAN · 200m DROP BELOW BEDROCK', cx - 155, cy + 14);
      } else {
        // --- ULTRA-DETAILED OVERWORLD & NETHER MAPS ---
        const gridSteps = 48; // High-density 48x48 sample grid
        const stepW = width / gridSteps;
        const stepH = height / gridSteps;

        for (let gy = 0; gy < gridSteps; gy++) {
          for (let gx = 0; gx < gridSteps; gx++) {
            const sampleScreenX = (gx + 0.5) * stepW;
            const sampleScreenZ = (gy + 0.5) * stepH;

            const bx = viewCenterX + ((sampleScreenX - cx) / (width / 2)) * zoomScale;
            const bz = viewCenterZ + ((sampleScreenZ - cy) / (height / 2)) * zoomScale;

            const geo = sampleSeedGeography(bx, bz, worldSeed, dimension);
            let cellColor = geo.colorHex;

            if (mapTheme === 'cyber') {
              const isHigh = geo.peaksAndValleys > 0.2;
              cellColor = isHigh ? '#0e7490' : '#082f49';
            } else if (mapTheme === 'thermal') {
              const t = Math.max(0, Math.min(1, (geo.elevationY + 64) / 384));
              cellColor = `rgb(${Math.round(t * 240)}, ${Math.round((1 - t) * 60)}, ${Math.round((1 - t) * 200)})`;
            } else if (mapTheme === 'parchment') {
              cellColor = geo.continentalness < 0 ? '#1e293b' : '#33271e';
            }

            ctx.fillStyle = cellColor;
            ctx.fillRect(gx * stepW, gy * stepH, stepW + 0.5, stepH + 0.5);

            // Detailed elevation contour lines on mountains and ridges
            if (geo.peaksAndValleys > 0.35 && (Math.abs(geo.elevationY) % 32 < 3)) {
              ctx.fillStyle = dimension === 'nether' ? 'rgba(251, 146, 60, 0.4)' : 'rgba(255, 255, 255, 0.35)';
              ctx.fillRect(gx * stepW, gy * stepH, stepW, 1);
            }
          }
        }
      }
    }

    // 2. High-Zoom Grids (Region & Chunk)
    if (layers.regionGrid && zoomScale <= 40_000) {
      const regionSize = 2048;
      const minBx = viewCenterX - zoomScale;
      const maxBx = viewCenterX + zoomScale;
      const minBz = viewCenterZ - zoomScale;
      const maxBz = viewCenterZ + zoomScale;

      const firstRegX = Math.floor(minBx / regionSize);
      const lastRegX = Math.floor(maxBx / regionSize);
      const firstRegZ = Math.floor(minBz / regionSize);
      const lastRegZ = Math.floor(maxBz / regionSize);

      ctx.strokeStyle =
        dimension === 'nether'
          ? 'rgba(239, 68, 68, 0.35)'
          : dimension === 'underworld'
          ? 'rgba(6, 182, 212, 0.35)'
          : 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1;

      for (let rx = firstRegX; rx <= lastRegX; rx++) {
        const sx = blockToScreenX(rx * regionSize);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
        ctx.stroke();
      }

      for (let rz = firstRegZ; rz <= lastRegZ; rz++) {
        const sz = blockToScreenZ(rz * regionSize);
        ctx.beginPath();
        ctx.moveTo(0, sz);
        ctx.lineTo(width, sz);
        ctx.stroke();
      }
    }

    // 3. Concentric Dimension Regime Threshold Rings
    if (layers.regimeRings) {
      const activeRegimes =
        dimension === 'nether'
          ? NETHER_REGIMES.map((r) => ({
              r: r.maxDist,
              color: r.accentColor,
              label: `${r.name} (${Math.round(r.maxDist / 1000)}k)`,
            }))
          : dimension === 'underworld'
          ? UNDERWORLD_REGIMES.map((r) => ({
              r: r.maxDist,
              color: r.accentColor,
              label: `${r.name} (${Math.round(r.maxDist / 1000)}k)`,
            }))
          : [
              { r: 60_000, color: 'rgba(16, 185, 129, 0.5)', label: 'Normal (60k)' },
              { r: 300_000, color: 'rgba(245, 158, 11, 0.5)', label: 'Amplified (300k)' },
              { r: 1_000_000, color: 'rgba(14, 165, 233, 0.5)', label: 'Great Sea (1M)' },
              { r: 12_550_821, color: 'rgba(236, 72, 153, 0.6)', label: 'Farlands (12.55M)' },
              { r: 20_000_000, color: 'rgba(239, 68, 68, 0.5)', label: 'Ultra-Deep (20M)' },
            ];

      activeRegimes.forEach((th) => {
        const originScreenX = blockToScreenX(0);
        const originScreenZ = blockToScreenZ(0);
        const screenRadius = (th.r / zoomScale) * (width / 2);

        if (screenRadius > 2) {
          ctx.beginPath();
          ctx.arc(originScreenX, originScreenZ, screenRadius, 0, Math.PI * 2);
          ctx.strokeStyle = th.color;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          const labelX = originScreenX + screenRadius + 4;
          const labelY = originScreenZ - 4;
          if (labelX >= 10 && labelX < width - 60 && labelY >= 10 && labelY < height) {
            ctx.fillStyle = 'rgba(200, 200, 200, 0.75)';
            ctx.font = '10px monospace';
            ctx.fillText(th.label, labelX, labelY);
          }
        }
      });

      // Farlands Cardinal Boundary Box
      const farlandsLimit = dimension === 'nether' ? 1_568_852 : 12_550_821;
      const flMinX = blockToScreenX(-farlandsLimit);
      const flMaxX = blockToScreenX(farlandsLimit);
      const flMinZ = blockToScreenZ(-farlandsLimit);
      const flMaxZ = blockToScreenZ(farlandsLimit);

      ctx.strokeStyle =
        dimension === 'nether' ? 'rgba(244, 63, 94, 0.5)' : 'rgba(236, 72, 153, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(flMinX, flMinZ, flMaxX - flMinX, flMaxZ - flMinZ);
    }

    // 4. Draw Cartesian Center Axes
    const originSx = blockToScreenX(0);
    const originSz = blockToScreenZ(0);

    ctx.strokeStyle = 'rgba(80, 80, 80, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, originSz);
    ctx.lineTo(width, originSz);
    ctx.moveTo(originSx, 0);
    ctx.lineTo(originSx, height);
    ctx.stroke();

    // 5. Dimension Waypoints
    waypoints
      .filter((w) => w.dimension === dimension)
      .forEach((wp) => {
        const wsx = blockToScreenX(wp.x);
        const wsz = blockToScreenZ(wp.z);

        if (wsx >= 0 && wsx <= width && wsz >= 0 && wsz <= height) {
          ctx.fillStyle =
            dimension === 'nether'
              ? '#f87171'
              : dimension === 'underworld'
              ? '#38bdf8'
              : '#34d399';
          ctx.beginPath();
          ctx.arc(wsx, wsz, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '9px monospace';
          ctx.fillStyle = 'rgba(240, 240, 240, 0.85)';
          ctx.fillText(wp.name, wsx + 5, wsz + 3);
        }
      });

    // 6. Player Target Reticle
    const playerSx = blockToScreenX(currentX);
    const playerSz = blockToScreenZ(currentZ);

    if (playerSx >= -20 && playerSx <= width + 20 && playerSz >= -20 && playerSz <= height + 20) {
      const reticleColor =
        dimension === 'nether' ? '#ef4444' : dimension === 'underworld' ? '#06b6d4' : '#10b981';
      ctx.beginPath();
      ctx.arc(playerSx, playerSz, 8, 0, Math.PI * 2);
      ctx.strokeStyle = reticleColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(playerSx, playerSz, 3, 0, Math.PI * 2);
      ctx.fillStyle = reticleColor;
      ctx.fill();

      ctx.strokeStyle = `${reticleColor}66`;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(originSx, originSz);
      ctx.lineTo(playerSx, playerSz);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 7. Interactive Compass Rose
    const compassCx = width - 36;
    const compassCy = 36;
    ctx.beginPath();
    ctx.arc(compassCx, compassCy, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.font = '10px monospace';
    ctx.fillText('N', compassCx - 3, compassCy - 6);
    ctx.fillStyle = '#a3a3a3';
    ctx.fillText('S', compassCx - 3, compassCy + 14);

    // 8. Scale Ruler
    const rulerPixelWidth = 80;
    const blockSpan = (rulerPixelWidth / (width / 2)) * zoomScale;
    const rulerX = width - 110;
    const rulerY = height - 16;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rulerX, rulerY);
    ctx.lineTo(rulerX + rulerPixelWidth, rulerY);
    ctx.moveTo(rulerX, rulerY - 4);
    ctx.lineTo(rulerX, rulerY + 4);
    ctx.moveTo(rulerX + rulerPixelWidth, rulerY - 4);
    ctx.lineTo(rulerX + rulerPixelWidth, rulerY + 4);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '9px monospace';
    const rulerLabel =
      blockSpan >= 1_000_000
        ? `${(blockSpan / 1_000_000).toFixed(1)}M blocks`
        : blockSpan >= 1_000
        ? `${(blockSpan / 1_000).toFixed(0)}k blocks`
        : `${Math.round(blockSpan)}m`;
    ctx.fillText(rulerLabel, rulerX + 4, rulerY - 6);
  }, [worldSeed, currentX, currentZ, zoomScale, viewCenterX, viewCenterZ, mapTheme, layers, waypoints, dimension]);

  // Elevation Profile Graph
  useEffect(() => {
    const canvas = profileCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, w, h);

    if (dimension === 'nether') {
      const lavaY = h - (31 / 128) * h;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, lavaY);
      ctx.lineTo(w, lavaY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.font = '9px monospace';
      ctx.fillText('Lava Sea Level (Y=31)', 6, lavaY - 3);

      const roofY = h - (127 / 128) * h + 2;
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, roofY);
      ctx.lineTo(w, roofY);
      ctx.stroke();
      ctx.fillText('Bedrock Ceiling (Y=127)', 6, roofY + 10);

      ctx.beginPath();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      const samples = 140;
      for (let i = 0; i <= samples; i++) {
        const frac = i / samples;
        const testDist = frac * 3_000_000;
        const geo = sampleSeedGeography(testDist, 0, worldSeed, 'nether');
        const sx = frac * w;
        const sy = h - (Math.max(0, Math.min(128, geo.elevationY)) / 128) * h;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    } else if (dimension === 'underworld') {
      const bedrockY = 12;
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
      ctx.beginPath();
      ctx.moveTo(0, bedrockY);
      ctx.lineTo(w, bedrockY);
      ctx.stroke();
      ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
      ctx.font = '9px monospace';
      ctx.fillText('Overworld Bedrock Crust (Y=-64)', 6, bedrockY + 10);

      // 200 block drop gap label
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.fillText('↓ 200m Empty Void Drop (Safe)', 6, bedrockY + 24);

      // Floor line: No bedrock!
      const voidDamageY = h - 6;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, voidDamageY);
      ctx.lineTo(w, voidDamageY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
      ctx.fillText('OPEN VOID (NO BEDROCK FLOOR) · Void Damage Below Y=-600', 6, voidDamageY - 3);

      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      const samples = 140;
      for (let i = 0; i <= samples; i++) {
        const frac = i / samples;
        const testDist = frac * 25_000_000;
        const geo = sampleSeedGeography(testDist, 0, worldSeed, 'underworld');
        // Underworld terrain generated between Y=-264 and Y=-580
        const normY = (-264 - geo.elevationY) / 336; // 0 at Y=-264, 1 at Y=-600
        const sx = frac * w;
        const sy = bedrockY + 28 + normY * (h - 48);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    } else {
      const seaY = h - (63 / 384) * h;
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.35)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, seaY);
      ctx.lineTo(w, seaY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(14, 165, 233, 0.6)';
      ctx.font = '9px monospace';
      ctx.fillText('Sea Level (Y=63)', 6, seaY - 3);

      const samples = 140;
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;

      for (let i = 0; i <= samples; i++) {
        const frac = i / samples;
        const testDist = frac * 25_000_000;
        const geo = sampleSeedGeography(testDist, 0, worldSeed, 'overworld');
        const screenX = frac * w;
        const screenY = h - (Math.max(0, Math.min(384, geo.elevationY + 64)) / 384) * h;

        if (i === 0) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();
    }

    const currentDist = safeDistance(currentX, currentZ);
    const maxHorizon = dimension === 'nether' ? 3_000_000 : 25_000_000;
    const playerX = (Math.min(maxHorizon, currentDist) / maxHorizon) * w;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playerX, 0);
    ctx.lineTo(playerX, h);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '10px monospace';
    ctx.fillText('Target', Math.max(6, Math.min(w - 55, playerX + 4)), 14);
  }, [currentX, currentZ, dimension, worldSeed]);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    didDragMoveRef.current = false;
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startCenterX: viewCenterX,
      startCenterZ: viewCenterZ,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (isDragging && dragStart) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        didDragMoveRef.current = true;
        const blockDeltaX = -(deltaX / (rect.width / 2)) * zoomScale;
        const blockDeltaZ = -(deltaY / (rect.height / 2)) * zoomScale;

        setViewCenterX(Math.round(dragStart.startCenterX + blockDeltaX));
        setViewCenterZ(Math.round(dragStart.startCenterZ + blockDeltaZ));
      }
    }

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const normX = (mouseX - rect.width / 2) / (rect.width / 2);
    const normZ = (mouseY - rect.height / 2) / (rect.height / 2);

    const hoverX = Math.round(viewCenterX + normX * zoomScale);
    const hoverZ = Math.round(viewCenterZ + normZ * zoomScale);
    const dist = safeDistance(hoverX, hoverZ);

    let regName = '';
    if (dimension === 'nether') {
      regName = getNetherRegime(dist).name;
    } else if (dimension === 'underworld') {
      regName = getUnderworldRegime(dist).name;
    } else {
      regName = getRegimeForDistance(dist).name;
    }

    // Exact seed geography for hover
    const geo = sampleSeedGeography(hoverX, hoverZ, worldSeed, dimension);

    setHoverInfo({
      x: hoverX,
      z: hoverZ,
      dist,
      regimeName: regName,
      biomeName: `${geo.biomeName} (${geo.terrainLabel})`,
      elevationEstimate: geo.elevationY,
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false);

    if (!didDragMoveRef.current && dragStart) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const normX = (clickX - rect.width / 2) / (rect.width / 2);
        const normZ = (clickY - rect.height / 2) / (rect.height / 2);

        const targetX = Math.round(viewCenterX + normX * zoomScale);
        const targetZ = Math.round(viewCenterZ + normZ * zoomScale);

        onSelectCoord(targetX, targetZ);
      }
    }

    setDragStart(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!didDragMoveRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const normX = (clickX - rect.width / 2) / (rect.width / 2);
      const normZ = (clickY - rect.height / 2) / (rect.height / 2);

      const targetX = Math.round(viewCenterX + normX * zoomScale);
      const targetZ = Math.round(viewCenterZ + normZ * zoomScale);

      onSelectCoord(targetX, targetZ);
    }
  };

  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const x = parseInt(inputX, 10);
    const z = parseInt(inputZ, 10);
    if (!isNaN(x) && !isNaN(z)) {
      onSelectCoord(x, z);
      setViewCenterX(x);
      setViewCenterZ(z);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dimension Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-1.5 bg-neutral-900/90 border border-neutral-800 rounded-xl">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleDimensionChange('overworld')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              dimension === 'overworld'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Overworld Radar</span>
          </button>

          <button
            onClick={() => handleDimensionChange('nether')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              dimension === 'nether'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>The Nether Radar (1:8 Scale)</span>
          </button>

          <button
            onClick={() => handleDimensionChange('underworld')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              dimension === 'underworld'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>The Underworld Radar (Y &lt; -64)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono pr-2">
          <span>Seed: {seedAnalysis.hexSeed.slice(0, 10)}...</span>
          <span className="text-neutral-600">·</span>
          <span className="text-emerald-400 font-medium">
            {dimension === 'nether'
              ? `Lava Sea: ${seedAnalysis.oceanPercent}%`
              : dimension === 'underworld'
              ? `Tectonic Chasm: ${seedAnalysis.oceanPercent}%`
              : `Land: ${seedAnalysis.landPercent}% · Ocean: ${seedAnalysis.oceanPercent}%`}
          </span>
        </div>
      </div>

      {/* Seed Geography Banner */}
      <div className="px-4 py-2 bg-neutral-950/70 border border-neutral-800/80 rounded-lg flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-neutral-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-neutral-400">Seed Landform Signature:</span>
          <span className="font-semibold text-white">{seedAnalysis.dominantGeography}</span>
        </div>
        <div className="text-[11px] font-mono text-neutral-400">
          Mountain Massif Density: <span className="text-emerald-400 font-bold">{seedAnalysis.mountainPercent}%</span>
        </div>
      </div>

      {/* Top Controls Bar: Coordinates, Scale, Pan Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl">
        <form onSubmit={handleApplyCoordinates} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Crosshair
              className={`w-4 h-4 ${
                dimension === 'nether'
                  ? 'text-red-400'
                  : dimension === 'underworld'
                  ? 'text-cyan-400'
                  : 'text-emerald-400'
              }`}
            />
            <span className="font-semibold text-neutral-200">
              {dimension === 'nether'
                ? 'NETHER COORDINATES'
                : dimension === 'underworld'
                ? 'UNDERWORLD COORDINATES'
                : 'OVERWORLD COORDINATES'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400 font-mono">X:</span>
            <input
              type="number"
              value={inputX}
              onChange={(e) => setInputX(e.target.value)}
              className="w-32 px-2.5 py-1.5 font-mono text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400 font-mono">Z:</span>
            <input
              type="number"
              value={inputZ}
              onChange={(e) => setInputZ(e.target.value)}
              className="w-32 px-2.5 py-1.5 font-mono text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-neutral-600"
            />
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-800 border border-neutral-700 rounded hover:bg-neutral-700 transition-colors"
          >
            Locate Target
          </button>
        </form>

        {/* View Camera & Zoom Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={handleCenterOnPlayer}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-300 hover:text-white transition-colors"
            title="Center viewport on target coordinates"
          >
            <Navigation className="w-3 h-3 text-emerald-400" />
            <span>Center Target</span>
          </button>
          <button
            onClick={handleResetToOrigin}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-300 hover:text-white transition-colors"
            title="Reset to world origin (0, 0)"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset (0,0)</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 border-l border-neutral-800 pl-2">
            <button
              onClick={() => setZoomScale((prev) => Math.max(500, prev / 2))}
              className="p-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-neutral-200 min-w-[76px] text-center text-[11px] tabular-nums">
              ±
              {zoomScale >= 1_000_000
                ? `${(zoomScale / 1_000_000).toFixed(1)}M`
                : zoomScale >= 1_000
                ? `${(zoomScale / 1_000).toFixed(0)}k`
                : `${zoomScale}m`}
            </span>
            <button
              onClick={() => setZoomScale((prev) => Math.min(30_000_000, prev * 2))}
              className="p-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1 px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded text-neutral-300 hover:text-white transition-colors"
            title="Export high-resolution map snapshot as PNG"
          >
            <Download className="w-3 h-3 text-neutral-400" />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {/* Preset Scale & Dimension Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-neutral-400 text-[11px] uppercase tracking-wider font-medium mr-1">
            Quick Zoom:
          </span>
          {zoomPresets.map((zp) => (
            <button
              key={zp.label}
              onClick={() => setZoomScale(zp.scale)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                zoomScale === zp.scale
                  ? 'bg-neutral-800 text-emerald-400 border border-neutral-700 font-semibold'
                  : 'bg-neutral-950/80 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {zp.label}
            </button>
          ))}
        </div>

        {/* Theme and Overlays controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-lg">
            {(['topographical', 'cyber', 'thermal', 'parchment'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMapTheme(t)}
                className={`px-2 py-0.5 text-[11px] rounded capitalize transition-colors ${
                  mapTheme === t ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowLayersMenu(!showLayersMenu)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border transition-colors ${
              showLayersMenu
                ? 'bg-neutral-800 border-neutral-700 text-emerald-400 font-medium'
                : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layers</span>
            {showLayersMenu ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Preset Locations Bar for Active Dimension */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-neutral-400 text-[11px] uppercase tracking-wider font-medium mr-1">
          {dimension.toUpperCase()} LOCATIONS:
        </span>
        {dimensionPresets[dimension].map((p) => {
          const isSelected = currentX === p.x && currentZ === p.z;
          return (
            <button
              key={p.label}
              onClick={() => {
                onSelectCoord(p.x, p.z);
                setViewCenterX(p.x);
                setViewCenterZ(p.z);
              }}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                isSelected
                  ? dimension === 'nether'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : dimension === 'underworld'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Two Column Layout: Radar Canvas + Dimension-Aware Region Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canvas Visualizer Column */}
        <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 flex flex-col items-center space-y-4">
          <div className="w-full flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Move className="w-3.5 h-3.5 text-emerald-400" />
              <span>Click to Inspect · Drag to Pan · Scroll to Zoom</span>
            </span>
            {hoverInfo && (
              <span className="font-mono text-[11px] text-neutral-300 truncate max-w-[240px]">
                [{hoverInfo.x.toLocaleString()}, {hoverInfo.z.toLocaleString()}] · {hoverInfo.biomeName}
              </span>
            )}
          </div>

          <div className="relative w-full aspect-square max-w-[480px]">
            <canvas
              ref={canvasRef}
              width={480}
              height={480}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                setIsDragging(false);
                setHoverInfo(null);
              }}
              className={`w-full h-full rounded-lg border border-neutral-800 shadow-inner select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-crosshair'
              }`}
            />

            {/* Corner Zoom & Center Overlay */}
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/75 backdrop-blur-md rounded border border-neutral-800/80 font-mono text-[10px] text-neutral-300">
              {dimension.toUpperCase()} · Center: [{viewCenterX.toLocaleString()}, {viewCenterZ.toLocaleString()}] · Span: ±
              {zoomScale >= 1_000_000
                ? `${(zoomScale / 1_000_000).toFixed(1)}M`
                : `${(zoomScale / 1_000).toFixed(0)}k`}
            </div>
          </div>

          {/* Continuous Elevation Profile Graph along distance axis */}
          <div className="w-full space-y-1.5 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-neutral-300">
                <Mountain className="w-3 h-3 text-emerald-400" />
                <span>
                  {dimension === 'nether'
                    ? 'Nether Stratum Cross-Section (Y=0 to Y=127)'
                    : dimension === 'underworld'
                    ? 'Underworld Sub-Bedrock Chasm (Y=-64 to Y=-256)'
                    : 'Overworld Radial Profile (Y=-64 to Y=319)'}
                </span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                {dimension === 'nether' ? 'Lava Ocean Y=31' : dimension === 'underworld' ? 'Floor Y=-256' : 'Sea Level Y=63'}
              </span>
            </div>
            <div className="w-full h-20 bg-neutral-950 rounded border border-neutral-800/80 overflow-hidden">
              <canvas
                ref={profileCanvasRef}
                width={480}
                height={80}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Dimension Regime Color Legend */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80 text-[11px]">
            {dimension === 'nether'
              ? NETHER_REGIMES.map((r) => (
                  <div key={r.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.accentColor }} />
                    <span className="text-neutral-400 truncate" title={r.name}>{r.name}</span>
                  </div>
                ))
              : dimension === 'underworld'
              ? UNDERWORLD_REGIMES.map((r) => (
                  <div key={r.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.accentColor }} />
                    <span className="text-neutral-400 truncate" title={r.name}>{r.name}</span>
                  </div>
                ))
              : Object.values(REGIMES).map((r) => (
                  <div key={r.type} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.accentColor }} />
                    <span className="text-neutral-400 truncate" title={r.name}>{r.name.split(' ')[0]}</span>
                  </div>
                ))}
          </div>
        </div>

        {/* Detailed Region Telemetry Card (Fully Dimension & Seed Aware) */}
        <div className="lg:col-span-6">
          <RegionInspectorCard
            state={regionState}
            currentX={currentX}
            currentZ={currentZ}
            dimension={dimension}
            worldSeed={worldSeed}
          />
        </div>
      </div>
    </div>
  );
};
