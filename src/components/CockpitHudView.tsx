import React, { useState } from 'react';
import {
  Layers,
  Network,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Check,
  X,
  Play,
  RotateCcw,
  Upload,
  Copy,
  CheckCheck,
  ExternalLink,
  ChevronRight,
  Eye,
  Info
} from 'lucide-react';
import { TriageAnalysis, RemediationAction, SampleTelemetry, FactVerification, MitreTechnique, ExtractedIOC } from '../types';
import { SecurityKnowledgeGraph } from './SecurityKnowledgeGraph';
import { SAMPLE_TELEMETRY } from '../data/sampleLogs';

interface CockpitHudViewProps {
  analysis: TriageAnalysis;
  telemetry: string;
  onTelemetryChange: (val: string) => void;
  onRunTriage: () => void;
  isAnalyzing: boolean;
  selectedSampleId: string;
  onSelectSample: (sample: SampleTelemetry) => void;
  onAuthorizeAction: (action: RemediationAction) => Promise<void>;
  onRejectAction: (actionId: string) => void;
  isExecutingAction: string | null;
}

export const CockpitHudView: React.FC<CockpitHudViewProps> = ({
  analysis,
  telemetry,
  onTelemetryChange,
  onRunTriage,
  isAnalyzing,
  selectedSampleId,
  onSelectSample,
  onAuthorizeAction,
  onRejectAction,
  isExecutingAction
}) => {
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(
    analysis.mitreTechniques[0]?.id || null
  );
  const [selectedActionDetails, setSelectedActionDetails] = useState<RemediationAction | null>(null);
  const [copiedLog, setCopiedLog] = useState(false);
  const [bashLogs, setBashLogs] = useState<string[]>([
    `$ bcsh SER-1234 {\n  Action: ISOLATE HOST (${analysis.actions[0]?.targetComponent || 'HR_WS_09'})\n  Script: ${analysis.actions[0]?.command || 'iptables -A INPUT -j DROP'}\n  Status: PENDING_APPROVAL\n}`,
    `[SECURITY DAEMON] Awaiting operator authorization (Axiom §7 human gate)...`
  ]);

  const handleCopyTelemetry = () => {
    navigator.clipboard.writeText(telemetry);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 1800);
  };

  const handleApproveWithTerminal = async (action: RemediationAction) => {
    setBashLogs((prev) => [
      ...prev,
      `[OPERATOR APPROVED]: Authorizing ${action.id} -> ${action.title}`,
      `$ ${action.command}`,
      `[SANDBOX RUNNER]: Executing in isolated container...`
    ]);

    await onAuthorizeAction(action);

    setBashLogs((prev) => [
      ...prev,
      `[EXIT CODE 0]: Success. Rollback anchor established:`,
      `$ ${action.rollbackCommand}`
    ]);
  };

  const handleDenyWithTerminal = (actionId: string) => {
    onRejectAction(actionId);
    setBashLogs((prev) => [
      ...prev,
      `[OPERATOR REJECTED]: Action ${actionId} cancelled. Production baseline unchanged.`
    ]);
  };

  const lines = telemetry.split('\n');
  const selectedTech = analysis.mitreTechniques.find((t) => t.id === selectedTechniqueId) || analysis.mitreTechniques[0];
  const relatedFact = selectedTech ? analysis.facts.find((f) => f.id === selectedTech.provenByFactId) : null;

  return (
    <div className="space-y-4">
      {/* 3-Column Tactical HUD Cockpit matching the Screenshot 1:1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* =========================================================================
            LEFT COLUMN (col-span-3): Threat Lifecycle Timeline
           ========================================================================= */}
        <div className="lg:col-span-3 cyber-card reticle-corner rounded-xl p-4 flex flex-col h-[740px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 shrink-0">
            <div>
              <h3 className="text-xs font-bold text-slate-100 font-mono tracking-wide flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Threat Lifecycle Timeline</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Interactive progression of the MITRE ATT&CK
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.2 rounded">
              {analysis.mitreTechniques.length} STAGES
            </span>
          </div>

          {/* Interactive Branching Progression Tree View */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 font-mono text-xs">
            {/* Visual Flow diagram */}
            <div className="relative pl-6 space-y-3 py-1">
              {/* Continuous vertical timeline connector line */}
              <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-gradient-to-b from-cyan-500 via-amber-500 to-red-500 opacity-60 shadow-[0_0_6px_rgba(6,182,212,0.5)]" />

              {analysis.mitreTechniques.map((tech, idx) => {
                const isSelected = selectedTechniqueId === tech.id;
                const isLast = idx === analysis.mitreTechniques.length - 1;

                return (
                  <div
                    key={`${tech.id}-${idx}`}
                    onClick={() => setSelectedTechniqueId(tech.id)}
                    className={`relative p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Node marker on the line */}
                    <div
                      className={`absolute -left-[19px] top-3.5 w-3.5 h-3.5 rounded-full border-2 bg-slate-950 flex items-center justify-center transition-transform ${
                        isSelected
                          ? 'border-emerald-400 scale-125 shadow-[0_0_8px_#10b981]'
                          : isLast
                          ? 'border-red-500'
                          : 'border-cyan-400'
                      }`}
                    >
                      <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-emerald-400' : isLast ? 'bg-red-400' : 'bg-cyan-400'}`} />
                    </div>

                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-100 text-xs">
                        {tech.tactic}
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1 py-0.2 rounded font-bold">
                        {tech.id}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 truncate">
                      {tech.name}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 pt-1 border-t border-slate-900">
                      <span>Conf: <strong className="text-slate-300">{tech.confidence}%</strong></span>
                      {isSelected && (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <span>Selected</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Current Threat Arrow */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-400">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Active Adversary Vector</span>
              </div>
            </div>

            {/* Selected Stage Forensic Proof Box */}
            {selectedTech && (
              <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1.5 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Verbatim Log Proof:</span>
                  <a
                    href={`https://attack.mitre.org/techniques/${selectedTech.id.replace('.', '/')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[10px]"
                  >
                    <span>MITRE Ref</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <pre className="p-2 bg-slate-900/90 rounded border border-slate-850 text-emerald-300 text-[10px] select-all whitespace-pre-wrap break-all leading-tight max-h-24 overflow-y-auto">
                  {selectedTech.evidenceSnippet || relatedFact?.evidenceSource || 'Grounded to telemetry event.'}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            CENTER COLUMN (col-span-5): Security Topology Knowledge Graph
           ========================================================================= */}
        <div className="lg:col-span-5 cyber-card reticle-corner rounded-xl p-4 flex flex-col h-[740px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-xs font-bold text-slate-100 font-mono tracking-wide">
                  Security Topology Knowledge Graph
                </h3>
                <p className="text-[10px] text-slate-400 font-sans">
                  Interactive D3.js force-directed topology linking IOCs & affected infrastructure
                </p>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
              {analysis.iocs.length} IOCs • {analysis.mitreTechniques.length} Tactics
            </div>
          </div>

          {/* D3 Graph Viewport Component */}
          <div className="flex-1 w-full min-h-0 relative">
            <SecurityKnowledgeGraph
              iocs={analysis.iocs}
              techniques={analysis.mitreTechniques}
              actions={analysis.actions}
              incidentTitle={analysis.incidentTitle}
            />
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (col-span-4): Telemetry Feed + Approval Queue + Bash Terminal
           ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 1. Live Sensor Telemetry Ingestion Terminal */}
          <div className="cyber-card reticle-corner rounded-xl p-3.5 space-y-2.5 font-mono">
            {/* Window Title Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-slate-600 font-mono text-[10px]">|</span>
                <span className="text-xs font-bold text-slate-100">
                  Live Sensor Telemetry Ingestion
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyTelemetry}
                  className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  title="Copy log buffer"
                >
                  {copiedLog ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLog ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Quick Scenario Preset Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
              <span className="text-slate-500 uppercase shrink-0">Presets:</span>
              {SAMPLE_TELEMETRY.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className={`px-2 py-0.5 rounded transition shrink-0 cursor-pointer ${
                    selectedSampleId === sample.id
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {sample.title.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Terminal Log Box with Line Numbers */}
            <div className="rounded-lg border border-slate-800/90 bg-slate-950 flex text-xs h-36 overflow-hidden">
              {/* Line Gutter */}
              <div className="terminal-gutter py-2 pl-2.5 pr-2 select-none border-r border-slate-900 bg-slate-950/90 text-slate-600 font-mono text-[10px] leading-relaxed hidden sm:block">
                {lines.slice(0, 15).map((_, i) => (
                  <div key={i}>{14560 + i}</div>
                ))}
              </div>

              {/* Editable / Scrollable Log Area */}
              <textarea
                value={telemetry}
                onChange={(e) => onTelemetryChange(e.target.value)}
                className="w-full bg-transparent text-emerald-300/90 font-mono text-[11px] p-2 focus:outline-none resize-none leading-relaxed select-all"
                spellCheck={false}
              />
            </div>

            {/* Ingestion Trigger button */}
            <button
              onClick={onRunTriage}
              disabled={isAnalyzing || !telemetry.trim()}
              className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>DEDUCTIVE VERIFICATION ACTIVE...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>EXECUTE SENSOR TRIAGE</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Human-in-the-Loop Bash Remediation Approval Queue (Screenshot Match) */}
          <div className="cyber-card reticle-corner rounded-xl p-3.5 space-y-2.5 font-mono">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-100">
                  Human-in-the-Loop Bash Remediation Approval Queue
                </h3>
              </div>
              <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                {analysis.actions.filter((a) => a.status === 'PENDING_APPROVAL').length} PENDING
              </span>
            </div>

            {/* Action Cards (Matching Screenshot cards with [APPROVE], [DENY], [VIEW DETAILS]) */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {analysis.actions.map((act) => {
                const isPending = act.status === 'PENDING_APPROVAL';
                const isExecuted = act.status === 'EXECUTED';
                const isRejected = act.status === 'REJECTED';
                const isProcessing = isExecutingAction === act.id;

                return (
                  <div
                    key={act.id}
                    className={`p-2.5 rounded-lg border text-xs transition-all ${
                      isExecuted
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : isRejected
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-slate-400 text-[11px] font-bold">
                        ID: <strong className="text-slate-200">{act.id}</strong>
                      </span>
                      <span
                        className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold ${
                          isExecuted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isRejected
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 font-semibold mb-0.5 truncate">
                      Action: {act.title}
                    </div>

                    <div className="text-[10.5px] text-emerald-400/90 truncate mb-2">
                      Script: <code className="text-slate-300">{act.command}</code>
                    </div>

                    {/* Action Decision Buttons */}
                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-800/80">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleApproveWithTerminal(act)}
                            disabled={isProcessing}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shadow-sm shadow-emerald-950"
                          >
                            <Check className="w-3 h-3" />
                            <span>{isProcessing ? 'Applying...' : 'APPROVE'}</span>
                          </button>

                          <button
                            onClick={() => handleDenyWithTerminal(act.id)}
                            disabled={isProcessing}
                            className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>DENY</span>
                          </button>
                        </>
                      ) : null}

                      <button
                        onClick={() => setSelectedActionDetails(act)}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-[10px] transition cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-emerald-400" />
                        <span>VIEW DETAILS</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Live bash Console Window (Screenshot Match) */}
          <div className="cyber-card reticle-corner rounded-xl p-3 font-mono space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>bash</span>
              </span>
              <span className="text-[10px] text-slate-500">pty/0 • sandboxed</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-[10.5px] leading-relaxed text-emerald-300 space-y-1 h-28 overflow-y-auto select-all">
              {bashLogs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap break-all">
                  {log}
                </div>
              ))}
              <div className="flex items-center gap-1 text-slate-400 pt-1">
                <span className="text-emerald-400">$</span>
                <span className="w-1.5 h-3 bg-emerald-400 animate-pulse inline-block" />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Action Details Modal */}
      {selectedActionDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="cyber-card reticle-corner rounded-xl max-w-lg w-full p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                ACTION DETAILS & REVERSIBLE ROLLBACK
              </span>
              <button
                onClick={() => setSelectedActionDetails(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-500 uppercase text-[10px] block">Title:</span>
                <span className="text-slate-200 font-bold">{selectedActionDetails.title}</span>
              </div>

              <div>
                <span className="text-slate-500 uppercase text-[10px] block">Description:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                  {selectedActionDetails.description}
                </p>
              </div>

              <div>
                <span className="text-emerald-400 uppercase text-[10px] block">Proposed Command:</span>
                <pre className="p-2 bg-slate-950 rounded border border-slate-800 text-emerald-300 select-all overflow-x-auto text-[11px]">
                  $ {selectedActionDetails.command}
                </pre>
              </div>

              <div>
                <span className="text-amber-400 uppercase text-[10px] block">Tested Rollback Command:</span>
                <pre className="p-2 bg-slate-950 rounded border border-slate-800 text-amber-300 select-all overflow-x-auto text-[11px]">
                  $ {selectedActionDetails.rollbackCommand}
                </pre>
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedActionDetails(null)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
