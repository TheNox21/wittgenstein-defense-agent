import React from 'react';
import { Shield, Cpu, Terminal, HelpCircle, Activity } from 'lucide-react';

interface HeaderProps {
  engineMode: 'cloud-gemini' | 'local-arm-llama';
  onModeChange: (mode: 'cloud-gemini' | 'local-arm-llama') => void;
  onOpenGuide: () => void;
  isAnalyzing: boolean;
  truthScore?: number;
}

export const Header: React.FC<HeaderProps> = ({
  engineMode,
  onModeChange,
  onOpenGuide,
  isAnalyzing,
  truthScore = 100
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md sticky top-0 z-30 relative select-none">
      {/* Top Cyber Accent Laser Hairline */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/10 via-emerald-400/80 to-cyan-500/10 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Tactical Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] relative group">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_6px_#10b981]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight font-mono flex items-center gap-2">
                <span>Wittgenstein</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold tracking-wider">
                  Cyber Defense Agent
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span className="text-emerald-400/80">root@soc-node:~#</span>
              <span className="text-slate-300">epistemic-triage --axiom7</span>
            </p>
          </div>
        </div>

        {/* Center-Left: Engine Status Pill */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-mono text-xs text-slate-300 shadow-sm">
          <span className="text-emerald-400 font-semibold">engine_status:</span>
          <span className="text-slate-200">epistemic-triage --axiom7</span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-500/50 px-1.5 py-0.2 rounded shadow-[0_0_6px_rgba(16,185,129,0.3)]">
            [ACTIVE]
          </span>
        </div>

        {/* Center-Right: Zero-Hallucination Certainty Truth Index (HUD Battery Meter) */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800/90 px-3 py-1 rounded-lg font-mono text-xs">
          {/* Vertical Battery Indicator */}
          <div className="flex flex-col justify-between h-7 w-3 border border-emerald-500/50 p-0.5 rounded-xs bg-slate-900 shadow-[0_0_6px_rgba(16,185,129,0.2)]">
            <div className="h-1 bg-emerald-400 rounded-xs shadow-[0_0_3px_#10b981]" />
            <div className="h-1 bg-emerald-400 rounded-xs shadow-[0_0_3px_#10b981]" />
            <div className="h-1 bg-emerald-400 rounded-xs shadow-[0_0_3px_#10b981]" />
            <div className="h-1 bg-emerald-400 rounded-xs shadow-[0_0_3px_#10b981]" />
          </div>
          <div className="text-left">
            <div className="text-[10px] text-slate-400 leading-tight">Zero-Hallucination Certainty Truth Index</div>
            <div className="text-xs font-bold text-emerald-400 glow-emerald flex items-center gap-1.5">
              <span>TRUTH INDEX: {truthScore}%</span>
              <span className="text-[10px] text-emerald-300 font-semibold">[VERIFIED]</span>
            </div>
          </div>
        </div>

        {/* Right Controls: Engine Toggle, Notifications, Help & Analyst Profile */}
        <div className="flex items-center gap-2">
          {/* Dual Engine Switcher */}
          <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-lg flex items-center text-xs font-mono shadow-inner">
            <button
              onClick={() => onModeChange('cloud-gemini')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-mono text-xs cursor-pointer ${
                engineMode === 'cloud-gemini'
                  ? 'bg-emerald-600 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.35)] border border-emerald-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Google Gemini Cloud Engine"
            >
              <Cpu className="w-3 h-3" />
              <span className="hidden sm:inline">Gemini Cloud</span>
            </button>
            <button
              onClick={() => onModeChange('local-arm-llama')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 font-mono text-xs cursor-pointer ${
                engineMode === 'local-arm-llama'
                  ? 'bg-amber-600 text-white font-bold shadow-[0_0_12px_rgba(245,158,11,0.35)] border border-amber-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Local ARM / Ollama Engine"
            >
              <Terminal className="w-3 h-3" />
              <span className="hidden sm:inline">ARM Local</span>
            </button>
          </div>

          {/* Quick-Start Guide / Help Button */}
          <button
            onClick={onOpenGuide}
            className="text-xs font-mono p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-700/80 transition flex items-center justify-center cursor-pointer"
            title="Open Analyst Quick-Start Guide"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Analyst Profile Chip (Matching Screenshot: A. CHEN Analyst) */}
          <div className="hidden md:flex items-center gap-2 font-mono text-xs text-slate-300 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
            <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-[10px] font-bold">
              AC
            </div>
            <span className="text-[11px] text-slate-300">A. CHEN (Analyst)</span>
          </div>
        </div>

      </div>
    </header>
  );
};
