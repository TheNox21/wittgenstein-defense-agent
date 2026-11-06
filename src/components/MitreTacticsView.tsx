import React, { useState, useMemo } from 'react';
import { Crosshair, Network, Check, ExternalLink, Search, Copy, CheckCheck } from 'lucide-react';
import { MitreTechnique, ExtractedIOC } from '../types';

interface MitreTacticsViewProps {
  techniques: MitreTechnique[];
  iocs: ExtractedIOC[];
}

export const MitreTacticsView: React.FC<MitreTacticsViewProps> = ({ techniques, iocs }) => {
  const [iocSearch, setIocSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedValue(val);
    setTimeout(() => setCopiedValue(null), 1800);
  };

  const filteredIocs = useMemo(() => {
    return iocs.filter((ioc) => {
      const matchesSearch =
        ioc.value.toLowerCase().includes(iocSearch.toLowerCase()) ||
        ioc.threatContext.toLowerCase().includes(iocSearch.toLowerCase());
      const matchesType = selectedType === 'ALL' || ioc.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [iocs, iocSearch, selectedType]);

  const iocTypes = useMemo(() => {
    const types = new Set(iocs.map((i) => i.type));
    return ['ALL', ...Array.from(types)];
  }, [iocs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      
      {/* MITRE ATT&CK Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200 font-mono tracking-wide">
              MITRE ATT&CK MAPPINGS
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            {techniques.length} Verified
          </span>
        </div>

        {techniques.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 p-4 text-center">
            No specific MITRE techniques proven in the current dataset.
          </div>
        ) : (
          <div className="space-y-2">
            {techniques.map((tech, idx) => (
              <div
                key={`${tech.id}-${tech.provenByFactId || ''}-${idx}`}
                className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                      {tech.id}
                    </span>
                    <span className="font-semibold text-slate-200">{tech.name}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1 font-sans">
                    <span className="font-mono text-slate-400 font-semibold">{tech.tactic}</span> • Bound to Fact #{tech.provenByFactId}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {tech.confidence}% Confidence
                  </span>
                  <a
                    href={`https://attack.mitre.org/techniques/${tech.id.replace('.', '/')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-emerald-400 p-1"
                    title="View official MITRE ATT&CK technique reference"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extracted IOCs Panel with Instant Search & Copy */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200 font-mono tracking-wide">
              EVIDENCE ARTIFACTS (IOCs)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredIocs.length} of {iocs.length} shown
          </span>
        </div>

        {/* Search & Type Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={iocSearch}
              onChange={(e) => setIocSearch(e.target.value)}
              placeholder="Filter IPs, users, paths, processes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {iocTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`text-[10px] font-mono px-2 py-1 rounded transition uppercase ${
                  selectedType === type
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {filteredIocs.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 p-4 text-center">
            No matching indicators of compromise found.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredIocs.map((ioc, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2 font-mono text-xs hover:border-slate-700 transition"
              >
                <div className="truncate flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {ioc.type}
                    </span>
                    <span className="text-slate-100 font-medium select-all truncate">{ioc.value}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
                    {ioc.threatContext}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(ioc.value)}
                    className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                    title="Copy IOC to clipboard"
                  >
                    {copiedValue === ioc.value ? (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {ioc.verifiedInLog && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      In Log
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
