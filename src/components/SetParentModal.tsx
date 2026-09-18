import React, { useState, useEffect } from 'react';
import { X, Link2, Unlink2, Check, Sparkles } from 'lucide-react';
import { Bone } from '../types/rigging';

interface SetParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBone: Bone | null;
  selectedBoneIds: string[];
  allBones: Bone[];
  onConfirmParent: (parentId: string, connected: boolean) => void;
}

export const SetParentModal: React.FC<SetParentModalProps> = ({
  isOpen,
  onClose,
  activeBone,
  selectedBoneIds,
  allBones,
  onConfirmParent,
}) => {
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && activeBone) {
      // Rule 1: If 2 or more bones are selected, auto fill the other bone as parent
      if (selectedBoneIds.length >= 2) {
        const otherSelectedId = selectedBoneIds.find((id) => id !== activeBone.id);
        if (otherSelectedId) {
          setSelectedParentId(otherSelectedId);
          setConnected(true);
          return;
        }
      }

      // Rule 2: If active bone already has a parent, show existing parent
      if (activeBone.parentId) {
        setSelectedParentId(activeBone.parentId);
        setConnected(activeBone.connected);
        return;
      }

      // Rule 3: If only 1 possible candidate exists
      const candidates = allBones.filter((b) => b.id !== activeBone.id);
      if (candidates.length === 1) {
        setSelectedParentId(candidates[0].id);
        setConnected(true);
      } else {
        setSelectedParentId('');
        setConnected(true);
      }
    }
  }, [isOpen, activeBone, selectedBoneIds, allBones]);

  if (!isOpen || !activeBone) return null;

  const parentCandidates = allBones.filter((b) => b.id !== activeBone.id);
  const targetParentBone = allBones.find((b) => b.id === selectedParentId);

  const handleConfirm = () => {
    if (selectedParentId) {
      onConfirmParent(selectedParentId, connected);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#09090b] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-200 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">SET PARENT CONSTRAINT</h2>
              <p className="text-[10px] text-zinc-400 font-mono">Shortcut: Ctrl+P</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Child Bone (Active)</span>
              <span className="font-mono text-sm font-bold text-orange-400">{activeBone.name}</span>
            </div>
            {selectedBoneIds.length >= 2 && (
              <div className="flex items-center space-x-1 text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-md font-semibold">
                <Sparkles className="w-3 h-3 text-orange-400" />
                <span>Auto-Filled Selection</span>
              </div>
            )}
          </div>

          {/* Select Parent Bone */}
          <div>
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Select Target Parent Bone
            </label>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-zinc-100 font-mono text-xs outline-none focus:border-orange-500 transition-colors"
            >
              <option value="">-- Choose Parent Bone --</option>
              {parentCandidates.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {targetParentBone && (
            <p className="text-[11px] text-zinc-400">
              Bone <strong className="text-orange-300 font-mono">{activeBone.name}</strong> will become a child of{' '}
              <strong className="text-amber-300 font-mono">{targetParentBone.name}</strong>.
            </p>
          )}

          {/* Connected vs Keep Offset options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setConnected(true)}
              className={`p-3 rounded-xl border text-left flex flex-col space-y-1 transition-all ${
                connected
                  ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-md font-semibold'
                  : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold text-zinc-100">
                <Link2 className="w-4 h-4 text-emerald-400" />
                <span>Connected Joint</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-normal">
                Snaps child head directly to parent tail. Joint moves continuously!
              </span>
            </button>

            <button
              type="button"
              onClick={() => setConnected(false)}
              className={`p-3 rounded-xl border text-left flex flex-col space-y-1 transition-all ${
                !connected
                  ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-md font-semibold'
                  : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-bold text-zinc-100">
                <Unlink2 className="w-4 h-4 text-amber-400" />
                <span>Keep Offset</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-normal">
                Floating bone! Keeps spatial gap while inheriting parent moves.
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-end space-x-2 bg-black/40">
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-white/10 text-zinc-300 rounded-xl font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedParentId}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 disabled:opacity-40 text-white px-5 py-2 rounded-xl font-bold flex items-center space-x-1.5 shadow-md transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Set Parent</span>
          </button>
        </div>
      </div>
    </div>
  );
};
