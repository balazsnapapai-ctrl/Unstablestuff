/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { WorldMapViewer } from './components/WorldMapViewer';
import { ScholarCitadelQuest } from './components/ScholarCitadelQuest';
import { FarlandsSlicer } from './components/FarlandsSlicer';
import { AnomalyCatalog } from './components/AnomalyCatalog';
import { WorldLawsLab } from './components/WorldLawsLab';
import { DebugConsole } from './components/DebugConsole';
import { ModCodeExplorer } from './components/ModCodeExplorer';
import { createModJar, createModZip } from './engine/modFiles';
import { splitMix64 } from './engine/deterministic';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [worldSeed, setWorldSeed] = useState<bigint>(123456789012345n);
  const [currentX, setCurrentX] = useState<number>(0);
  const [currentZ, setCurrentZ] = useState<number>(0);
  const [isExportingJar, setIsExportingJar] = useState<boolean>(false);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);

  const handleRandomSeed = () => {
    const randomBig = BigInt(Math.floor(Math.random() * 1000000000)) ^ (BigInt(Date.now()) << 16n);
    const newSeed = splitMix64(randomBig);
    setWorldSeed(newSeed);
  };

  const handleExportJar = async () => {
    try {
      setIsExportingJar(true);
      const jarBlob = await createModJar();
      const url = URL.createObjectURL(jarBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'anomalous-world-generator-1.0.0.jar';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export mod jar:', err);
    } finally {
      setIsExportingJar(false);
    }
  };

  const handleExportZip = async () => {
    try {
      setIsExportingZip(true);
      const zipBlob = await createModZip();
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'anomalous-world-generator-fabric-1.21.1.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export mod zip:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRandomSeed={handleRandomSeed}
        onExportJar={handleExportJar}
        onExportZip={handleExportZip}
        isExportingJar={isExportingJar}
        isExportingZip={isExportingZip}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'map' && (
          <WorldMapViewer
            worldSeed={worldSeed}
            currentX={currentX}
            currentZ={currentZ}
            onSelectCoord={(x, z) => {
              setCurrentX(x);
              setCurrentZ(z);
            }}
          />
        )}

        {activeTab === 'citadels' && (
          <ScholarCitadelQuest
            onTeleportToCitadel={(x, z) => {
              setCurrentX(x);
              setCurrentZ(z);
              setActiveTab('map');
            }}
          />
        )}

        {activeTab === 'farlands' && <FarlandsSlicer />}

        {activeTab === 'anomalies' && <AnomalyCatalog />}

        {activeTab === 'laws' && <WorldLawsLab />}

        {activeTab === 'code' && (
          <ModCodeExplorer
            onExportJar={handleExportJar}
            onExportZip={handleExportZip}
            isExportingJar={isExportingJar}
            isExportingZip={isExportingZip}
          />
        )}

        {activeTab === 'terminal' && (
          <DebugConsole
            worldSeed={worldSeed}
            currentX={currentX}
            currentZ={currentZ}
            onTeleport={(x, z) => {
              setCurrentX(x);
              setCurrentZ(z);
            }}
          />
        )}
      </main>

      {/* Quiet, clean footer without ornamental telemetry */}
      <footer className="mt-auto py-5 border-t border-neutral-900 bg-neutral-950 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Anomalous World Generator</span>
            <span aria-hidden="true">·</span>
            <span>Minecraft Java Edition 1.21.1 (Fabric)</span>
            <span aria-hidden="true">·</span>
            <span>Exportable as .JAR</span>
          </div>
          <div>
            <span>Deterministic Procedural World Generation Framework</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
