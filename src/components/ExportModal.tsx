import React, { useState } from 'react';
import { X, Download, FileCode, Box, Code, Check, Copy } from 'lucide-react';
import { Bone } from '../types/rigging';
import { generateBlenderPythonScript } from '../utils/blenderPyExport';
import { generateFBXFile } from '../utils/fbxExport';
import { generateGLTFJson } from '../utils/gltfExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bones: Bone[];
  projectName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  bones,
  projectName,
}) => {
  const [activeFormat, setActiveFormat] = useState<'blender' | 'fbx' | 'gltf' | 'json'>('blender');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const safeName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'RigMaster_Armature';

  const blenderScript = generateBlenderPythonScript(bones, safeName);
  const fbxContent = generateFBXFile(bones, safeName);
  const gltfContent = generateGLTFJson(bones, safeName);
  const jsonContent = JSON.stringify({ name: projectName, bones }, null, 2);

  const getCurrentContent = () => {
    switch (activeFormat) {
      case 'blender': return blenderScript;
      case 'fbx': return fbxContent;
      case 'gltf': return gltfContent;
      case 'json': return jsonContent;
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    switch (activeFormat) {
      case 'blender':
        downloadFile(blenderScript, `${safeName}_rig.py`, 'text/x-python');
        break;
      case 'fbx':
        downloadFile(fbxContent, `${safeName}.fbx`, 'text/plain');
        break;
      case 'gltf':
        downloadFile(gltfContent, `${safeName}.gltf`, 'application/json');
        break;
      case 'json':
        downloadFile(jsonContent, `${safeName}_project.json`, 'application/json');
        break;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Export Armature Skeleton</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Format Selector Tabs */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setActiveFormat('blender')}
              className={`p-3 rounded-lg border text-left flex flex-col space-y-1 transition-all ${
                activeFormat === 'blender'
                  ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-slate-100">
                <span className="flex items-center space-x-1">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span>Blender Script</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-cyan-400">.py</span>
              </div>
              <span className="text-[10px] text-slate-400">Generates native Blender EditArmature Python script. Best for Blender artists!</span>
            </button>

            <button
              onClick={() => setActiveFormat('fbx')}
              className={`p-3 rounded-lg border text-left flex flex-col space-y-1 transition-all ${
                activeFormat === 'fbx'
                  ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-slate-100">
                <span className="flex items-center space-x-1">
                  <Box className="w-4 h-4 text-amber-400" />
                  <span>FBX Skeleton</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-amber-400">.fbx</span>
              </div>
              <span className="text-[10px] text-slate-400">Industry standard 3D skeletal hierarchy file for Maya, Unreal, Unity.</span>
            </button>

            <button
              onClick={() => setActiveFormat('gltf')}
              className={`p-3 rounded-lg border text-left flex flex-col space-y-1 transition-all ${
                activeFormat === 'gltf'
                  ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-slate-100">
                <span className="flex items-center space-x-1">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>glTF 2.0</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-emerald-400">.gltf</span>
              </div>
              <span className="text-[10px] text-slate-400">Modern web & 3D engine armature Nodes hierarchy.</span>
            </button>

            <button
              onClick={() => setActiveFormat('json')}
              className={`p-3 rounded-lg border text-left flex flex-col space-y-1 transition-all ${
                activeFormat === 'json'
                  ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-slate-100">
                <span className="flex items-center space-x-1">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span>RigMaster Project</span>
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-purple-400">.json</span>
              </div>
              <span className="text-[10px] text-slate-400">Full offline project backup to reload and edit later.</span>
            </button>
          </div>

          {/* Preview Code Box */}
          <div className="relative">
            <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-t border border-slate-800 text-slate-400 text-[11px] font-mono">
              <span>Code Preview ({bones.length} bones)</span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-b border-x border-b border-slate-800 text-[11px] font-mono text-slate-300 h-64 overflow-y-auto leading-relaxed">
              {getCurrentContent()}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <span className="text-[11px] text-slate-400">
            {bones.length} bones ready for export to 3D software.
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 hover:bg-slate-800 text-slate-300 rounded font-semibold"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded font-bold flex items-center space-x-2 shadow"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
