import React from 'react';
import { 
  Sliders, 
  Link, 
  Unlink, 
  Compass, 
  Ruler, 
  Palette, 
  CheckSquare, 
  Square,
  Bone as BoneIcon
} from 'lucide-react';
import { Bone } from '../types/rigging';

interface BoneInspectorProps {
  activeBone: Bone | null;
  allBones: Bone[];
  onUpdateBone: (id: string, updates: Partial<Bone>) => void;
}

export const BoneInspector: React.FC<BoneInspectorProps> = ({
  activeBone,
  allBones,
  onUpdateBone,
}) => {
  if (!activeBone) {
    return (
      <div className="w-64 bg-black/40 border-l border-t border-white/10 p-4 text-zinc-500 text-xs flex flex-col items-center justify-center text-center space-y-2 select-none h-64 backdrop-blur-md">
        <Sliders className="w-8 h-8 opacity-30 text-orange-400" />
        <p className="font-medium text-zinc-400">No Bone Selected</p>
        <p className="text-[11px]">Click a bone on the 2D canvas or Outliner to edit its 3D properties.</p>
      </div>
    );
  }

  const length = Math.hypot(
    activeBone.tail.x - activeBone.head.x,
    activeBone.tail.y - activeBone.head.y,
    activeBone.tail.z - activeBone.head.z
  );

  const dx = activeBone.tail.x - activeBone.head.x;
  const dy = activeBone.tail.y - activeBone.head.y;
  const dz = activeBone.tail.z - activeBone.head.z;
  const len2d = Math.hypot(dx, dy);
  const len3d = length || 50;
  const currentPitchDeg = Math.round((Math.atan2(dz, len2d) * 180) / Math.PI);

  const handlePitchChange = (targetPitchDeg: number) => {
    const pitchRad = (targetPitchDeg * Math.PI) / 180;
    const targetLen2d = len3d * Math.cos(pitchRad);
    const targetDz = len3d * Math.sin(pitchRad);

    const angle2d = len2d > 0.1 ? Math.atan2(dy, dx) : 0;
    const newDx = targetLen2d * Math.cos(angle2d);
    const newDy = targetLen2d * Math.sin(angle2d);

    onUpdateBone(activeBone.id, {
      tail: {
        x: activeBone.head.x + newDx,
        y: activeBone.head.y + newDy,
        z: activeBone.head.z + targetDz,
      },
    });
  };

  const parentCandidates = allBones.filter(b => b.id !== activeBone.id);

  const predefinedColors = [
    { label: 'Cyan / Default', value: '#38bdf8' },
    { label: 'Amber / Spine', value: '#f59e0b' },
    { label: 'Blue / Left Limb', value: '#3b82f6' },
    { label: 'Emerald / Right Limb', value: '#10b981' },
    { label: 'Rose / IK Target', value: '#f43f5e' },
    { label: 'Purple / Floating', value: '#a855f7' },
  ];

  return (
    <div className="w-64 bg-black/40 border-l border-t border-white/10 backdrop-blur-md flex flex-col text-zinc-200 select-none text-xs h-80 overflow-y-auto">
      {/* Header */}
      <div className="p-2.5 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center space-x-1.5 font-semibold text-zinc-300">
          <Sliders className="w-3.5 h-3.5 text-orange-400" />
          <span>Bone Properties</span>
        </div>
        <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 truncate max-w-[100px]">
          {activeBone.name}
        </span>
      </div>

      <div className="p-3 space-y-3">
        {/* Name Input */}
        <div>
          <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
            Bone Name
          </label>
          <input
            type="text"
            value={activeBone.name}
            onChange={(e) => onUpdateBone(activeBone.id, { name: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 font-mono focus:border-cyan-500 outline-none"
          />
        </div>

        {/* Parenting & Offset */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-2">
          <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center justify-between">
            <span>Parent Bone</span>
            {activeBone.parentId && (
              <span className="text-cyan-400 text-[10px] font-normal flex items-center space-x-1">
                {activeBone.connected ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
                <span>{activeBone.connected ? 'Connected' : 'Keep Offset'}</span>
              </span>
            )}
          </label>

          <select
            value={activeBone.parentId || ''}
            onChange={(e) => {
              const val = e.target.value || null;
              onUpdateBone(activeBone.id, { parentId: val });
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none focus:border-cyan-500 font-mono"
          >
            <option value="">(None - Root Bone)</option>
            {parentCandidates.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {activeBone.parentId && (
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="connected_check"
                checked={activeBone.connected}
                onChange={(e) => onUpdateBone(activeBone.id, { connected: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-0"
              />
              <label htmlFor="connected_check" className="text-slate-300 text-[11px] cursor-pointer">
                Connected Joint (No Gap)
              </label>
            </div>
          )}
        </div>

        {/* 3D Roll Angle */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-slate-400">
            <span className="flex items-center space-x-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>3D Axial Roll</span>
            </span>
            <span className="font-mono text-cyan-300">{Math.round(activeBone.roll)}°</span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="-180"
              max="180"
              value={activeBone.roll}
              onChange={(e) => onUpdateBone(activeBone.id, { roll: parseFloat(e.target.value) })}
              className="flex-1 accent-cyan-500 h-1 bg-slate-800 rounded cursor-pointer"
            />
            <input
              type="number"
              value={Math.round(activeBone.roll)}
              onChange={(e) => onUpdateBone(activeBone.id, { roll: parseFloat(e.target.value) || 0 })}
              className="w-12 bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-center font-mono text-cyan-300 outline-none"
            />
          </div>
        </div>

        {/* 3D Pitch / Foreshortening Tilt */}
        <div className="bg-slate-950 p-2.5 rounded border border-orange-500/30 space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-orange-400">
            <span className="flex items-center space-x-1">
              <Sliders className="w-3 h-3 text-orange-400" />
              <span>3D Foreshortening Pitch</span>
            </span>
            <span className="font-mono text-orange-300">{currentPitchDeg}° Tilt</span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="-85"
              max="85"
              value={currentPitchDeg}
              onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
              className="flex-1 accent-orange-500 h-1 bg-slate-800 rounded cursor-pointer"
            />
            <input
              type="number"
              value={currentPitchDeg}
              onChange={(e) => handlePitchChange(Math.max(-85, Math.min(85, parseFloat(e.target.value) || 0)))}
              className="w-12 bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-center font-mono text-orange-300 outline-none"
            />
          </div>

          {/* Quick Foreshorten Presets for Arm/Leg Matching */}
          <div className="grid grid-cols-4 gap-1 pt-1">
            <button
              onClick={() => handlePitchChange(0)}
              className={`px-1 py-1 text-[9px] rounded font-medium border transition-colors ${
                currentPitchDeg === 0 ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Flat 2D Plane (0°)"
            >
              0° Flat
            </button>
            <button
              onClick={() => handlePitchChange(30)}
              className={`px-1 py-1 text-[9px] rounded font-medium border transition-colors ${
                currentPitchDeg === 30 ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Slight Depth Foreshortening (+30°)"
            >
              +30°
            </button>
            <button
              onClick={() => handlePitchChange(60)}
              className={`px-1 py-1 text-[9px] rounded font-medium border transition-colors ${
                currentPitchDeg === 60 ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Deep Foreshortening (+60°)"
            >
              +60°
            </button>
            <button
              onClick={() => handlePitchChange(-45)}
              className={`px-1 py-1 text-[9px] rounded font-medium border transition-colors ${
                currentPitchDeg === -45 ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Receding Away (-45°)"
            >
              -45°
            </button>
          </div>
        </div>

        {/* Head & Tail Coordinates (3D Depth) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Head */}
          <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Head (X, Y, Z)</span>
            <div className="space-y-0.5 font-mono text-[10px]">
              <div className="flex justify-between text-slate-400"><span>X:</span> <span className="text-slate-200">{Math.round(activeBone.head.x)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Y:</span> <span className="text-slate-200">{Math.round(activeBone.head.y)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Z (Depth):</span> <span className="text-cyan-400">{Math.round(activeBone.head.z)}</span></div>
            </div>
          </div>

          {/* Tail */}
          <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Tail (X, Y, Z)</span>
            <div className="space-y-0.5 font-mono text-[10px]">
              <div className="flex justify-between text-slate-400"><span>X:</span> <span className="text-slate-200">{Math.round(activeBone.tail.x)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Y:</span> <span className="text-slate-200">{Math.round(activeBone.tail.y)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Z (Depth):</span> <span className="text-cyan-400">{Math.round(activeBone.tail.z)}</span></div>
            </div>
          </div>
        </div>

        {/* Z Depth Offset Slider */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
          <div className="flex justify-between text-[10px] uppercase font-semibold text-slate-400">
            <span>3D Z-Depth Offset</span>
            <span className="font-mono text-cyan-400">{Math.round(activeBone.head.z)} px</span>
          </div>
          <input
            type="range"
            min="-150"
            max="150"
            value={activeBone.head.z}
            onChange={(e) => {
              const dz = parseFloat(e.target.value) - activeBone.head.z;
              onUpdateBone(activeBone.id, {
                head: { ...activeBone.head, z: parseFloat(e.target.value) },
                tail: { ...activeBone.tail, z: activeBone.tail.z + dz }
              });
            }}
            className="w-full accent-cyan-500 h-1 bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Bone Color Picker */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5">
          <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center space-x-1">
            <Palette className="w-3 h-3 text-cyan-400" />
            <span>Bone Group Color</span>
          </label>
          <div className="flex items-center space-x-1.5">
            {predefinedColors.map(c => (
              <button
                key={c.value}
                onClick={() => onUpdateBone(activeBone.id, { color: c.value })}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  activeBone.color === c.value ? 'scale-110 border-white shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Length info */}
        <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-slate-400 font-mono text-[11px]">
          <div className="flex items-center space-x-1">
            <Ruler className="w-3.5 h-3.5 text-slate-500" />
            <span>Length:</span>
          </div>
          <span className="text-slate-200">{Math.round(length)} px</span>
        </div>
      </div>
    </div>
  );
};
