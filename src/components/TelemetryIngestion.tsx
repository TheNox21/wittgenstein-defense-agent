import React, { useState, useRef } from 'react';
import { Play, Upload, FileText, RefreshCw, Terminal, Copy, Check, Trash2, ArrowUpRight } from 'lucide-react';
import { SAMPLE_TELEMETRY } from '../data/sampleLogs';
import { SampleTelemetry } from '../types';

interface TelemetryIngestionProps {
  telemetry: string;
  onTelemetryChange: (val: string) => void;
  onRunTriage: () => void;
  isAnalyzing: boolean;
  selectedSampleId: string;
  onSelectSample: (sample: SampleTelemetry) => void;
}

export const TelemetryIngestion: React.FC<TelemetryIngestionProps> = ({
  telemetry,
  onTelemetryChange,
  onRunTriage,
  isAnalyzing,
  selectedSampleId,
  onSelectSample
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onTelemetryChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(telemetry);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = telemetry.split('\n');

  return (
    <div className="cyber-card reticle-corner rounded-xl p-4 sm:p-5 shadow-xl space-y-4 font-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wide flex items-center gap-2">
              <span>DEFENSIVE TELEMETRY INGESTION TERMINAL</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-1.5 py-0.2 rounded uppercase">
                Live Sensor Feed
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Raw host, network, and IDS telemetry anchored to Wittgenstein&apos;s Tractatus §7 verification
            </p>
          </div>
        </div>

        {/* Upload and Utility Actions */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept=".log,.txt,.json,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-mono text-slate-300 hover:text-emerald-300 bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded border border-slate-700/80 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Upload any log file (.log, .txt, .json)"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload Stream</span>
          </button>

          {telemetry && (
            <button
              onClick={() => onTelemetryChange('')}
              className="text-xs font-mono text-slate-400 hover:text-red-400 p-1.5 rounded bg-slate-900/50 hover:bg-slate-800 border border-slate-800 transition"
              title="Clear telemetry buffer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Preset Scenarios Matrix */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
            <span>Select Simulated Threat Vectors (Real SOC Labs):</span>
          </span>
          <span className="text-[10px] text-slate-400">5 Canonical Scenarios</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {SAMPLE_TELEMETRY.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className={`text-left p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-950/60 border-slate-800/90 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-bl" />
                )}
                <div className="font-bold text-slate-100 truncate text-[11.5px]">{sample.title}</div>
                <div className="text-[10.5px] text-slate-500 mt-1 truncate flex items-center justify-between">
                  <span>{sample.source}</span>
                  {isSelected && <span className="text-emerald-400 font-bold">ACTIVE</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tactical Raw Log Terminal Viewport */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border transition-all overflow-hidden ${
          dragOver 
            ? 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
            : 'border-slate-800 bg-slate-950/95 shadow-inner'
        }`}
      >
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800/80 bg-slate-900/90 text-xs text-slate-400 select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-slate-600 font-mono text-[10px]">|</span>
            <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1">
              <span className="text-emerald-400">sensor@soc-node:</span>
              <span className="text-slate-400">/var/log/telemetry.stream</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {lines.filter(Boolean).length} Events
            </span>
            <button
              onClick={handleCopy}
              className="text-[11px] text-slate-400 hover:text-emerald-300 transition flex items-center gap-1"
              title="Copy telemetry stream"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 transition font-mono ml-1"
            >
              {isCollapsed ? '[+] Expand' : '[-] Minimize'}
            </button>
          </div>
        </div>

        {/* Terminal Log Body with Gutter */}
        {!isCollapsed && (
          <div className="relative flex text-xs">
            {/* Line Number Gutter */}
            <div className="terminal-gutter py-3 pl-3 pr-2 select-none border-r border-slate-900 bg-slate-950/80 text-slate-600 font-mono text-[11px] leading-relaxed hidden sm:block">
              {lines.map((_, i) => (
                <div key={i}>{String(i + 1).padStart(2, '0')}</div>
              ))}
            </div>

            {/* Editable Log Area */}
            <textarea
              value={telemetry}
              onChange={(e) => onTelemetryChange(e.target.value)}
              rows={Math.min(10, Math.max(5, lines.length))}
              placeholder="Paste raw server logs, network pcap flows, or IDS alerts here..."
              className="w-full bg-transparent text-emerald-300/90 font-mono text-xs p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-y leading-relaxed select-all"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Action Execution Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
            AXIOM §7 STRICT
          </span>
          <span className="text-[11px] text-slate-400 font-sans">
            Assertions are grounded to verbatim log tokens; zero speculative guessing.
          </span>
        </div>

        <button
          onClick={onRunTriage}
          disabled={isAnalyzing || !telemetry.trim()}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-100" />
              <span>DEDUCTIVE VERIFICATION RUNNING...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-emerald-100 fill-emerald-100" />
              <span>EXECUTE DEFENSIVE TRIAGE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
