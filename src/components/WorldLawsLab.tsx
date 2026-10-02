import React, { useState, useEffect } from 'react';
import { Wind, Layers, Compass, ShieldCheck, Flame, Play, AlertOctagon, Monitor, Sparkles } from 'lucide-react';

export const WorldLawsLab: React.FC = () => {
  // Simulator state: Elytra test
  const [elytraRegionQuenched, setElytraRegionQuenched] = useState<boolean>(true);
  const [fireworkIgnited, setFireworkIgnited] = useState<boolean>(false);
  const [gliderSpeed, setGliderSpeed] = useState<number>(12); // base glide speed m/s

  // Simulator state: Gravity test
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [dropProgressVanilla, setDropProgressVanilla] = useState<number>(0);
  const [dropProgressAnomalous, setDropProgressAnomalous] = useState<number>(0);

  // Simulator state: Compass oscillation & F3 Coordinate Malfunction
  const [compassAngle, setCompassAngle] = useState<number>(0);
  const [f3MalfunctionMode, setF3MalfunctionMode] = useState<'nominal' | 'jitter' | 'catastrophic'>('catastrophic');
  const [f3JitterOffset, setF3JitterOffset] = useState<{ x: string; y: string; z: string; facing: string }>({
    x: '12550821.500',
    y: '128.000',
    z: '12550821.500',
    facing: 'north (Towards negative Z) (0.0 / 0.0)',
  });

  // Simulator state: Underworld interaction
  const [underworldActionLog, setUnderworldActionLog] = useState<string[]>([]);
  const selectedUnderworldBiome = 'Void Shards (Fractured Islands)';

  // Handle firework launch
  const handleLaunchRocket = () => {
    setFireworkIgnited(true);
    if (!elytraRegionQuenched) {
      setGliderSpeed(33.5);
    }
    setTimeout(() => {
      setFireworkIgnited(false);
      if (!elytraRegionQuenched) {
        setGliderSpeed(12);
      }
    }, 2000);
  };

  // Synchronized Compass and F3 Debug Screen Glitch Animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (f3MalfunctionMode === 'nominal') {
        setCompassAngle((prev) => prev * 0.85);
        setF3JitterOffset({
          x: '12550821.500',
          y: '128.000',
          z: '12550821.500',
          facing: 'north (Towards negative Z) (0.0 / 0.0)',
        });
      } else if (f3MalfunctionMode === 'jitter') {
        // Needle oscillations +/- 40 degrees
        setCompassAngle((prev) => (prev + (Math.random() * 80 - 40)) % 360);
        // Moderate coordinate drift
        const dx = (Math.random() * 200 - 100).toFixed(1);
        const dz = (Math.random() * 200 - 100).toFixed(1);
        setF3JitterOffset({
          x: `12550821.${Math.floor(Math.random() * 999)} (~${dx})`,
          y: `128.${Math.floor(Math.random() * 999)}`,
          z: `12550821.${Math.floor(Math.random() * 999)} (~${dz})`,
          facing: 'unstable (Fluctuating Polar Drift)',
        });
      } else {
        // Catastrophic reality collapse
        setCompassAngle((prev) => (prev + (Math.random() * 160 - 80)) % 360);
        const glyphs = ['§k???§r', '§cNaN§r', '§4[ERR_FLUX]§r', '§k888§r', '§60xDEAD§r', '-0.0000', '§c[DRIFT_OVERFLOW]§r'];
        const g1 = glyphs[Math.floor(Math.random() * glyphs.length)];
        const g2 = glyphs[Math.floor(Math.random() * glyphs.length)];
        setF3JitterOffset({
          x: `12550${Math.floor(Math.random() * 99)}.${g1}`,
          y: `§c[Y_SINGULARITY]§r`,
          z: `-12550${Math.floor(Math.random() * 99)}.${g2}`,
          facing: 'undefined (Orthogonal 4D Vector) (NaN / NaN)',
        });
      }
    }, 120);
    return () => clearInterval(interval);
  }, [f3MalfunctionMode]);

  // Handle Gravity Drop
  const handleStartDrop = () => {
    if (isDropping) return;
    setIsDropping(true);
    setDropProgressVanilla(0);
    setDropProgressAnomalous(0);

    let t = 0;
    const interval = setInterval(() => {
      t += 0.05;
      const vDist = Math.min(100, 0.5 * 9.8 * t * t * 15);
      const aDist = Math.min(100, 0.5 * (9.8 * 0.4) * t * t * 15);

      setDropProgressVanilla(vDist);
      setDropProgressAnomalous(aDist);

      if (vDist >= 100 && aDist >= 100) {
        clearInterval(interval);
        setIsDropping(false);
      }
    }, 50);
  };

  const handleUnderworldInteraction = (action: string) => {
    const log = `[T=${new Date().toLocaleTimeString()}] ${action} attempted at Y=-72 -> Stone structure absorbs kinetic impact silently. Block remains immutable.`;
    setUnderworldActionLog((prev) => [log, ...prev.slice(0, 4)]);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Regional World Laws & Physical Anomalies Laboratory
        </h2>
        <p className="text-xs text-neutral-300 mt-1 max-w-3xl">
          World laws alter core mechanics in localized regions without artificial notification popups. Discover anomalies through experimentation: Elytra propulsion failures, low-gravity falls, compass needle spins, and severe F3 debug screen telemetry malfunctions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lab 1: F3 Debug Screen Coordinate Malfunction & Compass Flux (NEW & HIGHLIGHTED) */}
        <div className="lg:col-span-2 p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Navigation Anomaly: Paired Compass Flux & F3 Debug Coordinate Collapse
                </h3>
                <div className="text-xs text-neutral-400 mt-0.5">
                  When entering polar/navigational flux zones, both physical compasses and the client F3 debug telemetry malfunction severely.
                </div>
              </div>
            </div>

            {/* Severity Controls */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs self-start sm:self-auto">
              <button
                onClick={() => setF3MalfunctionMode('nominal')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  f3MalfunctionMode === 'nominal' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Nominal (Vanilla)
              </button>
              <button
                onClick={() => setF3MalfunctionMode('jitter')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  f3MalfunctionMode === 'jitter' ? 'bg-amber-950/60 text-amber-200 border border-amber-800/60 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Polar Drift Jitter
              </button>
              <button
                onClick={() => setF3MalfunctionMode('catastrophic')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  f3MalfunctionMode === 'catastrophic' ? 'bg-red-950/60 text-red-200 border border-red-800/60 font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Catastrophic Malfunction
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Interactive Compass Needle Display */}
            <div className="md:col-span-4 p-4 bg-neutral-950/80 border border-neutral-800 rounded-lg flex flex-col items-center justify-center space-y-3">
              <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Magnetic Compass Needle
              </div>
              <div className="relative w-28 h-28 rounded-full border-2 border-neutral-700 bg-neutral-900 flex items-center justify-center shadow-inner">
                <div className="absolute top-1 text-[10px] font-mono text-neutral-400 font-bold">N</div>
                <div className="absolute bottom-1 text-[10px] font-mono text-neutral-400 font-bold">S</div>
                <div className="absolute right-1.5 text-[10px] font-mono text-neutral-400 font-bold">E</div>
                <div className="absolute left-1.5 text-[10px] font-mono text-neutral-400 font-bold">W</div>

                {/* Animated Needle */}
                <div
                  className="w-1.5 h-20 bg-gradient-to-t from-neutral-500 via-neutral-100 to-red-500 rounded-full transition-transform duration-100"
                  style={{ transform: `rotate(${compassAngle}deg)` }}
                />
              </div>
              <div className="text-[11px] font-mono text-neutral-400 text-center">
                {f3MalfunctionMode === 'nominal'
                  ? 'Bearing: 0.0° (Locked North)'
                  : f3MalfunctionMode === 'jitter'
                  ? 'Heading: Erratic Wobble (±60°)'
                  : 'Heading: Turbulent Spin (360° Chaos)'}
              </div>
            </div>

            {/* Authentic Minecraft F3 Debug Screen HUD Simulator */}
            <div className="md:col-span-8 p-4 bg-black/85 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-100 space-y-1 shadow-inner relative overflow-hidden">
              <div className="absolute top-2 right-2 text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                <Monitor className="w-3 h-3" />
                <span>Minecraft F3 Debug HUD</span>
              </div>

              <div className="text-neutral-400 text-[11px]">Minecraft 1.21.1 (Fabric / anomalousworld)</div>
              <div className="text-neutral-400 text-[11px]">144 fps T: 144 B: 0</div>
              
              <div className="pt-2 text-white font-bold">
                XYZ: <span className={f3MalfunctionMode !== 'nominal' ? 'text-amber-300 underline decoration-amber-500/60' : 'text-emerald-400'}>
                  {f3JitterOffset.x} / {f3JitterOffset.y} / {f3JitterOffset.z}
                </span>
              </div>

              <div className="text-neutral-300">
                Block: <span className={f3MalfunctionMode === 'catastrophic' ? 'text-red-400 font-bold' : ''}>
                  {f3MalfunctionMode === 'catastrophic' ? '[CORRUPTED_STRATA_0x7F] ~~~~~' : '12550821 128 12550821'}
                </span>
              </div>

              <div className="text-neutral-300">
                Chunk: <span className={f3MalfunctionMode === 'catastrophic' ? 'text-red-400 font-bold' : ''}>
                  {f3MalfunctionMode === 'catastrophic' ? '§k99§r in §k784426§r' : '5 8 5 in 784426 784426'}
                </span>
              </div>

              <div className="text-neutral-300">
                Facing: <span className={f3MalfunctionMode !== 'nominal' ? 'text-amber-400' : 'text-neutral-200'}>
                  {f3JitterOffset.facing}
                </span>
              </div>

              <div className="text-neutral-400">Client Light: 15 (15 sky, 0 block)</div>
              <div className="text-neutral-400">Biome: anomalousworld:farlands_orthogonal_lattice</div>
              <div className="text-neutral-500 text-[10px] pt-1">
                Local Anomaly Status: {f3MalfunctionMode !== 'nominal' ? '§cActive Dimensional & Coordinate Distortion§r' : 'Nominal Euclidean Space'}
              </div>
            </div>
          </div>
        </div>

        {/* Lab 2: Elytra Propulsion Quenching */}
        <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Elytra Kinetic Propulsion Quenching
              </h3>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
              <button
                onClick={() => setElytraRegionQuenched(false)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  !elytraRegionQuenched ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Standard Zone
              </button>
              <button
                onClick={() => setElytraRegionQuenched(true)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  elytraRegionQuenched ? 'bg-amber-950/60 text-amber-200 border border-amber-800/60' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Quenched Zone
              </button>
            </div>
          </div>

          <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Current Elytra Flight Speed:</span>
              <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                {gliderSpeed.toFixed(1)} m/s
              </span>
            </div>

            <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${(gliderSpeed / 35) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleLaunchRocket}
                disabled={fireworkIgnited}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors border border-neutral-700 disabled:opacity-50"
              >
                <Flame className={`w-3.5 h-3.5 ${fireworkIgnited ? 'text-amber-400 animate-pulse' : 'text-neutral-400'}`} />
                <span>{fireworkIgnited ? 'Rocket Ignited...' : 'Use Firework Rocket'}</span>
              </button>

              <span className="text-[11px] text-neutral-400">
                {elytraRegionQuenched
                  ? 'Local Law: Propulsion failure active'
                  : 'Local Law: Full rocket thrust enabled'}
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-400">
            {elytraRegionQuenched
              ? 'Observation: Rocket consumes a charge and sparks fly, but forward impulse vector is suppressed. Glider continues gliding at natural descent velocity.'
              : 'Observation: Rocket accelerates flight velocity from 12 m/s to 33.5 m/s normally.'}
          </p>
        </div>

        {/* Lab 3: Gravitational Attenuation */}
        <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Gravitational Attenuation (0.4g)
              </h3>
            </div>
            <button
              onClick={handleStartDrop}
              disabled={isDropping}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>Drop Test</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-950/70 border border-neutral-800 rounded-lg">
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-neutral-300">Vanilla World (1.0g)</div>
              <div className="h-32 bg-neutral-900 rounded-lg relative border border-neutral-800 flex justify-center">
                <div
                  className="w-4 h-4 bg-neutral-300 rounded absolute transition-all"
                  style={{ top: `${dropProgressVanilla * 0.8}%` }}
                />
              </div>
              <div className="text-[11px] text-neutral-400 font-mono text-center">
                {dropProgressVanilla >= 100 ? 'Impact (Fast)' : 'Falling...'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-amber-300">Anomalous Zone (0.4g)</div>
              <div className="h-32 bg-neutral-900 rounded-lg relative border border-neutral-800 flex justify-center">
                <div
                  className="w-4 h-4 bg-amber-400 rounded absolute transition-all"
                  style={{ top: `${dropProgressAnomalous * 0.8}%` }}
                />
              </div>
              <div className="text-[11px] text-neutral-400 font-mono text-center">
                {dropProgressAnomalous >= 100 ? 'Gentle Landing' : 'Float Descending...'}
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-400">
            Observation: Fall damage is mitigated by reduced downward kinetic acceleration. Jumps hang suspended in midair for 2.5x longer.
          </p>
        </div>
      </div>
    </div>
  );
};
