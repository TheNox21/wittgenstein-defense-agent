import React, { useState, useMemo } from 'react';
import {
  Compass,
  Search,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  AlertTriangle,
  Layers,
  Filter,
  ArrowRight,
  ShieldCheck,
  Crosshair,
  Sparkles
} from 'lucide-react';
import { ExtractedIOC, MitreTechnique, RemediationAction, LateralHuntQuery } from '../types';
import { generateProactiveLateralHuntQueries } from '../utils/threatHunterEngine';

interface ThreatHunterModuleProps {
  iocs: ExtractedIOC[];
  techniques: MitreTechnique[];
  actions: RemediationAction[];
}

export const ThreatHunterModule: React.FC<ThreatHunterModuleProps> = ({
  iocs,
  techniques,
  actions
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null);

  // Generate dynamic proactive hunt hypotheses
  const huntQueries = useMemo(() => {
    return generateProactiveLateralHuntQueries(iocs, techniques, actions);
  }, [iocs, techniques, actions]);

  const filteredQueries = useMemo(() => {
    if (selectedFormat === 'ALL') return huntQueries;
    return huntQueries.filter((q) => q.queryType === selectedFormat);
  }, [huntQueries, selectedFormat]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFormatBadge = (type: string) => {
    switch (type) {
      case 'OSQUERY':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
            OSQUERY SQL
          </span>
        );
      case 'SIGMA_SPLUNK':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
            SPLUNK / SIGMA
          </span>
        );
      case 'ELASTIC_KQL':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
            ELASTIC KQL
          </span>
        );
      case 'BASH_FORENSIC':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
            BASH LIVE SCRIPT
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-200 font-mono tracking-wide flex items-center gap-2">
              <span>PROACTIVE THREAT HUNTER • LATERAL MOVEMENT PREDICTOR</span>
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                {huntQueries.length} Hunt Packages
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Epistemic extrapolation: Synthesizes unobserved lateral movement vectors based on compromised credentials and host telemetry
            </p>
          </div>
        </div>

        {/* Format Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Query Engine:
          </span>
          {[
            { id: 'ALL', label: 'All Engines' },
            { id: 'OSQUERY', label: 'Osquery' },
            { id: 'SIGMA_SPLUNK', label: 'Splunk' },
            { id: 'ELASTIC_KQL', label: 'Elastic' },
            { id: 'BASH_FORENSIC', label: 'Bash' }
          ].map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              className={`px-2.5 py-1 rounded transition text-xs ${
                selectedFormat === fmt.id
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Proactive Hunter Banner */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex items-start gap-3 text-xs font-mono">
        <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-slate-200 font-semibold">
            Why Hunt Beyond Current Logs?
          </span>
          <p className="text-slate-400 font-sans text-xs leading-relaxed">
            While current log telemetry documents the initial breach, sophisticated threat actors immediately pivot through internal shares, SSH agent forwarding sockets, and reverse proxy tunnels. These pre-compiled hunting queries allow analysts to immediately sweep enterprise endpoints before lateral movement turns into widespread domain compromise.
          </p>
        </div>
      </div>

      {/* List of Proactive Hunting Hypotheses & Queries */}
      <div className="space-y-3">
        {filteredQueries.map((item, idx) => {
          const isCopied = copiedId === item.id;
          const isExpanded = activeQueryId === item.id;

          return (
            <div
              key={item.id}
              className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 transition hover:border-slate-700 space-y-3"
            >
              {/* Row Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="text-[10px] text-slate-500 font-bold">#{idx + 1}</span>
                  <span className="font-bold text-slate-100 text-sm">{item.techniqueName}</span>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    {item.techniqueId}
                  </span>
                  {getFormatBadge(item.queryType)}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                      item.riskTier === 'CRITICAL'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}
                  >
                    {item.riskTier} PIVOT RISK
                  </span>

                  <a
                    href={item.mitreRef}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-emerald-400 p-1"
                    title="View MITRE Technique reference"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Threat Hypothesis Description */}
              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Threat Hypothesis & Target Artifacts:</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                  {item.threatHypothesis}
                </p>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  <span className="text-slate-500">Forensic Targets: </span>
                  <code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px]">
                    {item.targetArtifact}
                  </code>
                </div>
              </div>

              {/* Ready-to-Run Query Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-emerald-400" />
                    <span>Live Telemetry Search Syntax:</span>
                  </span>

                  <button
                    onClick={() => handleCopy(item.id, item.query)}
                    className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Query</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-emerald-300 font-mono text-xs select-all overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                  {item.query}
                </pre>
              </div>

              {/* Rationale note */}
              <div className="text-[11px] font-mono text-slate-400 flex items-start gap-1.5 pt-1 border-t border-slate-900">
                <span className="text-slate-500 uppercase shrink-0">Hunt Objective:</span>
                <span className="font-sans text-slate-400 text-xs">{item.rationale}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
