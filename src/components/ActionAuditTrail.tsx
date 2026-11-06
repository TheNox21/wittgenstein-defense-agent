import React, { useState } from 'react';
import { History, ShieldCheck, Check, X, Undo2, Filter, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { AuditTrailEntry } from '../types';

interface ActionAuditTrailProps {
  entries: AuditTrailEntry[];
  onRollbackAction?: (entry: AuditTrailEntry) => Promise<void>;
  onClearHistory: () => void;
  isRollingBack?: string | null;
}

export const ActionAuditTrail: React.FC<ActionAuditTrailProps> = ({
  entries,
  onRollbackAction,
  onClearHistory,
  isRollingBack
}) => {
  const [filter, setFilter] = useState<'ALL' | 'EXECUTED' | 'REJECTED' | 'ROLLED_BACK'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEntries = entries.filter((entry) => {
    if (filter === 'ALL') return true;
    return entry.status === filter;
  });

  const getStatusBadge = (status: AuditTrailEntry['status']) => {
    switch (status) {
      case 'EXECUTED':
      case 'AUTHORIZED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Check className="w-3 h-3" />
            EXECUTED & ANCHORED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400">
            <X className="w-3 h-3" />
            REJECTED BY OPERATOR
          </span>
        );
      case 'ROLLED_BACK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Undo2 className="w-3 h-3" />
            ROLLED BACK
          </span>
        );
      default:
        return null;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">CRIT</span>;
      case 'HIGH':
        return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">MED</span>;
      default:
        return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">LOW</span>;
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wittgenstein_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-200 font-mono tracking-wide flex items-center gap-2">
              <span>ACTION AUDIT TRAIL</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                {entries.length} Events
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Persistent session log recording every manual and authorized remediation decision with timestamps and rollback anchors
            </p>
          </div>
        </div>

        {/* Filter and Export buttons */}
        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <>
              <button
                onClick={handleExportJSON}
                className="text-xs font-mono px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5"
                title="Export audit trail as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Log</span>
              </button>

              <button
                onClick={onClearHistory}
                className="text-xs font-mono px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 hover:text-red-300 hover:border-red-500/40 text-slate-400 border border-slate-700 transition flex items-center gap-1.5"
                title="Clear audit trail"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-slate-500 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </span>
        {(['ALL', 'EXECUTED', 'REJECTED', 'ROLLED_BACK'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-2.5 py-1 rounded transition ${
              filter === tab
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {tab === 'ALL' ? 'All Records' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {entries.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-lg">
          <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-mono text-slate-400">
            No remediation actions logged yet in this session.
          </p>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Authorize or reject any remediation proposal from the queue above to record immutable audit entries.
          </p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="p-6 text-center text-slate-500 font-mono text-xs">
          No records found matching the &quot;{filter}&quot; filter.
        </div>
      ) : (
        /* Audit Records List */
        <div className="space-y-2.5">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div
                key={entry.id}
                className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2 font-mono text-xs transition-colors hover:border-slate-700"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(entry.status)}
                    {getRiskBadge(entry.riskLevel)}
                    <span className="font-semibold text-slate-200">{entry.title}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                    <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <span>•</span>
                    <span className="text-slate-400">{entry.operator}</span>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Primary Command Snippet */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded p-2 text-emerald-300 font-mono text-[11px] flex items-center justify-between gap-2 overflow-x-auto">
                  <span className="select-all truncate">$ {entry.command}</span>
                  {entry.status === 'EXECUTED' && onRollbackAction && (
                    <button
                      onClick={() => onRollbackAction(entry)}
                      disabled={isRollingBack === entry.id}
                      className="shrink-0 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold transition flex items-center gap-1"
                      title="Trigger reverse rollback command"
                    >
                      <Undo2 className="w-3 h-3" />
                      <span>{isRollingBack === entry.id ? 'Rolling back...' : 'Rollback'}</span>
                    </button>
                  )}
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500 uppercase block mb-0.5">Rollback Command:</span>
                      <div className="bg-slate-900 border border-slate-800 p-1.5 rounded text-amber-300/80 select-all">
                        $ {entry.rollbackCommand}
                      </div>
                    </div>

                    {entry.executionOutput && (
                      <div>
                        <span className="text-slate-500 uppercase block mb-0.5">Sandbox Execution Log:</span>
                        <pre className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-300 whitespace-pre-wrap">
                          {entry.executionOutput}
                        </pre>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Audit ID: <code className="text-slate-400">{entry.id}</code></span>
                      <span>Target Action: <code className="text-slate-400">{entry.actionId}</code></span>
                      <span>ISO Timestamp: {entry.timestamp}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
