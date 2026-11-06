import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Terminal,
  Undo2,
  RotateCcw,
  Filter,
  ArrowUpDown,
  Eye,
  EyeOff,
  SlidersHorizontal
} from 'lucide-react';
import { RemediationAction } from '../types';

interface RemediationApprovalQueueProps {
  actions: RemediationAction[];
  onAuthorizeAction: (action: RemediationAction) => Promise<void>;
  onRejectAction: (actionId: string) => void;
  isExecutingAction: string | null;
}

type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type SortOrder = 'DEFAULT' | 'RISK_DESC' | 'RISK_ASC' | 'STATUS';

const RISK_WEIGHTS: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

export const RemediationApprovalQueue: React.FC<RemediationApprovalQueueProps> = ({
  actions,
  onAuthorizeAction,
  onRejectAction,
  isExecutingAction
}) => {
  const [selectedAuditOutput, setSelectedAuditOutput] = useState<string | null>(null);

  // Filtering by risk level (multi-toggle or single filter)
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  // Hide lower risk toggle
  const [hiddenRisks, setHiddenRisks] = useState<Set<RiskLevel>>(new Set());
  // Sort order
  const [sortOrder, setSortOrder] = useState<SortOrder>('RISK_DESC');

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-purple-400" />
            CRITICAL RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-medium">
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
            MEDIUM RISK
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
            LOW RISK
          </span>
        );
    }
  };

  const toggleHideRisk = (risk: RiskLevel) => {
    setHiddenRisks((prev) => {
      const next = new Set(prev);
      if (next.has(risk)) {
        next.delete(risk);
      } else {
        next.add(risk);
      }
      return next;
    });
  };

  // Process actions through filter & sorting
  const filteredAndSortedActions = useMemo(() => {
    return actions
      .filter((action) => {
        // Filter by tab
        if (selectedRiskFilter !== 'ALL' && action.riskLevel !== selectedRiskFilter) {
          return false;
        }
        // Filter by hidden risk set
        if (hiddenRisks.has(action.riskLevel as RiskLevel)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'RISK_DESC') {
          const weightA = RISK_WEIGHTS[a.riskLevel] || 0;
          const weightB = RISK_WEIGHTS[b.riskLevel] || 0;
          return weightB - weightA;
        }
        if (sortOrder === 'RISK_ASC') {
          const weightA = RISK_WEIGHTS[a.riskLevel] || 0;
          const weightB = RISK_WEIGHTS[b.riskLevel] || 0;
          return weightA - weightB;
        }
        if (sortOrder === 'STATUS') {
          // PENDING_APPROVAL first
          const statusWeight: Record<string, number> = {
            PENDING_APPROVAL: 3,
            EXECUTED: 2,
            REJECTED: 1
          };
          return (statusWeight[b.status] || 0) - (statusWeight[a.status] || 0);
        }
        return 0; // DEFAULT
      });
  }, [actions, selectedRiskFilter, hiddenRisks, sortOrder]);

  // Counts by risk
  const riskCounts = useMemo(() => {
    const counts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const a of actions) {
      if (counts[a.riskLevel] !== undefined) {
        counts[a.riskLevel]++;
      }
    }
    return counts;
  }, [actions]);

  return (
    <div className="cyber-card reticle-corner rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-200 font-mono tracking-wide">
              HUMAN-IN-THE-LOOP DEFENSIVE REMEDIATION QUEUE
            </h3>
            <p className="text-xs text-slate-400">
              Operational Security Protocol: Strict analyst authorization gate required prior to command execution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>Pending Decisions: </span>
            <span className="font-bold text-amber-400">
              {actions.filter((a) => a.status === 'PENDING_APPROVAL').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls Bar */}
      <div className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-3 space-y-3 font-mono text-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Risk Level Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 flex items-center gap-1 mr-1 text-[11px]">
              <Filter className="w-3.5 h-3.5" />
              <span>Risk Filter:</span>
            </span>

            <button
              onClick={() => setSelectedRiskFilter('ALL')}
              className={`px-2.5 py-1 rounded transition text-xs ${
                selectedRiskFilter === 'ALL'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              All ({actions.length})
            </button>

            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((r) => {
              const count = riskCounts[r] || 0;
              const isSelected = selectedRiskFilter === r;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRiskFilter(r)}
                  className={`px-2.5 py-1 rounded transition text-xs flex items-center gap-1 ${
                    isSelected
                      ? r === 'CRITICAL'
                        ? 'bg-purple-600 text-white font-semibold'
                        : r === 'HIGH'
                        ? 'bg-red-600 text-white font-semibold'
                        : r === 'MEDIUM'
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{r}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Right: Sort controls & hide toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] text-slate-500">Sort:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-slate-700 font-mono"
              >
                <option value="RISK_DESC">Risk (High to Low)</option>
                <option value="RISK_ASC">Risk (Low to High)</option>
                <option value="STATUS">Status (Pending First)</option>
                <option value="DEFAULT">Original Order</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Hide / Show Risk Category Toggles */}
        <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <EyeOff className="w-3 h-3 text-slate-500" />
            <span>Hide Risk:</span>
          </span>
          {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((r) => {
            const isHidden = hiddenRisks.has(r);
            return (
              <button
                key={r}
                onClick={() => toggleHideRisk(r)}
                className={`px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                  isHidden
                    ? 'bg-red-950/50 border-red-500/40 text-red-300 line-through'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
                title={isHidden ? `Click to unhide ${r} risk actions` : `Click to hide ${r} risk actions`}
              >
                {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-emerald-400" />}
                <span>{r}</span>
              </button>
            );
          })}
          {hiddenRisks.size > 0 && (
            <button
              onClick={() => setHiddenRisks(new Set())}
              className="text-[10px] text-emerald-400 hover:underline ml-1"
            >
              Unhide All
            </button>
          )}
        </div>
      </div>

      {/* Actions List */}
      {actions.length === 0 ? (
        <div className="text-center p-6 text-slate-500 font-mono text-xs">
          No containment or remediation playbooks required for current state.
        </div>
      ) : filteredAndSortedActions.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-lg font-mono text-xs text-slate-400 space-y-1">
          <p>No actions match the active risk filters.</p>
          <p className="text-[11px] text-slate-500">
            {hiddenRisks.size > 0 ? 'Some actions are currently hidden by risk-level toggles.' : 'Try selecting "All" above.'}
          </p>
          {hiddenRisks.size > 0 && (
            <button
              onClick={() => {
                setHiddenRisks(new Set());
                setSelectedRiskFilter('ALL');
              }}
              className="mt-2 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs inline-block"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedActions.map((action) => {
            const isPending = action.status === 'PENDING_APPROVAL';
            const isExecuted = action.status === 'EXECUTED';
            const isRejected = action.status === 'REJECTED';
            const isProcessing = isExecutingAction === action.id;

            return (
              <div
                key={action.id}
                className={`rounded-lg border p-4 transition-all ${
                  isExecuted
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : isRejected
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                {/* Title & Risk Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200 font-mono">
                      {action.title}
                    </span>
                    {getRiskBadge(action.riskLevel)}
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isExecuted && (
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        EXECUTED & ANCHORED
                      </span>
                    )}
                    {isRejected && (
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" />
                        REJECTED BY OPERATOR
                      </span>
                    )}
                    {isPending && (
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        AWAITING AUTHORIZATION
                      </span>
                    )}
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-xs text-slate-400 mb-3 font-sans leading-relaxed">
                  {action.description}
                </p>

                {/* Command Shell Display */}
                <div className="space-y-2 mb-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-emerald-400 font-semibold block mb-0.5">
                      Proposed Containment Command (Atomic Bash):
                    </span>
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded text-emerald-300 select-all overflow-x-auto">
                      $ {action.command}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-amber-400 font-semibold block mb-0.5 flex items-center gap-1">
                      <Undo2 className="w-3 h-3" />
                      Reversible Rollback Procedure:
                    </span>
                    <div className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-400 select-all overflow-x-auto text-[11px]">
                      $ {action.rollbackCommand}
                    </div>
                  </div>
                </div>

                {/* Operator Decision Bar */}
                {isPending && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => onRejectAction(action.id)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5 text-red-400" />
                      <span>Reject Command</span>
                    </button>

                    <button
                      onClick={() => onAuthorizeAction(action)}
                      disabled={isProcessing}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-sm shadow-emerald-950"
                    >
                      {isProcessing ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                          <span>Applying Isolation...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Authorize & Execute Sandbox</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Audit log button if executed */}
                {isExecuted && action.executionOutput && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      Applied at: {action.executedAt ? new Date(action.executedAt).toLocaleTimeString() : 'Just now'}
                    </span>
                    <button
                      onClick={() => setSelectedAuditOutput(action.executionOutput || null)}
                      className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline"
                    >
                      View Sandbox Audit Trail
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sandbox Audit Modal */}
      {selectedAuditOutput && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                SANDBOX AUDIT LOG
              </span>
              <button
                onClick={() => setSelectedAuditOutput(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-300 whitespace-pre-wrap">
              {selectedAuditOutput}
            </pre>
            <div className="text-right">
              <button
                onClick={() => setSelectedAuditOutput(null)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
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
