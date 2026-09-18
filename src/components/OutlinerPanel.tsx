import React, { useState } from 'react';
import { 
  Bone as BoneIcon, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Search, 
  Layers, 
  CornerDownRight,
  Link,
  Unlink
} from 'lucide-react';
import { Bone } from '../types/rigging';

interface OutlinerPanelProps {
  bones: Bone[];
  selectedBoneIds: string[];
  activeBoneId: string | null;
  onSelectBone: (id: string, multiSelect: boolean) => void;
  onUpdateBone: (id: string, updates: Partial<Bone>) => void;
  onDeleteBone: (id: string) => void;
}

export const OutlinerPanel: React.FC<OutlinerPanelProps> = ({
  bones,
  selectedBoneIds,
  activeBoneId,
  onSelectBone,
  onUpdateBone,
  onDeleteBone,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [editingBoneId, setEditingBoneId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const startRename = (bone: Bone, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBoneId(bone.id);
    setEditingName(bone.name);
  };

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      onUpdateBone(id, { name: editingName.trim() });
    }
    setEditingBoneId(null);
  };

  // Build hierarchy tree
  const rootBones = bones.filter(b => !b.parentId);
  const getChildren = (parentId: string) => bones.filter(b => b.parentId === parentId);

  const filterMatches = (b: Bone): boolean => {
    if (!searchTerm) return true;
    return b.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const renderBoneNode = (bone: Bone, level = 0) => {
    const children = getChildren(bone.id);
    const hasChildren = children.length > 0;
    const isCollapsed = collapsedNodes[bone.id];
    const isSelected = selectedBoneIds.includes(bone.id);
    const isActive = activeBoneId === bone.id;

    if (searchTerm && !filterMatches(bone) && !children.some(c => filterMatches(c))) {
      return null;
    }

    return (
      <div key={bone.id} className="select-none text-xs">
        <div
          onClick={(e) => onSelectBone(bone.id, e.shiftKey || e.ctrlKey)}
          onDoubleClick={(e) => startRename(bone, e)}
          className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer group transition-colors my-0.5 ${
            isActive
              ? 'bg-cyan-600 text-white font-medium shadow-sm'
              : isSelected
              ? 'bg-slate-700/80 text-cyan-200'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
          style={{ paddingLeft: `${Math.max(8, level * 16)}px` }}
        >
          <div className="flex items-center space-x-1.5 flex-1 min-w-0 pr-2">
            {/* Collapse / Expand toggle */}
            {hasChildren ? (
              <button
                onClick={(e) => toggleCollapse(bone.id, e)}
                className="p-0.5 hover:bg-slate-700/50 rounded text-slate-400 hover:text-white"
              >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : (
              <div className="w-4" />
            )}

            {/* Bone Icon & Connected indicator */}
            <div className="flex items-center space-x-1">
              <BoneIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
              {bone.parentId && (
                <span title={bone.connected ? 'Connected Joint' : 'Floating Parent Offset'}>
                  {bone.connected ? (
                    <Link className="w-2.5 h-2.5 text-emerald-400 opacity-80" />
                  ) : (
                    <Unlink className="w-2.5 h-2.5 text-amber-400 opacity-80" />
                  )}
                </span>
              )}
            </div>

            {/* Bone Name / Inline Edit */}
            {editingBoneId === bone.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => saveRename(bone.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveRename(bone.id);
                  if (e.key === 'Escape') setEditingBoneId(null);
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-950 text-white px-1.5 py-0.5 rounded border border-cyan-400 text-xs w-full outline-none"
              />
            ) : (
              <span className="truncate font-mono">{bone.name}</span>
            )}
          </div>

          {/* Visibility & Lock controls */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateBone(bone.id, { visible: bone.visible === false });
              }}
              className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
              title={bone.visible === false ? 'Hidden' : 'Visible'}
            >
              {bone.visible === false ? <EyeOff className="w-3 h-3 text-rose-400" /> : <Eye className="w-3 h-3" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateBone(bone.id, { locked: !bone.locked });
              }}
              className="p-0.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
              title={bone.locked ? 'Locked' : 'Unlocked'}
            >
              {bone.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col">
            {children.map(child => renderBoneNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-black/40 border-l border-white/10 backdrop-blur-md flex flex-col h-full text-zinc-200 select-none">
      {/* Header & Search */}
      <div className="p-2.5 border-b border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          <div className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            <span>Outliner Hierarchy</span>
          </div>
          <span className="bg-white/10 text-orange-400 px-1.5 py-0.5 rounded text-[10px] font-mono">
            {bones.length}
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search bones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-7 pr-2 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:border-orange-500 outline-none"
          />
        </div>
      </div>

      {/* Outliner Tree Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {bones.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs flex flex-col items-center space-y-2">
            <BoneIcon className="w-8 h-8 opacity-30" />
            <p>No bones created.</p>
            <p className="text-[10px] text-slate-600">Press E or click "Extrude Chain" to start!</p>
          </div>
        ) : (
          rootBones.map(root => renderBoneNode(root, 0))
        )}
      </div>
    </div>
  );
};
