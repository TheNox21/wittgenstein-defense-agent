import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TelemetryIngestion } from './components/TelemetryIngestion';
import { TriageOverview } from './components/TriageOverview';
import { WittgensteinTruthMeter } from './components/WittgensteinTruthMeter';
import { MitreTacticsView } from './components/MitreTacticsView';
import { MitreAttackTimeline } from './components/MitreAttackTimeline';
import { SecurityKnowledgeGraph } from './components/SecurityKnowledgeGraph';
import { ThreatHunterModule } from './components/ThreatHunterModule';
import { RemediationApprovalQueue } from './components/RemediationApprovalQueue';
import { ActionAuditTrail } from './components/ActionAuditTrail';
import { QuickStartGuideModal } from './components/QuickStartGuideModal';
import { SAMPLE_TELEMETRY } from './data/sampleLogs';
import { TriageAnalysis, RemediationAction, SampleTelemetry, AuditTrailEntry } from './types';
import {
  Layers,
  Activity,
  CheckCircle2,
  Compass,
  Network,
  Crosshair,
  ShieldAlert,
  History,
  HelpCircle,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export default function App() {
  const [selectedSample, setSelectedSample] = useState<SampleTelemetry>(SAMPLE_TELEMETRY[0]);
  const [telemetry, setTelemetry] = useState<string>(SAMPLE_TELEMETRY[0].rawLog);
  const [engineMode, setEngineMode] = useState<'cloud-gemini' | 'local-arm-llama'>('cloud-gemini');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<TriageAnalysis | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'summary' | 'graph' | 'hunter' | 'remediation'>('all');
  const [isExecutingAction, setIsExecutingAction] = useState<string | null>(null);
  const [isRollingBack, setIsRollingBack] = useState<string | null>(null);

  // Persistent session audit trail
  const [auditEntries, setAuditEntries] = useState<AuditTrailEntry[]>(() => {
    try {
      const saved = localStorage.getItem('wittgenstein_action_audit_trail');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('wittgenstein_action_audit_trail', JSON.stringify(auditEntries));
    } catch (e) {
      console.warn('Failed to persist audit trail to localStorage', e);
    }
  }, [auditEntries]);

  // Initial triage execution on mount
  useEffect(() => {
    executeTriage(SAMPLE_TELEMETRY[0].rawLog, engineMode);
  }, []);

  const executeTriage = async (rawText: string, mode: 'cloud-gemini' | 'local-arm-llama') => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telemetry: rawText, mode })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: TriageAnalysis = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Triage failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: SampleTelemetry) => {
    setSelectedSample(sample);
    setTelemetry(sample.rawLog);
    executeTriage(sample.rawLog, engineMode);
  };

  const handleModeChange = (newMode: 'cloud-gemini' | 'local-arm-llama') => {
    setEngineMode(newMode);
    executeTriage(telemetry, newMode);
  };

  const handleAuthorizeAction = async (action: RemediationAction) => {
    setIsExecutingAction(action.id);
    try {
      const res = await fetch('/api/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: action.id,
          command: action.command,
          rollbackCommand: action.rollbackCommand
        })
      });

      const result = await res.json();
      if (result.success && analysis) {
        const updatedActions = analysis.actions.map((act) =>
          act.id === action.id
            ? {
                ...act,
                status: 'EXECUTED' as const,
                executedAt: result.executedAt,
                executionOutput: result.executionOutput
              }
            : act
        );
        setAnalysis({ ...analysis, actions: updatedActions });

        // Append to persistent session audit trail
        const newEntry: AuditTrailEntry = {
          id: `audit-${Date.now()}`,
          actionId: action.id,
          title: action.title,
          command: action.command,
          rollbackCommand: action.rollbackCommand,
          status: 'EXECUTED',
          timestamp: result.executedAt || new Date().toISOString(),
          operator: 'SecOps Analyst (Human-in-the-Loop)',
          riskLevel: action.riskLevel,
          executionOutput: result.executionOutput
        };
        setAuditEntries((prev) => [newEntry, ...prev]);
      }
    } catch (err) {
      console.error('Failed to execute remediation action:', err);
    } finally {
      setIsExecutingAction(null);
    }
  };

  const handleRejectAction = (actionId: string) => {
    if (!analysis) return;
    const updatedActions = analysis.actions.map((act) =>
      act.id === actionId ? { ...act, status: 'REJECTED' as const } : act
    );
    setAnalysis({ ...analysis, actions: updatedActions });

    const targetAction = analysis.actions.find((a) => a.id === actionId);
    if (targetAction) {
      const newEntry: AuditTrailEntry = {
        id: `audit-${Date.now()}`,
        actionId: targetAction.id,
        title: targetAction.title,
        command: targetAction.command,
        rollbackCommand: targetAction.rollbackCommand,
        status: 'REJECTED',
        timestamp: new Date().toISOString(),
        operator: 'SecOps Analyst (Human-in-the-Loop)',
        riskLevel: targetAction.riskLevel,
        executionOutput: 'Action explicitly denied by human operator. Aborted safely.'
      };
      setAuditEntries((prev) => [newEntry, ...prev]);
    }
  };

  const handleRollbackAction = async (entry: AuditTrailEntry) => {
    setIsRollingBack(entry.id);
    try {
      const res = await fetch('/api/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: `rollback-${entry.actionId}`,
          command: entry.rollbackCommand,
          rollbackCommand: 'Rollback baseline restored.'
        })
      });
      const result = await res.json();
      if (result.success) {
        // Log rollback as an audit trail entry
        const rollbackEntry: AuditTrailEntry = {
          id: `audit-${Date.now()}`,
          actionId: entry.actionId,
          title: `Reversal / Rollback: ${entry.title}`,
          command: entry.rollbackCommand,
          rollbackCommand: 'N/A',
          status: 'ROLLED_BACK',
          timestamp: result.executedAt || new Date().toISOString(),
          operator: 'SecOps Analyst (Manual Rollback)',
          riskLevel: entry.riskLevel,
          executionOutput: `[ROLLBACK COMPLETED]:\n$ ${entry.rollbackCommand}\n[EXIT CODE 0] System state restored.`
        };
        setAuditEntries((prev) => [rollbackEntry, ...prev]);
      }
    } catch (err) {
      console.error('Failed to rollback action:', err);
    } finally {
      setIsRollingBack(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] cyber-grid text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <Header
        engineMode={engineMode}
        onModeChange={handleModeChange}
        onOpenGuide={() => setIsGuideOpen(true)}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Telemetry Input Panel */}
        <TelemetryIngestion
          telemetry={telemetry}
          onTelemetryChange={setTelemetry}
          onRunTriage={() => executeTriage(telemetry, engineMode)}
          isAnalyzing={isAnalyzing}
          selectedSampleId={selectedSample.id}
          onSelectSample={handleSelectSample}
        />

        {/* Triage Results View */}
        {analysis && (
          <div className="space-y-6">
            
            {/* View Mode Navigation Tabs to reduce cognitive overload */}
            <div className="cyber-card rounded-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {[
                  { id: 'all', label: 'All Modules', icon: Layers, count: null },
                  { id: 'summary', label: 'Triage & Truth', icon: Activity, count: `${analysis.epistemicTruthScore}%` },
                  { id: 'graph', label: 'Attack Topology', icon: Network, count: `${analysis.mitreTechniques.length + analysis.iocs.length}` },
                  { id: 'hunter', label: 'Threat Hunter', icon: Crosshair, count: '5' },
                  { id: 'remediation', label: 'Remediation & Audit', icon: ShieldAlert, count: analysis.actions.filter(a => a.status === 'PENDING_APPROVAL').length || null }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600/90 text-white font-semibold shadow-[0_0_12px_rgba(16,185,129,0.3)] border border-emerald-400/50'
                          : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {tab.count !== null && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            isActive
                              ? 'bg-emerald-800 text-emerald-100'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Jump / Guide helper button */}
              <button
                onClick={() => setIsGuideOpen(true)}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/30 transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Analyst Guide</span>
              </button>
            </div>

            {/* Overview Card (Visible in 'all' and 'summary') */}
            {(activeTab === 'all' || activeTab === 'summary') && (
              <TriageOverview analysis={analysis} />
            )}

            {/* Wittgenstein Truth Verification Meter (Visible in 'all' and 'summary') */}
            {(activeTab === 'all' || activeTab === 'summary') && (
              <WittgensteinTruthMeter
                facts={analysis.facts}
                overallScore={analysis.epistemicTruthScore}
              />
            )}

            {/* MITRE ATT&CK & IOC Analysis (Visible in 'all', 'summary', and 'graph') */}
            {(activeTab === 'all' || activeTab === 'summary' || activeTab === 'graph') && (
              <MitreTacticsView
                techniques={analysis.mitreTechniques}
                iocs={analysis.iocs}
              />
            )}

            {/* MITRE ATT&CK Sequence Progression Timeline (Visible in 'all' and 'graph') */}
            {(activeTab === 'all' || activeTab === 'graph') && (
              <MitreAttackTimeline
                techniques={analysis.mitreTechniques}
                facts={analysis.facts}
              />
            )}

            {/* D3.js Visual Knowledge Graph (Visible in 'all' and 'graph') */}
            {(activeTab === 'all' || activeTab === 'graph') && (
              <SecurityKnowledgeGraph
                iocs={analysis.iocs}
                techniques={analysis.mitreTechniques}
                actions={analysis.actions}
                incidentTitle={analysis.incidentTitle}
              />
            )}

            {/* Proactive Threat Hunter Module (Visible in 'all' and 'hunter') */}
            {(activeTab === 'all' || activeTab === 'hunter') && (
              <ThreatHunterModule
                iocs={analysis.iocs}
                techniques={analysis.mitreTechniques}
                actions={analysis.actions}
              />
            )}

            {/* Human-in-the-Loop Remediation Approval Queue (Visible in 'all' and 'remediation') */}
            {(activeTab === 'all' || activeTab === 'remediation') && (
              <RemediationApprovalQueue
                actions={analysis.actions}
                onAuthorizeAction={handleAuthorizeAction}
                onRejectAction={handleRejectAction}
                isExecutingAction={isExecutingAction}
              />
            )}

            {/* Persistent Action Audit Trail (Visible in 'all' and 'remediation') */}
            {(activeTab === 'all' || activeTab === 'remediation') && (
              <ActionAuditTrail
                entries={auditEntries}
                onRollbackAction={handleRollbackAction}
                onClearHistory={() => setAuditEntries([])}
                isRollingBack={isRollingBack}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs font-mono text-slate-500">
        <p>
          Wittgenstein Cyber Defense Agent • Epistemic Zero-Hallucination SOC Platform
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Tractatus Logico-Philosophicus: &ldquo;Whereof one cannot speak, thereof one must be silent.&rdquo;
        </p>
      </footer>

      {/* Analyst Guide Modal */}
      <QuickStartGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab as any);
          setIsGuideOpen(false);
        }}
      />
    </div>
  );
}
