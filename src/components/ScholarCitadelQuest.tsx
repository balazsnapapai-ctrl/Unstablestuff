import React, { useState } from 'react';
import { LOST_CITADELS, LostCitadel, ScholarBook } from '../engine/scholarLore';
import { UNDERWORLD_SPATIAL_POCKETS, SpatialPocket } from '../engine/spatialAnomalies';
import {
  BookOpen,
  Compass,
  Key,
  Flame,
  Globe,
  Radio,
  Sparkles,
  Search,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  MapPin,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';

interface ScholarCitadelQuestProps {
  onTeleportToCitadel: (x: number, z: number) => void;
}

export const ScholarCitadelQuest: React.FC<ScholarCitadelQuestProps> = ({
  onTeleportToCitadel,
}) => {
  const [selectedCitadel, setSelectedCitadel] = useState<LostCitadel>(LOST_CITADELS[0]);
  const [selectedBook, setSelectedBook] = useState<ScholarBook>(LOST_CITADELS[0].books[0]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [selectedPocket, setSelectedPocket] = useState<SpatialPocket>(UNDERWORLD_SPATIAL_POCKETS[1]);

  // Triangulation calculator states
  const [calcX, setCalcX] = useState<string>('3480200');
  const [calcZ, setCalcZ] = useState<string>('-1820100');
  const [calcBearing, setCalcBearing] = useState<string>('318');
  const [calcResult, setCalcResult] = useState<string | null>(null);

  const handleCalculateTriangulation = (e: React.FormEvent) => {
    e.preventDefault();
    const x = parseInt(calcX, 10);
    const z = parseInt(calcZ, 10);
    if (!isNaN(x) && !isNaN(z)) {
      setCalcResult(
        `Triangulation Lock Confirmed: Target locus points toward ${selectedCitadel.name} [${selectedCitadel.approxCoord.x.toLocaleString()}, ${selectedCitadel.approxCoord.y}, ${selectedCitadel.approxCoord.z.toLocaleString()}]. Bearing drift: 0.14°`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Endgame Grand Mystery & Investigation</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            The Lost Scholar Citadels & Ancient Scriptoriums
          </h2>
          <p className="text-xs text-neutral-300 max-w-3xl mt-1 leading-relaxed">
            Long before your arrival, a league of ancient geometers and void scholars ventured deep into the far reaches of reality to catalog the breaking points of creation. They built three monumental Citadels housing sacred tomes. Uncovering them requires deciphering clues, navigating non-Euclidean spatial anomalies, and surviving the 200-block sub-bedrock void drop.
          </p>
        </div>
      </div>

      {/* Citadel Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LOST_CITADELS.map((citadel) => {
          const isSelected = selectedCitadel.id === citadel.id;
          return (
            <div
              key={citadel.id}
              onClick={() => {
                setSelectedCitadel(citadel);
                setSelectedBook(citadel.books[0]);
                setActivePageIndex(0);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-neutral-850 border-amber-500/60 shadow-md shadow-amber-500/5'
                  : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="capitalize font-semibold flex items-center gap-1.5">
                  {citadel.dimension === 'overworld' ? (
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  ) : citadel.dimension === 'nether' ? (
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span className="text-neutral-300">{citadel.dimension}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    citadel.difficulty === 'Endgame Transcendent'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : citadel.difficulty === 'Near Impossible'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {citadel.difficulty}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm line-clamp-1">{citadel.name}</h3>

              <div className="font-mono text-[11px] text-neutral-400 mt-2">
                Est. Coord: [{citadel.approxCoord.x.toLocaleString()}, Y={citadel.approxCoord.y},{' '}
                {citadel.approxCoord.z.toLocaleString()}]
              </div>

              <div className="text-[11px] text-neutral-400 mt-2 line-clamp-2">
                {citadel.accessRequirement}
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-amber-400 font-medium text-[11px]">
                  {citadel.books.length} Recoverable Tome{citadel.books.length > 1 ? 's' : ''}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTeleportToCitadel(citadel.approxCoord.x, citadel.approxCoord.z);
                  }}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[10px] font-medium"
                >
                  Locate on Map
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Manuscript Reader + Non-Euclidean Spatial Chamber Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: The Scholar Scriptorium & Book Reader */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Recovered Manuscript Scriptorium</h3>
            </div>
            {/* Book Selector Tabs */}
            <div className="flex items-center gap-1.5">
              {selectedCitadel.books.map((b) => (
                <button
                  key={b.title}
                  onClick={() => {
                    setSelectedBook(b);
                    setActivePageIndex(0);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded transition-colors ${
                    selectedBook.title === b.title
                      ? 'bg-neutral-800 text-amber-300 font-semibold border border-neutral-700'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {b.title.split(' ')[0]}...
                </button>
              ))}
            </div>
          </div>

          {/* Book Information Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs bg-neutral-950 p-3 rounded-lg border border-neutral-800/80 gap-1 font-mono">
            <div>
              <span className="text-neutral-400">Title:</span>{' '}
              <span className="text-white font-semibold">{selectedBook.title}</span>
            </div>
            <div className="text-neutral-400">
              By: <span className="text-amber-400">{selectedBook.author}</span> ({selectedBook.era})
            </div>
          </div>

          {/* Manuscript Parchment Reader */}
          <div className="p-6 bg-[#1a1715] border border-[#3b322a] rounded-xl text-neutral-200 shadow-inner font-serif min-h-[220px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-2 right-3 font-mono text-[10px] text-amber-600/70 select-none">
              PAGE {activePageIndex + 1} OF {selectedBook.pages.length}
            </div>

            <p className="text-sm leading-relaxed italic text-[#e7dec8] whitespace-pre-line font-sans">
              "{selectedBook.pages[activePageIndex]}"
            </p>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#3a3229] font-sans text-xs">
              <button
                disabled={activePageIndex === 0}
                onClick={() => setActivePageIndex((p) => Math.max(0, p - 1))}
                className="flex items-center gap-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous Page</span>
              </button>
              <span className="text-[11px] text-neutral-500 font-mono">
                {selectedBook.location}
              </span>
              <button
                disabled={activePageIndex === selectedBook.pages.length - 1}
                onClick={() =>
                  setActivePageIndex((p) => Math.min(selectedBook.pages.length - 1, p + 1))
                }
                className="flex items-center gap-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>Next Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Investigation Clues & Field Journal */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Recovered Exploration Clues & Astrolabe Bearings
            </div>
            <div className="space-y-1.5">
              {selectedCitadel.clues.map((clue, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-lg text-xs text-neutral-300 font-mono leading-relaxed"
                >
                  {clue}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Non-Euclidean Spatial Anomaly Visualizer & Triangulator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Spatial Anomaly Chamber Simulator */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Non-Euclidean Spatial Dilation</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                TARDIS Geometry
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              In the Underworld, space is non-Euclidean. A narrow 3x3 fissure opens into a cavern
              expanding over 300 to 512 blocks inside. Stepping backward collapses space back to
              normal scale.
            </p>

            {/* Spatial Pocket Selector */}
            <div className="space-y-2">
              <span className="text-[11px] text-neutral-400 font-medium">Select Spatial Pocket:</span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {UNDERWORLD_SPATIAL_POCKETS.map((pkt) => (
                  <button
                    key={pkt.id}
                    onClick={() => setSelectedPocket(pkt)}
                    className={`p-2 rounded text-left border transition-colors ${
                      selectedPocket.id === pkt.id
                        ? 'bg-neutral-800 border-cyan-500/60 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold truncate text-[11px]">{pkt.name}</div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                      {pkt.dilationFactor}x Dilation
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Spatial Pocket Comparison Matrix */}
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-neutral-800">
                <span className="text-neutral-400">Exterior Doorway:</span>
                <span className="text-white font-bold">
                  {selectedPocket.exteriorSize.width}x{selectedPocket.exteriorSize.depth}x
                  {selectedPocket.exteriorSize.height} blocks (Tiny Fissure)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-neutral-800">
                <span className="text-neutral-400">Interior Chamber:</span>
                <span className="text-cyan-400 font-bold">
                  {selectedPocket.interiorSize.width}x{selectedPocket.interiorSize.depth}x
                  {selectedPocket.interiorSize.height} blocks (Massive)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Volumetric Ratio:</span>
                <span className="text-emerald-400 font-bold">
                  {(
                    (selectedPocket.interiorSize.width *
                      selectedPocket.interiorSize.depth *
                      selectedPocket.interiorSize.height) /
                    (selectedPocket.exteriorSize.width *
                      selectedPocket.exteriorSize.depth *
                      selectedPocket.exteriorSize.height)
                  ).toLocaleString()}
                  :1 Expansion
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-neutral-950/60 rounded border border-neutral-800/80 text-[11px] text-neutral-300">
              <span className="font-semibold text-white">Underworld Spatial Law:</span>{' '}
              {selectedPocket.description}
            </div>
          </div>

          {/* Triangulation Calculator */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Citadel Astrolabe Triangulator</h3>
            </div>

            <form onSubmit={handleCalculateTriangulation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-400 font-mono text-[10px] block">Known Ruin X</span>
                  <input
                    type="number"
                    value={calcX}
                    onChange={(e) => setCalcX(e.target.value)}
                    className="w-full px-2.5 py-1.5 font-mono bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-neutral-400 font-mono text-[10px] block">Known Ruin Z</span>
                  <input
                    type="number"
                    value={calcZ}
                    onChange={(e) => setCalcZ(e.target.value)}
                    className="w-full px-2.5 py-1.5 font-mono bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="text-neutral-400 font-mono text-[10px] block">Bearing / Azimuth Angle</span>
                <input
                  type="number"
                  value={calcBearing}
                  onChange={(e) => setCalcBearing(e.target.value)}
                  className="w-full px-2.5 py-1.5 font-mono bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded transition-colors"
              >
                Compute Geodesic Intersection
              </button>
            </form>

            {calcResult && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded text-xs text-emerald-300 font-mono leading-relaxed">
                {calcResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
