import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Toolbar } from './components/Toolbar';
import { OutlinerPanel } from './components/OutlinerPanel';
import { BoneInspector } from './components/BoneInspector';
import { Canvas2DViewport } from './components/Canvas2DViewport';
import { ThreeDViewport } from './components/ThreeDViewport';
import { RapidFireBar } from './components/RapidFireBar';
import { ExportModal } from './components/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { RigValidationModal } from './components/RigValidationModal';
import { SetParentModal } from './components/SetParentModal';
import { ImagePickerModal } from './components/ImagePickerModal';

import { Bone, ActiveTool, TransformMode, ViewportMode, PracticeImage, SelectedJoint } from './types/rigging';
import { PRESET_PRACTICE_IMAGES } from './utils/presetImages';
import { validateSkeleton } from './utils/rigValidator';
import { updateBonesWithHierarchy } from './utils/rigHierarchy';

const INITIAL_HUMANOID_BONES: Bone[] = [
  {
    id: 'b_root',
    name: 'Pelvis',
    head: { x: 400, y: 400, z: 0 },
    tail: { x: 400, y: 350, z: 0 },
    roll: 0,
    parentId: null,
    connected: false,
    color: '#f59e0b',
  },
  {
    id: 'b_spine1',
    name: 'Spine.01',
    head: { x: 400, y: 350, z: 0 },
    tail: { x: 400, y: 280, z: 0 },
    roll: 0,
    parentId: 'b_root',
    connected: true,
    color: '#f59e0b',
  },
  {
    id: 'b_chest',
    name: 'Chest',
    head: { x: 400, y: 280, z: 0 },
    tail: { x: 400, y: 210, z: 0 },
    roll: 0,
    parentId: 'b_spine1',
    connected: true,
    color: '#f59e0b',
  },
  {
    id: 'b_neck',
    name: 'Neck',
    head: { x: 400, y: 210, z: 0 },
    tail: { x: 400, y: 160, z: 0 },
    roll: 0,
    parentId: 'b_chest',
    connected: true,
    color: '#f59e0b',
  },
  {
    id: 'b_head',
    name: 'Head',
    head: { x: 400, y: 160, z: 0 },
    tail: { x: 400, y: 90, z: 0 },
    roll: 0,
    parentId: 'b_neck',
    connected: true,
    color: '#f59e0b',
  },
  // Left Arm Chain
  {
    id: 'b_shoulder_l',
    name: 'Shoulder.L',
    head: { x: 400, y: 220, z: 0 },
    tail: { x: 300, y: 235, z: 0 },
    roll: 0,
    parentId: 'b_chest',
    connected: false,
    color: '#3b82f6',
  },
  {
    id: 'b_arm_l',
    name: 'UpperArm.L',
    head: { x: 300, y: 235, z: 0 },
    tail: { x: 240, y: 345, z: 0 },
    roll: 0,
    parentId: 'b_shoulder_l',
    connected: true,
    color: '#3b82f6',
  },
  {
    id: 'b_forearm_l',
    name: 'Forearm.L',
    head: { x: 240, y: 345, z: 0 },
    tail: { x: 180, y: 460, z: 0 },
    roll: 0,
    parentId: 'b_arm_l',
    connected: true,
    color: '#3b82f6',
  },
  {
    id: 'b_hand_l',
    name: 'Hand.L',
    head: { x: 180, y: 460, z: 0 },
    tail: { x: 160, y: 510, z: 0 },
    roll: 0,
    parentId: 'b_forearm_l',
    connected: true,
    color: '#3b82f6',
  },
  // Right Arm Chain
  {
    id: 'b_shoulder_r',
    name: 'Shoulder.R',
    head: { x: 400, y: 220, z: 0 },
    tail: { x: 500, y: 235, z: 0 },
    roll: 0,
    parentId: 'b_chest',
    connected: false,
    color: '#10b981',
  },
  {
    id: 'b_arm_r',
    name: 'UpperArm.R',
    head: { x: 500, y: 235, z: 0 },
    tail: { x: 560, y: 345, z: 0 },
    roll: 0,
    parentId: 'b_shoulder_r',
    connected: true,
    color: '#10b981',
  },
  {
    id: 'b_forearm_r',
    name: 'Forearm.R',
    head: { x: 560, y: 345, z: 0 },
    tail: { x: 620, y: 460, z: 0 },
    roll: 0,
    parentId: 'b_arm_r',
    connected: true,
    color: '#10b981',
  },
  {
    id: 'b_hand_r',
    name: 'Hand.R',
    head: { x: 620, y: 460, z: 0 },
    tail: { x: 640, y: 510, z: 0 },
    roll: 0,
    parentId: 'b_forearm_r',
    connected: true,
    color: '#10b981',
  },
];

export default function App() {
  const [projectName, setProjectName] = useState('Heroic_Humanoid_Rig');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [customImageDataUrl, setCustomImageDataUrl] = useState<string | null>(null);

  const [bones, setBones] = useState<Bone[]>(INITIAL_HUMANOID_BONES);
  const [selectedBoneIds, setSelectedBoneIds] = useState<string[]>(['b_root']);
  const [activeBoneId, setActiveBoneId] = useState<string | null>('b_root');
  const [selectedJoint, setSelectedJoint] = useState<SelectedJoint | null>(null);

  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [transformMode, setTransformMode] = useState<TransformMode>('none');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('split');
  const [rapidFireActive, setRapidFireActive] = useState(true);

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);

  // Undo / Redo History Stack State
  const [historyState, setHistoryState] = useState<{ historyStack: Bone[][]; index: number }>({
    historyStack: [INITIAL_HUMANOID_BONES],
    index: 0,
  });

  const currentPracticeImage = PRESET_PRACTICE_IMAGES[currentImageIndex];
  const activeImageSrc = customImageDataUrl || currentPracticeImage.dataUrl;

  const validation = validateSkeleton(bones, currentPracticeImage);

  const pushHistory = useCallback((newBones: Bone[]) => {
    setHistoryState((prev) => {
      const sliced = prev.historyStack.slice(0, prev.index + 1);
      const top = sliced[sliced.length - 1];
      if (top && JSON.stringify(top) === JSON.stringify(newBones)) {
        return prev;
      }
      const nextStack = [...sliced, JSON.parse(JSON.stringify(newBones))];
      return {
        historyStack: nextStack,
        index: nextStack.length - 1,
      };
    });
  }, []);

  const handleStartTransform = useCallback(() => {
    pushHistory(bones);
  }, [bones, pushHistory]);

  const handleCommitHistory = useCallback(() => {
    pushHistory(bones);
  }, [bones, pushHistory]);

  const handleUndo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.index > 0) {
        const nextIndex = prev.index - 1;
        const targetBones = prev.historyStack[nextIndex];
        if (targetBones) {
          setBones(JSON.parse(JSON.stringify(targetBones)));
        }
        return { ...prev, index: nextIndex };
      }
      return prev;
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.index < prev.historyStack.length - 1) {
        const nextIndex = prev.index + 1;
        const targetBones = prev.historyStack[nextIndex];
        if (targetBones) {
          setBones(JSON.parse(JSON.stringify(targetBones)));
        }
        return { ...prev, index: nextIndex };
      }
      return prev;
    });
  }, []);

  // Selection handler
  const handleSelectBone = (id: string, multiSelect: boolean) => {
    if (!id) {
      setSelectedBoneIds([]);
      setActiveBoneId(null);
      return;
    }

    if (multiSelect) {
      if (selectedBoneIds.includes(id)) {
        const next = selectedBoneIds.filter((bId) => bId !== id);
        setSelectedBoneIds(next);
        setActiveBoneId(next.length > 0 ? next[next.length - 1] : null);
      } else {
        setSelectedBoneIds([...selectedBoneIds, id]);
        setActiveBoneId(id);
      }
    } else {
      setSelectedBoneIds([id]);
      setActiveBoneId(id);
    }
  };

  // Bone update handler
  const handleUpdateBone = (id: string, updates: Partial<Bone>) => {
    const nextBones = updateBonesWithHierarchy(bones, id, updates);
    setBones(nextBones);
  };

  // Add bone handler
  const handleAddBone = (newBone: Bone) => {
    const nextBones = [...bones, newBone];
    setBones(nextBones);
    setSelectedBoneIds([newBone.id]);
    setActiveBoneId(newBone.id);
    pushHistory(nextBones);
  };

  // Extrude connected bone chain (Shortcut E)
  const handleExtrude = useCallback(() => {
    if (!activeBoneId) return;
    const activeBone = bones.find((b) => b.id === activeBoneId);
    if (!activeBone) return;

    const dx = activeBone.tail.x - activeBone.head.x;
    const dy = activeBone.tail.y - activeBone.head.y;
    const len = Math.hypot(dx, dy) || 50;

    const newHead = { ...activeBone.tail };
    const newTail = {
      x: activeBone.tail.x + (dx / len) * 50,
      y: activeBone.tail.y + (dy / len) * 50,
      z: activeBone.tail.z,
    };

    const newBone: Bone = {
      id: `bone_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: `${activeBone.name.split('.')[0]}.${(bones.length + 1).toString().padStart(2, '0')}`,
      head: newHead,
      tail: newTail,
      roll: activeBone.roll,
      parentId: activeBone.id,
      connected: true,
      color: activeBone.color,
    };

    handleAddBone(newBone);
  }, [activeBoneId, bones]);

  // Add single floating bone (Shortcut Shift+A)
  const handleAddSingleBone = useCallback(() => {
    const newBone: Bone = {
      id: `bone_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: `FloatingBone.${(bones.length + 1).toString().padStart(3, '0')}`,
      head: { x: 400, y: 500, z: 0 },
      tail: { x: 400, y: 440, z: 0 },
      roll: 0,
      parentId: activeBoneId || null,
      connected: false,
      color: '#a855f7',
    };
    handleAddBone(newBone);
  }, [activeBoneId, bones]);

  // Subdivide bone (Shortcut W)
  const handleSubdivide = useCallback(() => {
    if (!activeBoneId) return;
    const bone = bones.find((b) => b.id === activeBoneId);
    if (!bone) return;

    const midPoint = {
      x: (bone.head.x + bone.tail.x) / 2,
      y: (bone.head.y + bone.tail.y) / 2,
      z: (bone.head.z + bone.tail.z) / 2,
    };

    const childBone: Bone = {
      id: `bone_${Date.now()}_sub`,
      name: `${bone.name}_02`,
      head: midPoint,
      tail: { ...bone.tail },
      roll: bone.roll,
      parentId: bone.id,
      connected: true,
      color: bone.color,
    };

    const nextBones = bones.map((b) => {
      if (b.id === bone.id) {
        return { ...b, name: `${bone.name}_01`, tail: midPoint };
      }
      if (b.parentId === bone.id && b.id !== childBone.id) {
        return { ...b, parentId: childBone.id };
      }
      return b;
    });

    nextBones.push(childBone);
    setBones(nextBones);
    setSelectedBoneIds([childBone.id]);
    setActiveBoneId(childBone.id);
    pushHistory(nextBones);
  }, [activeBoneId, bones]);

  // Symmetrize left bones to right (Shortcut Shift+M)
  const handleSymmetrize = useCallback(() => {
    const leftBones = bones.filter(
      (b) => b.name.endsWith('.L') || b.name.endsWith('_L') || b.name.toLowerCase().includes('left')
    );

    if (leftBones.length === 0) return;

    const mirroredBones: Bone[] = [];
    const idMap = new Map<string, string>();

    leftBones.forEach((b) => {
      const newId = `bone_sym_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      idMap.set(b.id, newId);

      const rightName = b.name
        .replace(/\.L$/, '.R')
        .replace(/_L$/, '_R')
        .replace(/left/i, 'Right');

      // Mirror X across canvas center 400
      const mirroredHeadX = 800 - b.head.x;
      const mirroredTailX = 800 - b.tail.x;

      mirroredBones.push({
        ...b,
        id: newId,
        name: rightName,
        head: { ...b.head, x: mirroredHeadX },
        tail: { ...b.tail, x: mirroredTailX },
        roll: -b.roll,
        color: '#10b981',
      });
    });

    // Remap parents
    mirroredBones.forEach((mb) => {
      if (mb.parentId && idMap.has(mb.parentId)) {
        mb.parentId = idMap.get(mb.parentId)!;
      }
    });

    const nextBones = [...bones, ...mirroredBones];
    setBones(nextBones);
    pushHistory(nextBones);
  }, [bones]);

  // Duplicate Selected (Shortcut Shift+D)
  const handleDuplicateSelected = useCallback(() => {
    if (selectedBoneIds.length === 0) return;

    const duplicated: Bone[] = [];
    selectedBoneIds.forEach((id) => {
      const target = bones.find((b) => b.id === id);
      if (target) {
        duplicated.push({
          ...target,
          id: `bone_dup_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          name: `${target.name}_copy`,
          head: { x: target.head.x + 20, y: target.head.y + 20, z: target.head.z },
          tail: { x: target.tail.x + 20, y: target.tail.y + 20, z: target.tail.z },
        });
      }
    });

    const nextBones = [...bones, ...duplicated];
    setBones(nextBones);
    setSelectedBoneIds(duplicated.map((d) => d.id));
    setActiveBoneId(duplicated[0]?.id || null);
    pushHistory(nextBones);
  }, [bones, selectedBoneIds]);

  // Delete Selected (Shortcut X / Delete)
  const handleDeleteSelected = useCallback(() => {
    if (selectedBoneIds.length === 0) return;

    const nextBones = bones.filter((b) => !selectedBoneIds.includes(b.id));
    // Clear deleted parents
    nextBones.forEach((b) => {
      if (b.parentId && selectedBoneIds.includes(b.parentId)) {
        b.parentId = null;
        b.connected = false;
      }
    });

    setBones(nextBones);
    setSelectedBoneIds([]);
    setActiveBoneId(null);
    pushHistory(nextBones);
  }, [bones, selectedBoneIds]);

  // Clear Parent (Shortcut Alt+P)
  const handleClearParent = useCallback(() => {
    if (selectedBoneIds.length === 0) return;
    const nextBones = bones.map((b) => {
      if (selectedBoneIds.includes(b.id)) {
        return { ...b, parentId: null, connected: false };
      }
      return b;
    });
    setBones(nextBones);
    pushHistory(nextBones);
  }, [bones, selectedBoneIds]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing inside inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Extrude [E]
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setActiveTool('extrude');
        handleExtrude();
      }

      // Add Single Bone [Shift+A]
      if (e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setActiveTool('single_bone');
        handleAddSingleBone();
      }

      // Grab / Move [G]
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setActiveTool('move');
      }

      // Rotate [R]
      if (!e.ctrlKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        setActiveTool('rotate');
      }

      // Scale [S]
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setActiveTool('scale');
      }

      // 3D Roll [Ctrl+R]
      if (e.ctrlKey && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        setActiveTool('roll');
      }

      // Set Parent [Ctrl+P]
      if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setIsParentModalOpen(true);
      }

      // Clear Parent [Alt+P]
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handleClearParent();
      }

      // Symmetrize [Shift+M]
      if (e.shiftKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        handleSymmetrize();
      }

      // Duplicate [Shift+D]
      if (e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        handleDuplicateSelected();
      }

      // Subdivide [W]
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleSubdivide();
      }

      // Delete [X] or [Delete]
      if (e.key === 'x' || e.key === 'X' || e.key === 'Delete') {
        e.preventDefault();
        handleDeleteSelected();
      }

      // Select All [A]
      if (e.key === 'a' || e.key === 'A') {
        if (!e.shiftKey && !e.ctrlKey) {
          e.preventDefault();
          setSelectedBoneIds(bones.map((b) => b.id));
          setActiveBoneId(bones[0]?.id || null);
        }
      }

      // Deselect All [Alt+A]
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setSelectedBoneIds([]);
        setActiveBoneId(null);
      }

      // Undo [Ctrl+Z or Cmd+Z]
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const keyLower = e.key.toLowerCase();

      if (isCtrlOrCmd && keyLower === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo [Ctrl+Y or Cmd+Y or Ctrl+Shift+Z or Cmd+Shift+Z]
      if ((isCtrlOrCmd && keyLower === 'y') || (isCtrlOrCmd && e.shiftKey && keyLower === 'z')) {
        e.preventDefault();
        handleRedo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    bones,
    activeBoneId,
    selectedBoneIds,
    handleExtrude,
    handleAddSingleBone,
    handleClearParent,
    handleSymmetrize,
    handleDuplicateSelected,
    handleSubdivide,
    handleDeleteSelected,
    handleUndo,
    handleRedo,
  ]);

  const activeBone = bones.find((b) => b.id === activeBoneId) || null;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        projectName={projectName}
        onRenameProject={setProjectName}
        viewportMode={viewportMode}
        onChangeViewportMode={setViewportMode}
        rapidFireActive={rapidFireActive}
        onToggleRapidFire={() => setRapidFireActive(!rapidFireActive)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenValidation={() => setIsValidationOpen(true)}
        onNewProject={() => {
          setBones([]);
          setSelectedBoneIds([]);
          setActiveBoneId(null);
        }}
        onOpenImagePicker={() => setIsImagePickerOpen(true)}
        boneCount={bones.length}
        validationScore={validation.score}
        onResetSkeleton={() => {
          setBones([]);
          setSelectedBoneIds([]);
          setActiveBoneId(null);
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyState.index > 0}
        canRedo={historyState.index < historyState.historyStack.length - 1}
      />

      {/* Rapid Fire Practice Mode Bar */}
      {rapidFireActive && (
        <RapidFireBar
          practiceImages={PRESET_PRACTICE_IMAGES}
          currentImageIndex={currentImageIndex}
          onSelectImageIndex={(idx) => {
            setCurrentImageIndex(idx);
            setCustomImageDataUrl(null);
          }}
          bones={bones}
          validationScore={validation.score}
          onCloseBar={() => setRapidFireActive(false)}
        />
      )}

      {/* Main Workspace Grid Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <Toolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          onExtrude={handleExtrude}
          onAddSingleBone={handleAddSingleBone}
          onSetParentModal={() => setIsParentModalOpen(true)}
          onClearParent={handleClearParent}
          onSubdivide={handleSubdivide}
          onSymmetrize={handleSymmetrize}
          onDeleteSelected={handleDeleteSelected}
          onDuplicateSelected={handleDuplicateSelected}
          hasSelection={selectedBoneIds.length > 0}
        />

        {/* Viewports Container */}
        <main className="flex-1 flex overflow-hidden relative bg-[#09090b]">
          {(viewportMode === '2d_only' || viewportMode === 'split') && (
            <Canvas2DViewport
              imageSrc={activeImageSrc}
              bones={bones}
              selectedBoneIds={selectedBoneIds}
              activeBoneId={activeBoneId}
              selectedJoint={selectedJoint}
              activeTool={activeTool}
              transformMode={transformMode}
              onSelectBone={handleSelectBone}
              onSelectJoint={setSelectedJoint}
              onUpdateBone={handleUpdateBone}
              onAddBone={handleAddBone}
              onUpdateBonesBulk={() => {}}
              onSetTransformMode={setTransformMode}
              onStartTransform={handleStartTransform}
              onCommitHistory={handleCommitHistory}
            />
          )}

          {viewportMode === '3d_only' && (
            <ThreeDViewport
              bones={bones}
              selectedBoneIds={selectedBoneIds}
              activeBoneId={activeBoneId}
              onSelectBone={handleSelectBone}
            />
          )}

          {/* Floating 3D Octahedral Window overlay over 2D main viewport */}
          {viewportMode === 'split' && (
            <div className="absolute top-4 right-4 z-30 shadow-2xl">
              <ThreeDViewport
                bones={bones}
                selectedBoneIds={selectedBoneIds}
                activeBoneId={activeBoneId}
                onSelectBone={handleSelectBone}
                isFloatingWindow={true}
                onCloseWindow={() => setViewportMode('2d_only')}
              />
            </div>
          )}
        </main>

        {/* Right Sidebar: Outliner & Bone Inspector */}
        <aside className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-10">
          <OutlinerPanel
            bones={bones}
            selectedBoneIds={selectedBoneIds}
            activeBoneId={activeBoneId}
            onSelectBone={handleSelectBone}
            onUpdateBone={handleUpdateBone}
            onDeleteBone={(id) => {
              setSelectedBoneIds([id]);
              handleDeleteSelected();
            }}
          />

          <BoneInspector
            activeBone={activeBone}
            allBones={bones}
            onUpdateBone={handleUpdateBone}
          />
        </aside>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        bones={bones}
        projectName={projectName}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <RigValidationModal
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
        validation={validation}
      />

      <SetParentModal
        isOpen={isParentModalOpen}
        onClose={() => setIsParentModalOpen(false)}
        activeBone={activeBone}
        selectedBoneIds={selectedBoneIds}
        allBones={bones}
        onConfirmParent={(parentId, connected) => {
          if (activeBoneId) {
            handleUpdateBone(activeBoneId, { parentId, connected });
          }
        }}
      />

      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        currentImageId={currentPracticeImage.id}
        onSelectPreset={(preset) => {
          const idx = PRESET_PRACTICE_IMAGES.findIndex((p) => p.id === preset.id);
          if (idx !== -1) {
            setCurrentImageIndex(idx);
            setCustomImageDataUrl(null);
          }
        }}
        onUploadCustomImage={(dataUrl, name) => {
          setCustomImageDataUrl(dataUrl);
          setProjectName(`${name}_Rig`);
        }}
      />
    </div>
  );
}
