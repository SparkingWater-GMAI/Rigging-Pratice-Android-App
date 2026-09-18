import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Bone Creation & Extrusion',
      items: [
        { key: 'E', desc: 'Extrude Bone Chain from selected joint/bone' },
        { key: 'Shift + A', desc: 'Add Single Standalone Floating Bone' },
        { key: 'Shift + D', desc: 'Duplicate selected bone or chain' },
        { key: 'W', desc: 'Subdivide bone into equal segments' },
      ],
    },
    {
      title: 'Transformations & 3D Roll',
      items: [
        { key: 'G', desc: 'Grab / Move selected bone or joint' },
        { key: 'R', desc: 'Rotate bone around head joint' },
        { key: 'S', desc: 'Scale bone length' },
        { key: 'Ctrl + R', desc: 'Adjust 3D axial roll angle' },
      ],
    },
    {
      title: 'Parenting & Offset Constraints',
      items: [
        { key: 'Ctrl + P', desc: 'Set Parent (Connected Joint OR Keep Offset)' },
        { key: 'Alt + P', desc: 'Clear Parent (Unparent bone)' },
        { key: 'Shift + M', desc: 'Symmetrize Left (.L) bones to Right (.R)' },
      ],
    },
    {
      title: 'Selection & Canvas Navigation',
      items: [
        { key: 'Middle Mouse / Space + Drag', desc: 'Pan 2D / 3D Canvas Viewport' },
        { key: 'Mouse Wheel Scroll', desc: 'Zoom In / Out' },
        { key: 'A', desc: 'Select All bones' },
        { key: 'Alt + A', desc: 'Deselect All' },
        { key: 'X / Delete', desc: 'Delete selected bone(s)' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Blender Shortcut Key Reference</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcut Grid */}
        <div className="p-5 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <h3 className="font-bold text-cyan-300 text-xs tracking-wide uppercase border-b border-slate-800 pb-1.5 flex items-center space-x-1.5">
                <Command className="w-3.5 h-3.5" />
                <span>{group.title}</span>
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                    <span className="bg-slate-800 border border-slate-700 text-slate-100 font-mono px-2 py-0.5 rounded text-[11px] font-semibold">
                      {item.key}
                    </span>
                    <span className="text-slate-400 text-right text-[11px] pl-2">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <span className="text-[11px] text-slate-400">
            Controls mimic Blender 4.0 Industry Standard Rigging workflow.
          </span>
          <button
            onClick={onClose}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded font-bold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
