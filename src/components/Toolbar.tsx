import React from 'react';
import { 
  Pointer, 
  Plus, 
  Move, 
  RotateCw, 
  Maximize2, 
  Compass, 
  Link2, 
  Unlink2, 
  Scissors, 
  FlipHorizontal, 
  Trash2,
  Copy,
  Info
} from 'lucide-react';
import { ActiveTool } from '../types/rigging';

interface ToolbarProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  onExtrude: () => void;
  onAddSingleBone: () => void;
  onSetParentModal: () => void;
  onClearParent: () => void;
  onSubdivide: () => void;
  onSymmetrize: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  hasSelection: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  onExtrude,
  onAddSingleBone,
  onSetParentModal,
  onClearParent,
  onSubdivide,
  onSymmetrize,
  onDeleteSelected,
  onDuplicateSelected,
  hasSelection,
}) => {
  const toolButtons = [
    {
      id: 'select' as ActiveTool,
      label: 'Select / Transform',
      shortcut: 'Box / Click',
      icon: Pointer,
    },
    {
      id: 'extrude' as ActiveTool,
      label: 'Extrude Chain',
      shortcut: 'E',
      icon: Plus,
      action: onExtrude,
    },
    {
      id: 'single_bone' as ActiveTool,
      label: 'Single Floating Bone',
      shortcut: 'Shift+A',
      icon: Plus,
      action: onAddSingleBone,
      highlight: true,
    },
    {
      id: 'move' as ActiveTool,
      label: 'Grab / Move',
      shortcut: 'G',
      icon: Move,
    },
    {
      id: 'rotate' as ActiveTool,
      label: 'Rotate Bone',
      shortcut: 'R',
      icon: RotateCw,
    },
    {
      id: 'scale' as ActiveTool,
      label: 'Scale Bone Length',
      shortcut: 'S',
      icon: Maximize2,
    },
    {
      id: 'roll' as ActiveTool,
      label: 'Adjust 3D Roll',
      shortcut: 'Ctrl+R',
      icon: Compass,
    },
  ];

  return (
    <aside className="w-14 bg-black/40 border-r border-white/10 backdrop-blur-md flex flex-col items-center py-2 text-zinc-300 z-30 select-none">
      <div className="flex flex-col space-y-1 w-full px-1.5">
        {toolButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = activeTool === btn.id;

          return (
            <button
              key={btn.id}
              onClick={() => {
                onSelectTool(btn.id);
                if (btn.action) btn.action();
              }}
              className={`group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : btn.highlight
                  ? 'bg-white/10 hover:bg-white/20 text-orange-400 hover:text-orange-300 border border-orange-500/30'
                  : 'hover:bg-white/10 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-mono mt-0.5 opacity-80">{btn.shortcut.split('+')[0]}</span>

              {/* Hover Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-black/80 backdrop-blur-xl text-zinc-100 border border-white/10 px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap text-xs z-50 pointer-events-none">
                <span className="font-semibold text-orange-400">{btn.label}</span>
                <span className="text-[10px] text-zinc-400 font-mono">Shortcut: {btn.shortcut}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="my-2 w-8 h-px bg-white/10" />

      {/* Action Operations */}
      <div className="flex flex-col space-y-1 w-full px-1.5">
        {/* Parent with Offset / Connected */}
        <button
          onClick={onSetParentModal}
          disabled={!hasSelection}
          className="group relative flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-emerald-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Link2 className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-0.5">Ctrl+P</span>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-black/80 backdrop-blur-xl text-zinc-100 border border-white/10 px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap text-xs z-50 pointer-events-none">
            <span className="font-semibold text-emerald-300">Set Parent (Connected / Offset)</span>
            <span className="text-[10px] text-zinc-400 font-mono">Shortcut: Ctrl+P</span>
          </div>
        </button>

        {/* Clear Parent */}
        <button
          onClick={onClearParent}
          disabled={!hasSelection}
          className="group relative flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-amber-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Unlink2 className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-0.5">Alt+P</span>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-black/80 backdrop-blur-xl text-zinc-100 border border-white/10 px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap text-xs z-50 pointer-events-none">
            <span className="font-semibold text-amber-300">Clear Parent</span>
            <span className="text-[10px] text-zinc-400 font-mono">Shortcut: Alt+P</span>
          </div>
        </button>

        {/* Subdivide */}
        <button
          onClick={onSubdivide}
          disabled={!hasSelection}
          className="group relative flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-purple-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Scissors className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-0.5">Subdiv</span>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-black/80 backdrop-blur-xl text-zinc-100 border border-white/10 px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap text-xs z-50 pointer-events-none">
            <span className="font-semibold text-purple-300">Subdivide Bone</span>
            <span className="text-[10px] text-zinc-400 font-mono">Splits bone into 2 equal parts</span>
          </div>
        </button>

        {/* Symmetrize */}
        <button
          onClick={onSymmetrize}
          className="group relative flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-blue-400 transition-colors"
        >
          <FlipHorizontal className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-0.5">Symm</span>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-black/80 backdrop-blur-xl text-zinc-100 border border-white/10 px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap text-xs z-50 pointer-events-none">
            <span className="font-semibold text-blue-300">Symmetrize Left to Right</span>
            <span className="text-[10px] text-zinc-400 font-mono">Mirrors .L bones to .R across center</span>
          </div>
        </button>

        {/* Duplicate */}
        <button
          onClick={onDuplicateSelected}
          disabled={!hasSelection}
          className="group relative flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-teal-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Copy className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-0.5">Shift+D</span>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-black/80 backdrop-blur-xl text-zinc-100 border border-white/10 px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap text-xs z-50 pointer-events-none">
            <span className="font-semibold text-teal-300">Duplicate Selected</span>
            <span className="text-[10px] text-zinc-400 font-mono">Shortcut: Shift+D</span>
          </div>
        </button>

        {/* Delete */}
        <button
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          className="group relative flex flex-col items-center justify-center p-2 rounded-xl hover:bg-rose-900/50 text-zinc-400 hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-colors mt-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-[9px] font-mono mt-0.5">X / Del</span>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col bg-black/80 backdrop-blur-xl text-zinc-100 border border-white/10 px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap text-xs z-50 pointer-events-none">
            <span className="font-semibold text-rose-300">Delete Selected Bone(s)</span>
            <span className="text-[10px] text-zinc-400 font-mono">Shortcut: X or Delete</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
