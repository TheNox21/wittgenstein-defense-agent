import React, { useState } from 'react';
import { BookOpen, Check, AlertCircle, HelpCircle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { FactVerification } from '../types';

interface WittgensteinTruthMeterProps {
  facts: FactVerification[];
  overallScore: number;
}

export const WittgensteinTruthMeter: React.FC<WittgensteinTruthMeterProps> = ({
  facts,
  overallScore
}) => {
  const [expandedFactId, setExpandedFactId] = useState<string | null>(facts[0]?.id || null);

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'PROVEN_FACT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Check className="w-3 h-3" />
            PROVEN FACT
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertCircle className="w-3 h-3" />
            INSUFFICIENT EVIDENCE (AXIOM §7)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
            <HelpCircle className="w-3 h-3" />
            {verdict}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header with Epistemic Score Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-200 font-mono tracking-wide">
              ZERO-HALLUCINATION TRUTH ENGINE
            </h3>
            <p className="text-xs text-slate-400">
              Every defensive finding must have a corresponding log timestamp and verbatim string proof
            </p>
          </div>
        </div>

        {/* Controls: expand all / collapse all + progress bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setExpandedFactId(expandedFactId ? null : facts[0]?.id || null)}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 transition"
          >
            {expandedFactId ? 'Collapse Details' : 'Expand Details'}
          </button>

          {/* Progress bar visual */}
          <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xs">
            <span className="text-slate-400">Certainty Index:</span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${overallScore}%` }}
              />
            </div>
            <span className="font-bold text-emerald-400">{overallScore}%</span>
          </div>
        </div>
      </div>

      {/* Philosophical banner */}
      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3 text-xs font-mono text-emerald-300 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-emerald-200">Axiom §7 Enforced:</span> &ldquo;Whereof one cannot speak, thereof one must be silent.&rdquo;
          <p className="text-[11px] text-emerald-400/80 mt-0.5">
            The agent explicitly rejects probabilistic speculation. Every assertion is anchored to verbatim tokens from the empirical log stream.
          </p>
        </div>
      </div>

      {/* Fact Cards */}
      <div className="space-y-2.5">
        {facts.map((fact) => {
          const isExpanded = expandedFactId === fact.id;
          return (
            <div
              key={fact.id}
              className={`rounded-lg border transition-colors ${
                isExpanded
                  ? 'bg-slate-950/80 border-slate-700 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              {/* Fact header row */}
              <button
                onClick={() => setExpandedFactId(isExpanded ? null : fact.id)}
                className="w-full text-left p-3 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getVerdictBadge(fact.verdict)}
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      Certainty: {fact.epistemicCertainty}%
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-200 mt-1">
                    {fact.claim}
                  </div>
                </div>

                <div className="text-slate-400 hover:text-slate-200 p-1">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Collapsible detail panel */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 space-y-2.5 text-xs font-mono">
                  {/* Verbatim Source Evidence */}
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase block mb-1">
                      Empirical Evidence Source (Verbatim Log Extract):
                    </span>
                    <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 text-emerald-300 overflow-x-auto text-[11px] whitespace-pre-wrap">
                      {fact.evidenceSource}
                    </pre>
                  </div>

                  {/* Tractatus Axiom */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded p-2.5 text-slate-300">
                    <span className="text-[10px] text-amber-400 uppercase font-semibold block mb-0.5">
                      Tractatus Axiomatic Binding:
                    </span>
                    <span className="text-slate-200">{fact.tractatusAxiom}</span>
                  </div>

                  {/* Logical justification */}
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    <span className="text-slate-300 font-semibold">Reasoning: </span>
                    {fact.reasoning}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
