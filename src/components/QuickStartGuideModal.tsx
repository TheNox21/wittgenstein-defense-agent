import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  BookOpen,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Compass,
  Eye,
  FileText,
  ChevronRight,
  Info
} from 'lucide-react';

interface QuickStartGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: string) => void;
}

export const QuickStartGuideModal: React.FC<QuickStartGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectTab
}) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: '1. Select or Paste Defensive Telemetry',
      badge: 'Step 1: Ingestion',
      icon: FileText,
      description:
        'Choose a preset scenario (SSH brute-force, SUID privilege escalation, web shell reverse connection, C2 beacon, or ransomware staging) or paste your own raw server logs (syslog, auth.log, Snort/Suricata eve.json, auditd).',
      tip: 'The ingestion box supports drag-and-drop of .log, .txt, or .json files.',
      actionTab: 'overview'
    },
    {
      title: '2. Zero-Hallucination Epistemic Verification',
      badge: 'Step 2: Verification',
      icon: BookOpen,
      description:
        'Wittgenstein\'s Axiom §7 dictates that defensive assertions must be mathematically bound to raw log substrings. Every claim receives a verification verdict ("PROVEN FACT" or "INSUFFICIENT EVIDENCE") so analysts never act on AI hallucinations.',
      tip: 'Check the "Certainty Index" and click on individual facts to inspect their empirical log snippet proofs.',
      actionTab: 'truth'
    },
    {
      title: '3. Follow the Attack Progression & Knowledge Topology',
      badge: 'Step 3: Investigation',
      icon: Compass,
      description:
        'Review the vertical MITRE ATT&CK progression timeline to see how the attacker infiltrated, escalated, and established persistence. Then inspect the interactive D3.js Knowledge Graph to see connections between IOCs, compromised assets, and attacker techniques.',
      tip: 'In the graph, drag nodes or click any entity to instantly inspect its threat context and related defensive playbooks.',
      actionTab: 'graph'
    },
    {
      title: '4. Run Proactive Threat Hunting Queries',
      badge: 'Step 4: Threat Hunting',
      icon: ShieldAlert,
      description:
        'Even before lateral movement appears in logs, the Threat Hunter synthesizes ready-to-run queries across Osquery, Splunk/Sigma, Elastic KQL, and live Bash scripts to sweep adjacent nodes and SSH sockets.',
      tip: 'Click "Copy Query" to instantly paste the pre-compiled hunting syntax into your SIEM or terminal.',
      actionTab: 'hunter'
    },
    {
      title: '5. Human-in-the-Loop Remediation & Safe Rollback',
      badge: 'Step 5: Containment',
      icon: CheckCircle2,
      description:
        'No command touches your production hosts automatically. Review proposed containment actions, check risk levels (Low to Critical), and approve or deny with one click. Every command includes an automatic inverse rollback procedure.',
      tip: 'Click "Execute Action" to simulate remediation; your complete action history is preserved in the persistent Audit Trail.',
      actionTab: 'remediation'
    }
  ];

  const current = steps[activeStep];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide flex items-center gap-2">
                <span>ANALYST QUICK-START GUIDE</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-normal">
                  Zero to SOC Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                How to navigate, triage incidents, and safely remediate threats
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator pills */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/30 flex items-center justify-between gap-1 overflow-x-auto">
          {steps.map((s, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition shrink-0 ${
                activeStep === index
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{index + 1}</span>
              <span className="hidden sm:inline">{s.title.split('.')[1]?.trim().split(' ')[0] || s.badge}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {current.badge}
            </span>
            <span className="text-xs font-mono text-slate-500">
              Step {activeStep + 1} of {steps.length}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
              <StepIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-100">{current.title}</h4>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {current.description}
              </p>
            </div>
          </div>

          {/* Pro Tip Callout */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs font-mono space-y-0.5">
              <span className="text-emerald-300 font-semibold uppercase">Analyst Pro-Tip:</span>
              <p className="text-slate-400 font-sans">{current.tip}</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-medium transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-medium transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Got It, Let's Triage!</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
