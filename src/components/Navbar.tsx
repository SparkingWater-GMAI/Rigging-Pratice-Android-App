import React from 'react';
import { 
  Bone as BoneIcon, 
  FolderOpen, 
  Download, 
  Sparkles, 
  Keyboard, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Eye, 
  RotateCcw,
  PlusCircle,
  Undo2,
  Redo2,
} from 'lucide-react';
import { ViewportMode } from '../types/rigging';

interface NavbarProps {
  projectName: string;
  onRenameProject: (name: string) => void;
  viewportMode: ViewportMode;
  onChangeViewportMode: (mode: ViewportMode) => void;
  rapidFireActive: boolean;
  onToggleRapidFire: () => void;
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
  onOpenValidation: () => void;
  onNewProject: () => void;
  onOpenImagePicker: () => void;
  boneCount: number;
  validationScore: number;
  onResetSkeleton: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  projectName,
  onRenameProject,
  viewportMode,
  onChangeViewportMode,
  rapidFireActive,
  onToggleRapidFire,
  onOpenExport,
  onOpenShortcuts,
  onOpenValidation,
  onNewProject,
  onOpenImagePicker,
  boneCount,
  validationScore,
  onResetSkeleton,
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = true,
}) => {
  return (
    <header className="h-12 bg-black/40 border-b border-white/10 backdrop-blur-md flex items-center justify-between px-3 text-zinc-200 select-none text-xs font-sans z-40 shadow-lg">
      {/* Left section: App Brand & Project Name */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-600 px-2.5 py-1 rounded-lg text-white font-bold tracking-wider shadow-md">
          <BoneIcon className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide">RIGMASTER 3D</span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Project Name Editable Input */}
        <div className="flex items-center space-x-1.5">
          <input
            type="text"
            value={projectName}
            onChange={(e) => onRenameProject(e.target.value)}
            className="bg-white/5 hover:bg-white/10 focus:bg-black/60 text-zinc-100 font-medium px-2.5 py-1 rounded-lg border border-white/10 focus:border-orange-500 outline-none w-36 transition-colors text-xs"
            title="Click to rename project"
          />
        </div>

        {/* Quick Menu Actions */}
        <div className="flex items-center space-x-1">
          {/* Undo / Redo Buttons */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-300 hover:text-white border border-white/5 hover:border-white/20 rounded-lg transition-colors"
            title="Undo (Ctrl+Z / Cmd+Z)"
          >
            <Undo2 className="w-3.5 h-3.5 text-orange-400" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-300 hover:text-white border border-white/5 hover:border-white/20 rounded-lg transition-colors"
            title="Redo (Ctrl+Y / Cmd+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5 text-orange-400" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          <button
            onClick={onNewProject}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 hover:border-white/20 rounded-lg transition-colors"
            title="New Rigging Project"
          >
            <PlusCircle className="w-3.5 h-3.5 text-orange-400" />
            <span>New</span>
          </button>

          <button
            onClick={onOpenImagePicker}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 hover:border-white/20 rounded-lg transition-colors"
            title="Load Character / Monster Reference Artwork"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Art</span>
          </button>

          <button
            onClick={onResetSkeleton}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-rose-400 border border-white/5 hover:border-white/20 rounded-lg transition-colors"
            title="Clear current skeleton"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Rig</span>
          </button>
        </div>
      </div>

      {/* Center: Viewport Toggle & Rapid Fire Toggle */}
      <div className="flex items-center space-x-3">
        {/* Viewport Modes */}
        <div className="bg-black/40 p-1 rounded-xl border border-white/10 flex items-center space-x-1 backdrop-blur-md">
          <button
            onClick={() => onChangeViewportMode('2d_only')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
              viewportMode === '2d_only'
                ? 'bg-orange-500 text-white shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2D Main</span>
          </button>

          <button
            onClick={() => onChangeViewportMode('split')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
              viewportMode === 'split'
                ? 'bg-orange-500 text-white shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D + 3D Window</span>
          </button>

          <button
            onClick={() => onChangeViewportMode('3d_only')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
              viewportMode === '3d_only'
                ? 'bg-orange-500 text-white shadow-md font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D Full</span>
          </button>
        </div>

        {/* Rapid Fire Practice Mode Toggle */}
        <button
          onClick={onToggleRapidFire}
          className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
            rapidFireActive
              ? 'bg-orange-500/20 border-orange-500/50 text-orange-300 animate-pulse shadow-md'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${rapidFireActive ? 'text-orange-400 fill-orange-400' : 'text-zinc-400'}`} />
          <span>Rapid Fire Exercise</span>
        </button>
      </div>

      {/* Right Section: Bone Stats, Validation Score, Shortcuts & Export */}
      <div className="flex items-center space-x-3">
        {/* Bone Count pill */}
        <div className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-zinc-300 font-mono text-[11px] flex items-center space-x-1.5 backdrop-blur-md">
          <span className="text-zinc-500">Bones:</span>
          <span className="font-bold text-orange-400">{boneCount}</span>
        </div>

        {/* Validation Score pill */}
        <button
          onClick={onOpenValidation}
          className="bg-black/40 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-zinc-300 flex items-center space-x-1.5 transition-colors backdrop-blur-md"
          title="Click to view Skeleton Health Audit"
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${validationScore >= 80 ? 'text-emerald-400' : validationScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`} />
          <span>Health:</span>
          <span className={`font-bold ${validationScore >= 80 ? 'text-emerald-400' : validationScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {validationScore}%
          </span>
        </button>

        {/* Shortcuts Button */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-lg transition-colors border border-white/5 hover:border-white/20 bg-white/5"
          title="Blender Keyboard Shortcuts (E, G, R, S, Ctrl+P, Alt+P...)"
        >
          <Keyboard className="w-4 h-4 text-orange-400" />
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white px-3 py-1 rounded-lg font-semibold transition-all shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export FBX</span>
        </button>
      </div>
    </header>
  );
};
