import React from 'react';
import { X, CheckCircle2, AlertTriangle, Info, Sparkles, Activity } from 'lucide-react';
import { RigValidationResult } from '../types/rigging';

interface RigValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  validation: RigValidationResult;
}

export const RigValidationModal: React.FC<RigValidationModalProps> = ({
  isOpen,
  onClose,
  validation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Skeleton Health & Rig Audit</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Summary */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Overall Rig Score</span>
              <div className="flex items-baseline space-x-1">
                <span className={`text-3xl font-extrabold ${validation.score >= 80 ? 'text-emerald-400' : validation.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {validation.score}
                </span>
                <span className="text-slate-500 font-bold">/ 100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-right text-[11px] font-mono">
              <div className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                <span className="text-slate-400 block">Total Bones</span>
                <span className="text-cyan-400 font-bold">{validation.totalBones}</span>
              </div>
              <div className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                <span className="text-slate-400 block">Symmetry</span>
                <span className="text-amber-400 font-bold">{validation.symmetryStatus}</span>
              </div>
            </div>
          </div>

          {/* Issue List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <h3 className="font-semibold text-slate-300 text-xs uppercase tracking-wider">
              Diagnostic Report ({validation.issues.length})
            </h3>

            {validation.issues.length === 0 ? (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Pristine skeleton hierarchy! Root bone exists, parents are connected, no loops.</span>
              </div>
            ) : (
              validation.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-start space-x-2.5 ${
                    issue.type === 'error'
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : issue.type === 'warning'
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-blue-950/30 border-blue-500/40 text-blue-200'
                  }`}
                >
                  {issue.type === 'error' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  ) : issue.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  )}

                  <div className="space-y-0.5">
                    <p className="font-semibold">{issue.message}</p>
                    <p className="text-[11px] opacity-80">{issue.suggestion}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end bg-slate-950">
          <button
            onClick={onClose}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
