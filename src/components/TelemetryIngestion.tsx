import React, { useState, useRef } from 'react';
import { Play, Upload, FileText, AlertTriangle, RefreshCw, Check, Sparkles } from 'lucide-react';
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

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top bar: Scenario selection presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide font-mono">
            DEFENSIVE TELEMETRY INGESTION
          </h2>
        </div>

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
            className="text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1.5 rounded border border-slate-700 transition flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Log File</span>
          </button>
        </div>
      </div>

      {/* Preset Scenarios Tabs */}
      <div>
        <label className="text-xs font-mono text-slate-400 mb-2 block">
          Preset Attack Telemetry (Curated from Hackers-Arise & OTW Real-World Labs):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {SAMPLE_TELEMETRY.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className={`text-left p-2.5 rounded-lg border text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-slate-200 truncate">{sample.title}</div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">{sample.source}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Raw log textarea with dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-lg border transition-colors ${
          dragOver ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-950/70'
        }`}
      >
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/70 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span>Raw Event Stream (syslog, auth.log, Snort/Suricata, auditd)</span>
            <span className="text-[10px] bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
              {telemetry.split('\n').filter(Boolean).length} lines
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 font-mono"
          >
            {isCollapsed ? 'Expand Log Editor' : 'Minimize Editor'}
          </button>
        </div>

        {!isCollapsed && (
          <textarea
            value={telemetry}
            onChange={(e) => onTelemetryChange(e.target.value)}
            rows={5}
            placeholder="Paste raw server logs, network pcap flows, or IDS alerts here..."
            className="w-full bg-transparent text-slate-200 font-mono text-xs p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-y leading-relaxed"
            spellCheck={false}
          />
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Wittgenstein Epistemic Rule: Axiom §7 (Zero-Hallucination) Active</span>
        </div>

        <button
          onClick={onRunTriage}
          disabled={isAnalyzing || !telemetry.trim()}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono text-xs font-semibold tracking-wide transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
              <span>DETERMINISTIC VERIFICATION IN PROGRESS...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-emerald-200" />
              <span>EXECUTE DEFENSIVE TRIAGE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
