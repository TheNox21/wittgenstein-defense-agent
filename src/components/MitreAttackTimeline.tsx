import React, { useState } from 'react';
import {
  GitCommit,
  Clock,
  ShieldAlert,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MitreTechnique, FactVerification } from '../types';

interface MitreAttackTimelineProps {
  techniques: MitreTechnique[];
  facts?: FactVerification[];
}

// Canonical MITRE ATT&CK Enterprise Matrix Kill Chain chronological phases
const MITRE_KILL_CHAIN_ORDER: Record<string, { order: number; category: string; color: string; badgeColor: string }> = {
  'Reconnaissance': { order: 1, category: 'Pre-Attack', color: 'border-slate-500', badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
  'Resource Development': { order: 2, category: 'Pre-Attack', color: 'border-slate-500', badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
  'Initial Access': { order: 3, category: 'Infiltration', color: 'border-blue-500', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  'Execution': { order: 4, category: 'Compromise', color: 'border-amber-500', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  'Persistence': { order: 5, category: 'Establishment', color: 'border-amber-500', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  'Privilege Escalation': { order: 6, category: 'Elevation', color: 'border-orange-500', badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  'Defense Evasion': { order: 7, category: 'Stealth', color: 'border-purple-500', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  'Credential Access': { order: 8, category: 'Lateral Prep', color: 'border-yellow-500', badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  'Discovery': { order: 9, category: 'Enumeration', color: 'border-indigo-500', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  'Lateral Movement': { order: 10, category: 'Propagation', color: 'border-cyan-500', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'Collection': { order: 11, category: 'Exfiltration Prep', color: 'border-teal-500', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  'Command and Control': { order: 12, category: 'Control', color: 'border-red-500', badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40' },
  'Exfiltration': { order: 13, category: 'Objective', color: 'border-red-600', badgeColor: 'bg-red-600/20 text-red-300 border-red-600/40' },
  'Impact': { order: 14, category: 'Destruction', color: 'border-rose-600', badgeColor: 'bg-rose-600/20 text-rose-300 border-rose-600/40' },
  'Impact / Defense Evasion': { order: 14, category: 'Destruction', color: 'border-rose-600', badgeColor: 'bg-rose-600/20 text-rose-300 border-rose-600/40' },
};

export const MitreAttackTimeline: React.FC<MitreAttackTimelineProps> = ({
  techniques,
  facts = []
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'KILL_CHAIN' | 'DISCOVERY_ORDER'>('KILL_CHAIN');

  // Match corresponding fact reasoning for each technique
  const getFactForTechnique = (tech: MitreTechnique) => {
    return facts.find((f) => f.id === tech.provenByFactId);
  };

  // Sort techniques based on kill-chain progression or discovery
  const sortedTechniques = [...techniques].sort((a, b) => {
    if (viewMode === 'KILL_CHAIN') {
      const orderA = MITRE_KILL_CHAIN_ORDER[a.tactic]?.order ?? 99;
      const orderB = MITRE_KILL_CHAIN_ORDER[b.tactic]?.order ?? 99;
      return orderA - orderB;
    }
    return 0; // Default discovery sequence in telemetry
  });

  const getTacticMeta = (tactic: string) => {
    return (
      MITRE_KILL_CHAIN_ORDER[tactic] || {
        order: 99,
        category: 'Attack Phase',
        color: 'border-emerald-500',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      }
    );
  };

  if (techniques.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200 font-mono tracking-wide">
            ATTACK PROGRESSION TIMELINE
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-500 p-6 text-center">
          No sequence of MITRE ATT&CK techniques verified in the current telemetry window.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-200 font-mono tracking-wide flex items-center gap-2">
              <span>ATTACK PROGRESSION TIMELINE</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                {techniques.length} Stages
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Chronological sequence of verified MITRE ATT&CK techniques reconstructing adversary lifecycle
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-slate-500 text-[11px] mr-1">Progression:</span>
          <button
            onClick={() => setViewMode('KILL_CHAIN')}
            className={`px-2.5 py-1 rounded transition text-xs ${
              viewMode === 'KILL_CHAIN'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Kill Chain Order
          </button>
          <button
            onClick={() => setViewMode('DISCOVERY_ORDER')}
            className={`px-2.5 py-1 rounded transition text-xs ${
              viewMode === 'DISCOVERY_ORDER'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Raw Log Sequence
          </button>
        </div>
      </div>

      {/* Kill Chain Summary Stepper Bar */}
      <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 overflow-x-auto">
        {sortedTechniques.map((tech, idx) => {
          const meta = getTacticMeta(tech.tactic);
          const itemKey = `${tech.id}-${tech.provenByFactId || ''}-${idx}`;
          return (
            <React.Fragment key={itemKey}>
              <div
                onClick={() => setExpandedId(expandedId === itemKey ? null : itemKey)}
                className={`cursor-pointer shrink-0 px-2.5 py-1.5 rounded-md border text-xs font-mono transition-all flex items-center gap-1.5 ${
                  expandedId === itemKey
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
                title={`Click to view details for ${tech.name}`}
              >
                <span className="text-[10px] text-slate-500 font-bold">{idx + 1}.</span>
                <span className="font-bold text-emerald-400">{tech.id}</span>
                <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{tech.tactic}</span>
              </div>
              {idx < sortedTechniques.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Vertical Timeline Tree */}
      <div className="relative pl-6 sm:pl-8 space-y-6 pt-2">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute top-3 bottom-4 left-3 sm:left-4 w-0.5 bg-gradient-to-b from-emerald-500 via-amber-500 to-red-500 opacity-60" />

        {sortedTechniques.map((tech, index) => {
          const itemKey = `${tech.id}-${tech.provenByFactId || ''}-${index}`;
          const isExpanded = expandedId === itemKey;
          const meta = getTacticMeta(tech.tactic);
          const relatedFact = getFactForTechnique(tech);
          const isLast = index === sortedTechniques.length - 1;

          return (
            <div key={itemKey} className="relative group">
              {/* Timeline Node Icon Indicator */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 bg-slate-950 flex items-center justify-center font-mono text-[10px] font-bold z-10 transition-transform group-hover:scale-110 ${
                  isLast
                    ? 'border-red-500 text-red-400 shadow-sm shadow-red-950'
                    : index === 0
                    ? 'border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-950'
                    : 'border-amber-500 text-amber-400 shadow-sm shadow-amber-950'
                }`}
              >
                {index + 1}
              </div>

              {/* Timeline Event Card */}
              <div
                className={`rounded-xl border transition-all ${
                  isExpanded
                    ? 'bg-slate-950/90 border-slate-700 shadow-md shadow-black/40'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                } p-4`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                      {tech.id}
                    </span>
                    <span className="font-bold text-slate-100 text-sm">{tech.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${meta.badgeColor}`}>
                      {tech.tactic}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    {tech.timestamp && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {tech.timestamp}
                      </span>
                    )}
                    <span className="text-emerald-400 text-[11px] font-semibold">
                      {tech.confidence}% Confidence
                    </span>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : itemKey)}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                      title={isExpanded ? 'Collapse event' : 'Expand event details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Subtitle / Tactic Description */}
                <div className="mt-1.5 text-xs text-slate-400 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span>Stage: <strong className="text-slate-300">{meta.category}</strong></span>
                  <span>•</span>
                  <span>Anchor: <code className="text-emerald-400">{tech.provenByFactId}</code></span>
                </div>

                {/* Evidence Log Snippet (Always visible preview) */}
                {(tech.evidenceSnippet || relatedFact?.evidenceSource) && (
                  <div className="mt-2.5 bg-slate-900/90 border border-slate-800/80 rounded p-2 text-slate-300 font-mono text-[11px] overflow-x-auto">
                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-0.5 flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-emerald-400" />
                      <span>Log Telemetry Evidence:</span>
                    </div>
                    <div className="text-emerald-300/90 select-all whitespace-pre-wrap break-all">
                      {tech.evidenceSnippet || relatedFact?.evidenceSource}
                    </div>
                  </div>
                )}

                {/* Expanded Epistemic & Tactical Deep Dive */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5 font-mono text-xs">
                    {relatedFact && (
                      <>
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-0.5">
                            Epistemic Deductive Proof (§ Wittgenstein):
                          </span>
                          <p className="text-slate-300 font-sans text-xs bg-slate-900/60 border border-slate-800 p-2.5 rounded leading-relaxed">
                            {relatedFact.reasoning}
                          </p>
                        </div>

                        {relatedFact.tractatusAxiom && (
                          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded p-2 text-[11px] text-emerald-300/90 italic">
                            {relatedFact.tractatusAxiom}
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                      <span>Adversary Phase Index: {meta.order} of 14</span>
                      <a
                        href={`https://attack.mitre.org/techniques/${tech.id.replace('.', '/')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-1"
                      >
                        <span>Official MITRE ATT&CK Matrix Reference</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
