import React, { useRef, useEffect, useState } from 'react';
import { generateVoxelSlice } from '../engine/farlands';
import { Layers, Sliders, Box, Eye, Info, Sparkles, Activity } from 'lucide-react';

export const FarlandsSlicer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [slicePlane, setSlicePlane] = useState<'XZ' | 'XY' | 'YZ'>('XZ');
  const [coordX, setCoordX] = useState<number>(12_550_821);
  const [coordY, setCoordY] = useState<number>(128);
  const [coordZ, setCoordZ] = useState<number>(12_550_821);
  const [latticePeriod, setLatticePeriod] = useState<number>(32);
  const [renderMode, setRenderMode] = useState<'voxel' | 'density'>('voxel');
  const [colorPalette, setColorPalette] = useState<'strata' | 'matrix' | 'thermal' | 'sculk'>('strata');

  // Hover telemetry
  const [hoverData, setHoverData] = useState<{ x: number; y: number; z: number; density: number } | null>(null);

  // Voxel statistics
  const [stats, setStats] = useState<{ solidPercent: number; voidPercent: number; maxDensity: number }>({
    solidPercent: 54.2,
    voidPercent: 45.8,
    maxDensity: 2.15,
  });

  const presets = [
    { name: 'Corner Farlands Nexus', x: 12_550_821, y: 128, z: 12_550_821, plane: 'XZ' as const, period: 32 },
    { name: 'Cardinal Matrix Highway', x: 12_550_821, y: 128, z: 0, plane: 'XY' as const, period: 32 },
    { name: 'Sub-Bedrock Void Abyss', x: 12_550_821, y: -48, z: 12_550_821, plane: 'XZ' as const, period: 16 },
    { name: 'Stratospheric Spires', x: 12_550_821, y: 260, z: 12_550_821, plane: 'YZ' as const, period: 48 },
  ];

  // Render the voxel slice on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resolution = 72; // 72x72 grid
    const step = 2; // 2 blocks per pixel
    const sliceData = generateVoxelSlice(
      slicePlane,
      coordX,
      coordY,
      coordZ,
      resolution,
      step,
      latticePeriod
    );

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / resolution;
    const cellH = height / resolution;

    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, width, height);

    let solidCount = 0;
    let maxD = -999;

    for (let r = 0; r < resolution; r++) {
      for (let c = 0; c < resolution; c++) {
        const density = sliceData[r * resolution + c];
        const px = c * cellW;
        const py = r * cellH;

        if (density > maxD) maxD = density;
        if (density > 0.05) solidCount++;

        if (renderMode === 'voxel') {
          if (density > 0.05) {
            // Palette options
            if (colorPalette === 'matrix') {
              ctx.fillStyle = density > 1.5 ? '#10b981' : density > 0.8 ? '#059669' : '#047857';
            } else if (colorPalette === 'thermal') {
              const val = Math.min(1, Math.max(0, (density + 1) / 3));
              ctx.fillStyle = `rgb(${Math.round(val * 255)}, ${Math.round(val * 120)}, ${Math.round((1 - val) * 200)})`;
            } else if (colorPalette === 'sculk') {
              ctx.fillStyle = density > 1.5 ? '#0284c7' : density > 0.8 ? '#0369a1' : '#082f49';
            } else {
              // Natural Strata
              if (density > 1.8) {
                ctx.fillStyle = '#262626'; // Deepslate
              } else if (density > 0.9) {
                ctx.fillStyle = '#525252'; // Andesite / Stone
              } else {
                ctx.fillStyle = '#737373'; // Surface rock
              }
            }
            ctx.fillRect(px, py, cellW - 0.5, cellH - 0.5);
          } else {
            // Tunnel void
            ctx.fillStyle = colorPalette === 'matrix' ? '#021812' : '#0c0c10';
            ctx.fillRect(px, py, cellW, cellH);
          }
        } else {
          // Density field continuous heatmap
          const norm = Math.max(-2, Math.min(2, density));
          const val = (norm + 2) / 4; // [0, 1]
          const rCol = Math.round(val * 240);
          const bCol = Math.round((1 - val) * 200);
          ctx.fillStyle = `rgb(${rCol}, 60, ${bCol})`;
          ctx.fillRect(px, py, cellW, cellH);
        }
      }
    }

    const totalCells = resolution * resolution;
    const solidPct = Number(((solidCount / totalCells) * 100).toFixed(1));
    setStats({
      solidPercent: solidPct,
      voidPercent: Number((100 - solidPct).toFixed(1)),
      maxDensity: Number(maxD.toFixed(2)),
    });
  }, [slicePlane, coordX, coordY, coordZ, latticePeriod, renderMode, colorPalette]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const resolution = 72;
    const step = 2;
    const c = Math.floor((mx / rect.width) * resolution);
    const r = Math.floor((my / rect.height) * resolution);

    const halfSpan = (resolution * step) / 2;
    let localX = coordX;
    let localY = coordY;
    let localZ = coordZ;

    if (slicePlane === 'XZ') {
      localX = Math.round(coordX - halfSpan + c * step);
      localZ = Math.round(coordZ - halfSpan + r * step);
    } else if (slicePlane === 'XY') {
      localX = Math.round(coordX - halfSpan + c * step);
      localY = Math.round(coordY - halfSpan + r * step);
    } else {
      localZ = Math.round(coordZ - halfSpan + c * step);
      localY = Math.round(coordY - halfSpan + r * step);
    }

    // Estimate density
    const fx = (localX % 2048) / latticePeriod;
    const fy = (localY % 128) / (latticePeriod * 0.5);
    const fz = (localZ % 2048) / latticePeriod;
    const wave = (Math.sin(fx * Math.PI) * Math.cos(fy * Math.PI) + Math.cos(fz * Math.PI)) * 0.5;

    setHoverData({ x: localX, y: localY, z: localZ, density: Number(wave.toFixed(3)) });
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-neutral-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-pink-400" />
            <span>Mathematical Density Equation Simulator</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
            The Farlands Lattice & Corner Voxel Slicer
          </h2>
          <p className="text-xs text-neutral-300 max-w-2xl mt-1">
            Recreates the iconic 3D repeating matrix of tunnels, Corner Farlands intersections, and vertical void chasms using chunk-local trigonometric wave superposition.
          </p>
        </div>

        {/* Slice Plane Selectors */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-lg shrink-0">
          <button
            onClick={() => setSlicePlane('XZ')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              slicePlane === 'XZ' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Horizontal (XZ)
          </button>
          <button
            onClick={() => setSlicePlane('XY')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              slicePlane === 'XY' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Vertical (XY)
          </button>
          <button
            onClick={() => setSlicePlane('YZ')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              slicePlane === 'YZ' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Latitudinal (YZ)
          </button>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-400 text-[11px] uppercase tracking-wider font-medium">Lattice Presets:</span>
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => {
              setCoordX(p.x);
              setCoordY(p.y);
              setCoordZ(p.z);
              setSlicePlane(p.plane);
              setLatticePeriod(p.period);
            }}
            className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Grid: Interactive Canvas + Slicer Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visualizer Canvas */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-neutral-400 mb-3">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-pink-400" />
              <span>Cross-Section View ({slicePlane} Slice · 144m span)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRenderMode('voxel')}
                className={`text-[11px] px-2 py-0.5 rounded ${
                  renderMode === 'voxel' ? 'bg-neutral-800 text-emerald-400 font-semibold' : 'text-neutral-400'
                }`}
              >
                Voxel Solids
              </button>
              <button
                onClick={() => setRenderMode('density')}
                className={`text-[11px] px-2 py-0.5 rounded ${
                  renderMode === 'density' ? 'bg-neutral-800 text-pink-400 font-semibold' : 'text-neutral-400'
                }`}
              >
                Density Field
              </button>
            </div>
          </div>

          <div className="relative w-full aspect-square max-w-[480px]">
            <canvas
              ref={canvasRef}
              width={480}
              height={480}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverData(null)}
              className="w-full h-full rounded-lg border border-neutral-800 shadow-md bg-neutral-950 cursor-crosshair"
            />
          </div>

          {/* Slicer Statistics Bar */}
          <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-neutral-800 text-xs font-mono text-center">
            <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">Solid Ratio</span>
              <span className="text-emerald-400 font-bold">{stats.solidPercent}%</span>
            </div>
            <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">Carved Void Air</span>
              <span className="text-cyan-400 font-bold">{stats.voidPercent}%</span>
            </div>
            <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">Max Wave Density</span>
              <span className="text-white font-bold">{stats.maxDensity}</span>
            </div>
          </div>

          {/* Slicer Legend & Hover Data */}
          <div className="w-full flex items-center justify-between text-xs text-neutral-400 mt-2">
            <span className="font-mono text-[11px] text-neutral-300">
              {hoverData
                ? `Voxel [${hoverData.x.toLocaleString()}, ${hoverData.y}, ${hoverData.z.toLocaleString()}] | D=${hoverData.density}`
                : `Center: [${coordX.toLocaleString()}, ${coordY}, ${coordZ.toLocaleString()}]`}
            </span>
            <div className="flex items-center gap-1.5">
              {(['strata', 'matrix', 'thermal', 'sculk'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setColorPalette(p)}
                  className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                    colorPalette === p ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Slicer Sliders & Configuration */}
        <div className="lg:col-span-5 bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Mathematical Parameters
            </h3>
          </div>

          {/* Lattice Period Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300">Lattice Repeat Period:</span>
              <span className="font-mono text-emerald-400 tabular-nums">{latticePeriod} blocks</span>
            </div>
            <input
              type="range"
              min={16}
              max={64}
              step={4}
              value={latticePeriod}
              onChange={(e) => setLatticePeriod(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-500">
              <span>Dense (16m)</span>
              <span>Classic Farlands (32m)</span>
              <span>Colossal (64m)</span>
            </div>
          </div>

          {/* Elevation Y Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300">Elevation Slice (Y-Level):</span>
              <span className="font-mono text-emerald-400 tabular-nums">Y = {coordY}</span>
            </div>
            <input
              type="range"
              min={-64}
              max={319}
              step={1}
              value={coordY}
              onChange={(e) => setCoordY(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-500">
              <span>Bedrock Void (Y=-64)</span>
              <span>Sea Level (Y=63)</span>
              <span>Sky Limit (Y=319)</span>
            </div>
          </div>

          {/* X Coordinate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300">Target X Coordinate:</span>
              <span className="font-mono text-neutral-200 tabular-nums">{coordX.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={10_000_000}
              max={15_000_000}
              step={50_000}
              value={coordX}
              onChange={(e) => setCoordX(parseInt(e.target.value, 10))}
              className="w-full accent-pink-400 cursor-pointer"
            />
          </div>

          {/* Z Coordinate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300">Target Z Coordinate:</span>
              <span className="font-mono text-neutral-200 tabular-nums">{coordZ.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={10_000_000}
              max={15_000_000}
              step={50_000}
              value={coordZ}
              onChange={(e) => setCoordZ(parseInt(e.target.value, 10))}
              className="w-full accent-pink-400 cursor-pointer"
            />
          </div>

          {/* Mathematical Farlands Formula Card */}
          <div className="p-3.5 bg-neutral-950/80 border border-neutral-800 rounded-lg space-y-1.5 font-mono text-[11px]">
            <div className="text-neutral-400 text-[10px] uppercase font-semibold">Wave Superposition Formula:</div>
            <div className="text-emerald-400">
              D(x, y, z) = [sin(x/λ)·cos(y/0.5λ) + cos(z/λ)] · 0.33
            </div>
            <div className="text-pink-400 text-[10px]">
              + 2.5·sign(sin(x)·sin(z)) &nbsp; [Corner Superposition]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
