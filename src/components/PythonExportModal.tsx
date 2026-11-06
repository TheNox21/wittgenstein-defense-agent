import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Terminal } from 'lucide-react';
import { WITTGENSTEIN_PYTHON_CLI_CODE } from '../data/agentTemplate';

interface PythonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonExportModal: React.FC<PythonExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(WITTGENSTEIN_PYTHON_CLI_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([WITTGENSTEIN_PYTHON_CLI_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wittgenstein_agent.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 font-mono max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                STANDALONE OPEN-SOURCE PYTHON AGENT
              </h2>
              <p className="text-xs text-slate-400">
                wittgenstein_agent.py • Ready for GitHub submission & local ARM/GPU execution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick run command instructions */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs shrink-0 space-y-1">
          <div className="text-slate-400 flex items-center gap-1.5 font-semibold">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminal Usage (Linux / macOS / Raspberry Pi ARM):</span>
          </div>
          <div className="bg-slate-900 p-2 rounded text-emerald-300 select-all overflow-x-auto text-[11px]">
            $ chmod +x wittgenstein_agent.py && ./wittgenstein_agent.py --file /var/log/auth.log -i
          </div>
        </div>

        {/* Code Box */}
        <div className="flex-1 min-h-0 bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-y-auto">
          <pre className="text-xs text-slate-300 font-mono whitespace-pre leading-relaxed">
            {WITTGENSTEIN_PYTHON_CLI_CODE}
          </pre>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 shrink-0">
          <span className="text-xs text-slate-500">
            Open-source MIT License • Zero heavy cloud dependencies required
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Script'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm shadow-emerald-950"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .py File</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
