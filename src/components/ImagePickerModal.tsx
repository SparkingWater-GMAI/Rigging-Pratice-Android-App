import React, { useRef } from 'react';
import { X, Upload, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { PracticeImage } from '../types/rigging';
import { PRESET_PRACTICE_IMAGES } from '../utils/presetImages';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageId: string;
  onSelectPreset: (preset: PracticeImage) => void;
  onUploadCustomImage: (dataUrl: string, title: string) => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  currentImageId,
  onSelectPreset,
  onUploadCustomImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          onUploadCustomImage(dataUrl, file.name.replace(/\.[^/.]+$/, ""));
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200 text-xs max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Select Character or Monster Reference Artwork</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Gallery & Upload Dropzone */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Custom Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-all group space-y-2"
          >
            <Upload className="w-8 h-8 text-cyan-400 mx-auto group-hover:scale-110 transition-transform" />
            <div>
              <p className="font-bold text-slate-100 text-sm">Upload Custom 2D Image</p>
              <p className="text-slate-400 text-[11px]">Supports PNG, JPEG, WebP, SVG reference artwork</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Presets Grid */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-300 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Rigging Practice Reference Library</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {PRESET_PRACTICE_IMAGES.map((preset) => {
                const isSelected = currentImageId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/50 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-20 h-20 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0 flex items-center justify-center p-1">
                      <img
                        src={preset.dataUrl}
                        alt={preset.title}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 text-xs truncate">{preset.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </div>

                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>

                      <div className="flex items-center space-x-2 pt-1 font-mono text-[10px]">
                        <span className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded">
                          {preset.difficulty}
                        </span>
                        <span className="text-slate-500">{preset.targetBonesCount} bones</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end bg-slate-950">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
