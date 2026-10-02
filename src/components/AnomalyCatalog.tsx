import React, { useState, useMemo } from 'react';
import { ANOMALIES, AnomalyCategory, AnomalyDefinition } from '../engine/anomalies';
import { ShieldAlert, Filter, Sparkles, AlertTriangle, CheckCircle2, CheckSquare, Square, RefreshCw } from 'lucide-react';

export const AnomalyCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  // Allow selecting unlimited / multiple anomalies
  const [selectedAnomalyIds, setSelectedAnomalyIds] = useState<string[]>([
    'anomalousworld:elytra_propulsion_failure',
    'anomalousworld:gravitational_drift',
    'anomalousworld:f3_coordinate_malfunction',
    'anomalousworld:compass_flux',
    'anomalousworld:fluid_stasis',
    'anomalousworld:mist_veil',
    'anomalousworld:lattice_fracture',
  ]);

  const categories = ['ALL', ...Object.values(AnomalyCategory)];

  const filteredAnomalies = ANOMALIES.filter((a) => {
    if (selectedCategory === 'ALL') return true;
    return a.category === selectedCategory;
  });

  const toggleSelectForCombinator = (id: string) => {
    if (selectedAnomalyIds.includes(id)) {
      setSelectedAnomalyIds(selectedAnomalyIds.filter((item) => item !== id));
    } else {
      setSelectedAnomalyIds([...selectedAnomalyIds, id]);
    }
  };

  const handleSelectAll = () => {
    setSelectedAnomalyIds(ANOMALIES.map((a) => a.id));
  };

  const handleClearAll = () => {
    setSelectedAnomalyIds([]);
  };

  const handleSelectPresetFarlands = () => {
    setSelectedAnomalyIds([
      'anomalousworld:lattice_fracture',
      'anomalousworld:f3_coordinate_malfunction',
      'anomalousworld:compass_flux',
      'anomalousworld:elytra_propulsion_failure',
      'anomalousworld:gravitational_drift',
      'anomalousworld:optical_twilight',
      'anomalousworld:inversion_pulse',
      'anomalousworld:acoustic_echo',
    ]);
  };

  // Conflict Resolution simulation on all selected anomalies
  const resolvedSelection = useMemo(() => {
    const chosen = ANOMALIES.filter((a) => selectedAnomalyIds.includes(a.id));
    const active: AnomalyDefinition[] = [];
    const suppressed: { anomaly: AnomalyDefinition; reason: string }[] = [];
    const seenTags = new Set<string>();

    // Priority order: higher baseWeight takes precedence
    const sorted = [...chosen].sort((a, b) => b.baseWeight - a.baseWeight);

    for (const a of sorted) {
      if (seenTags.has(a.conflictTag)) {
        suppressed.push({
          anomaly: a,
          reason: `Conflict on tag '${a.conflictTag}' (Superseded by higher priority anomaly with weight ${a.baseWeight})`,
        });
      } else {
        active.push(a);
        seenTags.add(a.conflictTag);
      }
    }

    return { active, suppressed };
  }, [selectedAnomalyIds]);

  return (
    <div className="space-y-6">
      {/* Category Filter Controls & Preset Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedCategory === cat
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Multi-selection quick controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-950 border border-neutral-800 rounded hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <CheckSquare className="w-3 h-3 text-emerald-400" />
            <span>Select All ({ANOMALIES.length})</span>
          </button>
          <button
            onClick={handleSelectPresetFarlands}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded hover:bg-amber-900/40 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Farlands Nexus Preset</span>
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-400 bg-neutral-950 border border-neutral-800 rounded hover:bg-neutral-800 transition-colors"
          >
            <Square className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Emergent Multi-Law Combinator & Conflict Resolution Tester */}
      <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
          <div>
            <div className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-Law Synthesis Engine</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              Multi-Anomaly Combinator & Regional Conflict Matrix
            </h3>
          </div>
          <div className="text-xs text-neutral-300 font-mono">
            Selected: <span className="text-emerald-400 font-bold">{selectedAnomalyIds.length}</span> of {ANOMALIES.length} Anomalies (Unlimited Selection Enabled)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Active Coexisting Rules */}
          <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Coexisting Regional Laws ({resolvedSelection.active.length})</span>
              </div>
              <span className="text-neutral-500 font-mono text-[10px]">Resolved Deterministically</span>
            </div>
            {resolvedSelection.active.length === 0 ? (
              <p className="text-neutral-500 italic p-3">No anomalies selected. Select from the cards below to preview regional laws.</p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {resolvedSelection.active.map((a) => (
                  <div key={a.id} className="p-2.5 bg-neutral-900/80 border border-neutral-800 rounded">
                    <div className="font-semibold text-neutral-100 flex items-center justify-between">
                      <span className="text-white">{a.name}</span>
                      <span className="text-[11px] font-mono text-neutral-400">tag: {a.conflictTag}</span>
                    </div>
                    <div className="text-[11px] text-emerald-400/90 font-mono mt-1">{a.mechanicalEffect}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suppressed / Resolved Conflicts */}
          <div className="p-4 bg-neutral-950/70 border border-neutral-800 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between font-semibold text-amber-400 uppercase tracking-wider text-[11px]">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Deterministically Resolved Conflicts ({resolvedSelection.suppressed.length})</span>
              </div>
              <span className="text-neutral-500 font-mono text-[10px]">Priority-Filtered</span>
            </div>
            {resolvedSelection.suppressed.length === 0 ? (
              <div className="p-4 bg-neutral-900/40 rounded border border-neutral-800/80 text-neutral-400 text-xs italic">
                Zero conflict tags overlap. All selected anomalies harmoniously coexist and execute their mechanical laws together without mutual interference.
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {resolvedSelection.suppressed.map((s, idx) => (
                  <div key={idx} className="p-2.5 bg-amber-950/20 border border-amber-800/40 rounded text-amber-200">
                    <div className="font-semibold">{s.anomaly.name}</div>
                    <div className="text-[11px] text-amber-300/80 mt-0.5">{s.reason}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Anomaly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnomalies.map((a) => {
          const isSelected = selectedAnomalyIds.includes(a.id);
          return (
            <div
              key={a.id}
              onClick={() => toggleSelectForCombinator(a.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-neutral-900 border-emerald-500/60 shadow-sm ring-1 ring-emerald-500/20'
                  : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span>{a.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-neutral-400">Tier ≥ {a.minRegimeTier}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-tight mt-1">{a.name}</h4>
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}} // handled by parent div
                  className="mt-1 rounded border-neutral-700 bg-neutral-950 text-emerald-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <p className="text-xs text-neutral-300 mt-2 line-clamp-2">{a.description}</p>

              <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400/90 font-mono truncate max-w-[210px]" title={a.mechanicalEffect}>
                  {a.mechanicalEffect}
                </span>
                <span className="text-neutral-500 font-mono">w={a.baseWeight.toFixed(1)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
