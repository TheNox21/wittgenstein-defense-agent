import React from 'react';
import { Shield, Cpu, Terminal, Award, FileCode, CheckCircle2, HelpCircle } from 'lucide-react';

interface HeaderProps {
  engineMode: 'cloud-gemini' | 'local-arm-llama';
  onModeChange: (mode: 'cloud-gemini' | 'local-arm-llama') => void;
  onOpenAudit: () => void;
  onOpenExport: () => void;
  onOpenGuide: () => void;
  onOpenSubmission: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  engineMode,
  onModeChange,
  onOpenAudit,
  onOpenExport,
  onOpenGuide,
  onOpenSubmission,
  isAnalyzing
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-950">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                WITTGENSTEIN
                <span className="text-xs font-mono font-normal uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Defensive AI Agent
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>Hackers-Arise Defense Edition</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">Inspired by OccupyTheWeb (OTW)</span>
            </p>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Mode Switcher */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg flex items-center text-xs font-mono">
            <button
              onClick={() => onModeChange('cloud-gemini')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                engineMode === 'cloud-gemini'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Cloud Gemini AI</span>
            </button>
            <button
              onClick={() => onModeChange('local-arm-llama')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                engineMode === 'local-arm-llama'
                  ? 'bg-amber-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Local ARM / Ollama</span>
            </button>
          </div>

          {/* Submission Package Button (Prominent) */}
          <button
            onClick={onOpenSubmission}
            className="text-xs font-mono px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-950 cursor-pointer"
            title="Open Submission Package: Executive Summary (PDF < 5 Pages), Gemini Video Prompt, and Git Setup"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Submission Package</span>
            <span className="text-[10px] bg-emerald-900/80 text-emerald-100 px-1.5 py-0.2 rounded font-semibold">PDF &amp; Scripts</span>
          </button>

          {/* Quick-Start Guide / Help Button */}
          <button
            onClick={onOpenGuide}
            className="text-xs font-mono px-3 py-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5 shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* Submission Review & Specification Checklist Button */}
          <button
            onClick={onOpenAudit}
            className="text-xs font-mono px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Checklist</span>
          </button>

          {/* Export Agent CLI */}
          <button
            onClick={onOpenExport}
            className="text-xs font-mono px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">.py CLI</span>
          </button>
        </div>

      </div>
    </header>
  );
};
