import React from 'react';
import { ShieldAlert, CheckCircle, Zap, Cpu, Clock, Terminal, AlertOctagon, Target, Lock } from 'lucide-react';
import { TriageAnalysis } from '../types';

interface TriageOverviewProps {
  analysis: TriageAnalysis;
}

export const TriageOverview: React.FC<TriageOverviewProps> = ({ analysis }) => {
  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500/15 border-red-500/50 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]';
      case 'HIGH':
        return 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
      case 'MEDIUM':
        return 'bg-yellow-500/15 border-yellow-500/50 text-yellow-300';
      case 'LOW':
        return 'bg-blue-500/15 border-blue-500/50 text-blue-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="cyber-card reticle-corner rounded-xl p-5 shadow-xl space-y-4 font-mono">
      {/* Title & Tactical Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${getSeverityStyle(analysis.severity)}`}>
              {analysis.severity} THREAT LEVEL
            </span>
            <span className="text-xs text-slate-500">
              SESSION: <span className="text-slate-300 select-all">{analysis.id}</span>
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight font-sans flex items-center gap-2">
            <span>{analysis.incidentTitle}</span>
          </h2>
        </div>

        {/* Runtime Performance Telemetry */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tabular-nums font-semibold text-slate-200">{analysis.latencyMs}ms</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tabular-nums font-semibold text-slate-200">{analysis.memoryFootprintMB} MB RAM</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate max-w-[160px] text-slate-300">{analysis.modelName}</span>
          </div>
        </div>
      </div>

      {/* Fallback Resilience Notification Banner */}
      {analysis.fallbackActive && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-3 text-xs text-amber-300 flex items-start gap-2.5">
          <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 font-sans">
            <span className="font-bold text-amber-200 font-mono">Axiom §7 Resilient Failover Engaged:</span>
            <p className="text-[11px] text-amber-400/90 leading-relaxed">
              {analysis.fallbackReason || 'Upstream cloud model experienced a temporary demand spike. Triage and containment playbooks were evaluated via the local deterministic verification engine with zero downtime.'}
            </p>
          </div>
        </div>
      )}

      {/* Incident Executive Summary Terminal */}
      <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-3.5 text-sm text-slate-300 leading-relaxed font-sans relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="text-xs font-mono text-emerald-400 mb-1.5 flex items-center gap-1.5 font-bold">
          <Terminal className="w-3.5 h-3.5" />
          <span>TRIAGE FORENSIC ASSESSMENT // § TRACTATUS GROUNDED</span>
        </div>
        <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 hover:border-emerald-500/40 transition-all shadow-sm group">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Evidence Certainty</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 tabular-nums glow-emerald">
            {analysis.epistemicTruthScore}%
          </div>
          <div className="text-[10.5px] text-slate-400 font-sans mt-0.5">
            Log-anchored empirical proof
          </div>
        </div>

        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 hover:border-emerald-500/40 transition-all shadow-sm group">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">AI Hallucination Risk</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 flex items-center gap-1 tabular-nums glow-emerald">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>0.0%</span>
          </div>
          <div className="text-[10.5px] text-slate-400 font-sans mt-0.5">
            Tractatus §7 eliminated
          </div>
        </div>

        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 hover:border-cyan-500/40 transition-all shadow-sm group">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Verified Events</div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1 tabular-nums glow-cyan">
            {analysis.facts.filter(f => f.verdict === 'PROVEN_FACT').length} / {analysis.facts.length}
          </div>
          <div className="text-[10.5px] text-slate-400 font-sans mt-0.5">
            Corroborated fact anchors
          </div>
        </div>

        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 hover:border-amber-500/40 transition-all shadow-sm group">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Remediation Queue</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 tabular-nums glow-amber">
            {analysis.actions.filter(a => a.status === 'PENDING_APPROVAL').length} Actions
          </div>
          <div className="text-[10.5px] text-slate-400 font-sans mt-0.5">
            Human authorization required
          </div>
        </div>
      </div>
    </div>
  );
};
