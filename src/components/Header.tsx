import React from 'react';
import { Shield, Cpu, Terminal, HelpCircle, Activity } from 'lucide-react';

interface HeaderProps {
  engineMode: 'cloud-gemini' | 'local-arm-llama';
  onModeChange: (mode: 'cloud-gemini' | 'local-arm-llama') => void;
  onOpenGuide: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  engineMode,
  onModeChange,
  onOpenGuide,
  isAnalyzing
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md sticky top-0 z-30 relative">
      {/* Top Cyber Accent Laser Hairline */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/10 via-emerald-400/80 to-cyan-500/10 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Tactical Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] relative group">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_6px_#10b981]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight font-mono flex items-center gap-2">
                <span>WITTGENSTEIN</span>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold tracking-wider">
                  DEFENSIVE AI
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span className="text-emerald-400/90">root@soc-node:~#</span>
              <span className="text-slate-300">epistemic-triage --axiom7</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 text-[11px]">Zero-Hallucination SOC</span>
            </p>
          </div>
        </div>

        {/* Right Controls: Engine Toggle & Analyst Guide */}
        <div className="flex items-center gap-2.5">
          {/* Dual Engine Switcher */}
          <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-lg flex items-center text-xs font-mono shadow-inner">
            <button
              onClick={() => onModeChange('cloud-gemini')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-mono ${
                engineMode === 'cloud-gemini'
                  ? 'bg-emerald-600 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.35)] border border-emerald-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Cloud Gemini AI</span>
            </button>
            <button
              onClick={() => onModeChange('local-arm-llama')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-mono ${
                engineMode === 'local-arm-llama'
                  ? 'bg-amber-600 text-white font-bold shadow-[0_0_12px_rgba(245,158,11,0.35)] border border-amber-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Local ARM / Ollama</span>
            </button>
          </div>

          {/* Quick-Start Guide / Help Button */}
          <button
            onClick={onOpenGuide}
            className="text-xs font-mono px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-700/80 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Open Analyst Quick-Start Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Analyst Guide</span>
          </button>
        </div>

      </div>
    </header>
  );
};
