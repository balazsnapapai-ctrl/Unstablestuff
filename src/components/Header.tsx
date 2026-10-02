import React from 'react';
import { Download, Sparkles, Package, FileCode } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRandomSeed: () => void;
  onExportJar: () => void;
  onExportZip: () => void;
  isExportingJar: boolean;
  isExportingZip: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRandomSeed,
  onExportJar,
  onExportZip,
  isExportingJar,
  isExportingZip,
}) => {
  const navItems = [
    { id: 'map', label: 'World Map & Radar' },
    { id: 'citadels', label: 'Scholar Citadels' },
    { id: 'farlands', label: 'Farlands 3D Slicer' },
    { id: 'anomalies', label: 'Anomaly Registry' },
    { id: 'laws', label: 'World Laws Lab' },
    { id: 'code', label: 'Mod Source & Export' },
    { id: 'terminal', label: 'Debug Terminal' },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('map')}
          className="text-left font-bold tracking-tight text-white hover:text-neutral-200 transition-colors"
        >
          <span className="text-base text-neutral-100 font-sans font-semibold tracking-wide">
            ANOMALOUS WORLD GENERATOR
          </span>
          <span className="ml-2.5 text-xs text-neutral-400 font-mono">
            Fabric 1.21.1
          </span>
        </button>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap transition-colors text-xs tracking-wider uppercase font-medium ${
                isActive
                  ? 'text-white border-b-2 border-emerald-400 pb-0.5'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRandomSeed}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-700/80 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors whitespace-nowrap"
          title="Derive new pseudo-random 64-bit seed"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Random Seed</span>
        </button>

        <button
          onClick={onExportJar}
          disabled={isExportingJar}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors whitespace-nowrap shadow-sm disabled:opacity-60"
          title="Download production Fabric Mod JAR file for Minecraft 1.21.1 mods folder"
        >
          <Package className="w-3.5 h-3.5" />
          <span>{isExportingJar ? 'Building .JAR...' : 'Export .JAR File'}</span>
        </button>

        <button
          onClick={onExportZip}
          disabled={isExportingZip}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-700/80 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors whitespace-nowrap disabled:opacity-60"
          title="Download complete Gradle development source project"
        >
          <FileCode className="w-3.5 h-3.5 text-neutral-400" />
          <span>{isExportingZip ? 'Packaging...' : 'Export Project .ZIP'}</span>
        </button>
      </div>
    </header>
  );
};
