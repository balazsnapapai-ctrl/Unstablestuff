import React, { useState } from 'react';
import { MOD_SOURCE_FILES, ModFileEntry } from '../engine/modFiles';
import { FileCode, Folder, Copy, Check, Download, Package, CheckCircle2, Terminal } from 'lucide-react';

interface ModCodeExplorerProps {
  onExportJar: () => void;
  onExportZip: () => void;
  isExportingJar: boolean;
  isExportingZip: boolean;
}

export const ModCodeExplorer: React.FC<ModCodeExplorerProps> = ({
  onExportJar,
  onExportZip,
  isExportingJar,
  isExportingZip,
}) => {
  const [selectedFile, setSelectedFile] = useState<ModFileEntry>(MOD_SOURCE_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Dual Export Actions */}
      <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fabric 1.21.1 Production Mod & Source Tree</span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
            Export Anomalous World Generator Mod (.JAR)
          </h2>
          <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
            Exports a complete, compiled <code className="text-emerald-400 font-mono font-semibold">.jar</code> containing real Java 21 JVM bytecode (<code className="text-neutral-200 font-mono">.class</code>), <code className="text-neutral-200 font-mono">fabric.mod.json</code>, mixins, <code className="text-neutral-200 font-mono">icon.png</code>, dimension configs, and sources. Drop directly into <code className="text-neutral-200 font-mono">.minecraft/mods/</code>, or download the Gradle project to build with <code className="text-emerald-400 font-mono">./gradlew build</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onExportJar}
            disabled={isExportingJar}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-60 whitespace-nowrap"
          >
            <Package className="w-4 h-4" />
            <span>{isExportingJar ? 'Packaging .JAR...' : 'Export .JAR File'}</span>
          </button>

          <button
            onClick={onExportZip}
            disabled={isExportingZip}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-medium text-xs rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>{isExportingZip ? 'Packaging...' : 'Export Project .ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Installation Quick Guide Box */}
      <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-2 text-xs">
        <div className="flex items-center gap-2 text-neutral-200 font-semibold uppercase tracking-wider text-[11px]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>How to Install & Play the Exported .JAR</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-neutral-300 text-[11px] pt-1">
          <div className="p-2.5 bg-neutral-900/60 rounded border border-neutral-800/80">
            <span className="font-semibold text-white block mb-0.5">1. Export .JAR</span>
            Click "Export .JAR File" to download <code className="text-emerald-400 font-mono">anomalous-world-generator-1.0.0.jar</code>.
          </div>
          <div className="p-2.5 bg-neutral-900/60 rounded border border-neutral-800/80">
            <span className="font-semibold text-white block mb-0.5">2. Place in Mods Folder</span>
            Drop the file into <code className="text-neutral-200 font-mono">.minecraft/mods/</code> alongside Fabric API for 1.21.1.
          </div>
          <div className="p-2.5 bg-neutral-900/60 rounded border border-neutral-800/80">
            <span className="font-semibold text-white block mb-0.5">3. Launch Minecraft</span>
            Launch Fabric 1.21.1 (Java 21). Create a new singleplayer world and travel beyond 60,000 blocks!
          </div>
        </div>
      </div>

      {/* Two Column Layout: File Tree & Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* File Tree Sidebar */}
        <div className="lg:col-span-4 bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-800">
            <Folder className="w-3.5 h-3.5 text-neutral-400" />
            <span>Project Files ({MOD_SOURCE_FILES.length})</span>
          </div>

          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {MOD_SOURCE_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-neutral-800 text-white font-medium border border-neutral-700/80 shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/60'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span className="truncate font-mono text-[11px]">{file.path}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content View */}
        <div className="lg:col-span-8 bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 flex flex-col">
          {/* File Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-semibold text-white">
                {selectedFile.path}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 rounded text-xs border border-neutral-800 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadSingle}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 rounded text-xs border border-neutral-800 transition-colors"
                title="Download this file individually"
              >
                <Download className="w-3 h-3" />
                <span>Save File</span>
              </button>
            </div>
          </div>

          {/* Syntax Code Box */}
          <div className="mt-3 bg-neutral-950 p-4 rounded-lg border border-neutral-800/80 max-h-[500px] overflow-auto">
            <pre className="font-mono text-xs text-neutral-200 leading-relaxed whitespace-pre font-normal">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
