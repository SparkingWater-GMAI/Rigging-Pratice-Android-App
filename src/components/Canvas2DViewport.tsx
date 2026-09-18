import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Bone, ActiveTool, TransformMode, SelectedJoint } from '../types/rigging';

interface Canvas2DViewportProps {
  imageSrc: string;
  bones: Bone[];
  selectedBoneIds: string[];
  activeBoneId: string | null;
  selectedJoint: SelectedJoint | null;
  activeTool: ActiveTool;
  transformMode: TransformMode;
  onSelectBone: (id: string, multiSelect: boolean) => void;
  onSelectJoint: (joint: SelectedJoint | null) => void;
  onUpdateBone: (id: string, updates: Partial<Bone>) => void;
  onAddBone: (bone: Bone) => void;
  onUpdateBonesBulk: (updates: { id: string; updates: Partial<Bone> }[]) => void;
  onSetTransformMode: (mode: TransformMode) => void;
  onStartTransform?: () => void;
  onCommitHistory?: () => void;
}

export const Canvas2DViewport: React.FC<Canvas2DViewportProps> = ({
  imageSrc,
  bones,
  selectedBoneIds,
  activeBoneId,
  selectedJoint,
  activeTool,
  transformMode,
  onSelectBone,
  onSelectJoint,
  onUpdateBone,
  onAddBone,
  onUpdateBonesBulk,
  onSetTransformMode,
  onStartTransform,
  onCommitHistory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // View transform (pan & zoom)
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Mouse interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedTarget, setDraggedTarget] = useState<{
    boneId: string;
    part: 'head' | 'tail' | 'body';
    mode: 'move' | 'rotate' | 'roll';
    initialHead: { x: number; y: number; z: number };
    initialTail: { x: number; y: number; z: number };
    initialRoll: number;
    mouseStart: { x: number; y: number };
  } | null>(null);

  const [hoveredBoneId, setHoveredBoneId] = useState<string | null>(null);
  const [hoveredPart, setHoveredPart] = useState<'head' | 'tail' | 'body' | null>(null);

  // Load image element
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      setBgImage(img);
    };
  }, [imageSrc]);

  // Handle Resize
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Screen <-> Canvas Coordinate Conversions
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (screenX - rect.left - pan.x) / zoom;
      const y = (screenY - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [pan, zoom]
  );

  // Hit testing for bones (Head, Tail, Body)
  const hitTest = useCallback(
    (cx: number, cy: number) => {
      const jointRadius = 14 / zoom;
      const bodyThreshold = 12 / zoom;

      for (let i = bones.length - 1; i >= 0; i--) {
        const b = bones[i];

        // Tail joint hit test
        const distTail = Math.hypot(cx - b.tail.x, cy - b.tail.y);
        if (distTail <= jointRadius) {
          return { boneId: b.id, part: 'tail' as const };
        }

        // Head joint hit test
        const distHead = Math.hypot(cx - b.head.x, cy - b.head.y);
        if (distHead <= jointRadius) {
          return { boneId: b.id, part: 'head' as const };
        }

        // Bone body segment distance test
        const dx = b.tail.x - b.head.x;
        const dy = b.tail.y - b.head.y;
        const lenSq = dx * dx + dy * dy;

        if (lenSq > 0) {
          let t = ((cx - b.head.x) * dx + (cy - b.head.y) * dy) / lenSq;
          t = Math.max(0, Math.min(1, t));
          const projX = b.head.x + t * dx;
          const projY = b.head.y + t * dy;
          const distBody = Math.hypot(cx - projX, cy - projY);
          if (distBody <= bodyThreshold) {
            return { boneId: b.id, part: 'body' as const };
          }
        }
      }
      return null;
    },
    [bones, zoom]
  );

  // Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply pan & zoom
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. Draw Background Grid & Image
    if (bgImage) {
      const imgWidth = bgImage.width || 800;
      const imgHeight = bgImage.height || 1000;
      const imgX = (800 - imgWidth) / 2;
      const imgY = (1000 - imgHeight) / 2;
      ctx.drawImage(bgImage, imgX, imgY, imgWidth, imgHeight);
    }

    // 2. Draw Parent Offset Dashed Lines (for floating parented bones)
    bones.forEach((b) => {
      if (b.parentId) {
        const parent = bones.find((p) => p.id === b.parentId);
        if (parent) {
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
          ctx.lineWidth = 1.5 / zoom;
          ctx.moveTo(parent.tail.x, parent.tail.y);
          ctx.lineTo(b.head.x, b.head.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    });

    // 3. Draw 3D Octahedral Bones with Roll Orientation Visualization
    bones.forEach((b) => {
      const isSelected = selectedBoneIds.includes(b.id);
      const isActive = activeBoneId === b.id;
      const isHovered = hoveredBoneId === b.id;

      const isHeadSelected = selectedJoint?.boneId === b.id && selectedJoint.part === 'head';
      const isTailSelected = selectedJoint?.boneId === b.id && selectedJoint.part === 'tail';
      const isBodySelected = selectedJoint?.boneId === b.id && selectedJoint.part === 'body';

      const hX = b.head.x;
      const hY = b.head.y;
      const tX = b.tail.x;
      const tY = b.tail.y;

      const dx = tX - hX;
      const dy = tY - hY;
      const len = Math.hypot(dx, dy);

      if (len < 1) return;

      const angle = Math.atan2(dy, dx);
      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);

      // Octahedral bone diamond width
      const diamondWidth = Math.min(24, Math.max(10, len * 0.22));

      // 3D Octahedral vertices
      const pHead = { x: hX, y: hY };
      const pTail = { x: tX, y: tY };
      const pMid1 = {
        x: hX + dx * 0.22 + perpX * diamondWidth,
        y: hY + dy * 0.22 + perpY * diamondWidth,
      };
      const pMid2 = {
        x: hX + dx * 0.22 - perpX * diamondWidth,
        y: hY + dy * 0.22 - perpY * diamondWidth,
      };

      // Primary Color
      const boneColor = b.color || '#38bdf8';

      // 3D Facet 1: Top Lit Face Gradient
      const grad1 = ctx.createLinearGradient(pHead.x, pHead.y, pMid1.x, pMid1.y);
      if (isActive) {
        grad1.addColorStop(0, '#f97316');
        grad1.addColorStop(1, '#ea580c');
      } else if (isSelected) {
        grad1.addColorStop(0, '#fbbf24');
        grad1.addColorStop(1, '#d97706');
      } else {
        grad1.addColorStop(0, boneColor);
        grad1.addColorStop(1, '#0284c7');
      }

      // Draw Lit Top Facet
      ctx.beginPath();
      ctx.moveTo(pHead.x, pHead.y);
      ctx.lineTo(pMid1.x, pMid1.y);
      ctx.lineTo(pTail.x, pTail.y);
      ctx.closePath();
      ctx.fillStyle = grad1;
      ctx.fill();

      // Draw Shadowed Bottom Facet (Gives realistic 3D volume)
      ctx.beginPath();
      ctx.moveTo(pHead.x, pHead.y);
      ctx.lineTo(pMid2.x, pMid2.y);
      ctx.lineTo(pTail.x, pTail.y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.fill();

      // 3D Center Ridge Highlight Line
      ctx.beginPath();
      ctx.moveTo(pHead.x, pHead.y);
      ctx.lineTo(pTail.x, pTail.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1 / zoom;
      ctx.stroke();

      // Octahedral Wireframe Outline
      ctx.beginPath();
      ctx.moveTo(pHead.x, pHead.y);
      ctx.lineTo(pMid1.x, pMid1.y);
      ctx.lineTo(pTail.x, pTail.y);
      ctx.lineTo(pMid2.x, pMid2.y);
      ctx.closePath();
      ctx.moveTo(pMid1.x, pMid1.y);
      ctx.lineTo(pMid2.x, pMid2.y);

      ctx.strokeStyle = isActive
        ? '#ffffff'
        : isSelected
        ? '#fef08a'
        : isHovered
        ? '#38bdf8'
        : '#0284c7';
      ctx.lineWidth = (isActive || isSelected || isBodySelected ? 2.5 : 1.5) / zoom;
      ctx.stroke();

      // 4. Draw 3D Roll Disk Ring & Local Orientation Axis (Blender/Maya Style)
      const rollRad = (b.roll * Math.PI) / 180;
      const diskCenterX = hX + dx * 0.22;
      const diskCenterY = hY + dy * 0.22;
      const diskRadius = diamondWidth * 0.95;

      ctx.save();
      ctx.translate(diskCenterX, diskCenterY);
      ctx.rotate(angle);

      // Ellipse ring representing 3D cross-section plane
      ctx.beginPath();
      ctx.ellipse(0, 0, diskRadius * 0.35, diskRadius, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isActive || activeTool === 'roll' ? 'rgba(249, 115, 22, 0.9)' : 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = (isActive ? 2 : 1.5) / zoom;
      ctx.stroke();

      // Local X axis vector (Cyan)
      const lx = Math.cos(rollRad + Math.PI / 2) * (diskRadius + 10);
      const ly = Math.sin(rollRad + Math.PI / 2) * (diskRadius + 10);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(lx, ly);
      ctx.strokeStyle = '#06b6d4'; // Cyan Local X
      ctx.lineWidth = 2.5 / zoom;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(lx, ly, 3.5 / zoom, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fill();

      // Local Z axis vector (Purple)
      const lzx = Math.cos(rollRad) * (diskRadius + 10);
      const lzy = Math.sin(rollRad) * (diskRadius + 10);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(lzx, lzy);
      ctx.strokeStyle = '#a855f7'; // Purple Local Z
      ctx.lineWidth = 2.5 / zoom;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(lzx, lzy, 3.5 / zoom, 0, Math.PI * 2);
      ctx.fillStyle = '#c084fc';
      ctx.fill();

      // Axis Labels
      ctx.font = `bold ${Math.max(8, 9 / zoom)}px monospace`;
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('+X', lx + 3, ly + 3);

      ctx.fillStyle = '#c084fc';
      ctx.fillText('+Z', lzx + 3, lzy + 3);

      ctx.restore();

      // Show Roll & Pitch Angle Badge on Active / Hovered / Roll / Rotate mode
      const dzBone = b.tail.z - b.head.z;
      const pitchDeg = Math.round((Math.atan2(dzBone, len) * 180) / Math.PI);

      if (isActive || isHovered || activeTool === 'roll' || transformMode === 'roll' || activeTool === 'rotate' || transformMode === 'rotate') {
        ctx.font = `bold ${Math.max(10, 11 / zoom)}px monospace`;
        ctx.fillStyle = '#c084fc';
        ctx.fillText(`Roll: ${Math.round(b.roll)}°`, diskCenterX + 18, diskCenterY - 14);

        if (Math.abs(pitchDeg) > 1 || Math.abs(dzBone) > 1) {
          ctx.fillStyle = '#f97316';
          ctx.fillText(`3D Pitch: ${pitchDeg}° (Z: ${Math.round(dzBone)}px)`, diskCenterX + 18, diskCenterY - 1);
        }
      }

      // 5. Draw Head Joint Handle (Perspective Z Scaled)
      const headZScale = Math.max(0.65, Math.min(1.6, 1 + b.head.z / 250));
      const headRadius = ((isHeadSelected ? 8 : isActive ? 6 : 4.5) * headZScale) / zoom;
      ctx.beginPath();
      ctx.arc(hX, hY, headRadius, 0, Math.PI * 2);
      ctx.fillStyle = isHeadSelected ? '#f97316' : isActive ? '#00f0ff' : isSelected ? '#fbbf24' : '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = isHeadSelected ? '#ffffff' : b.head.z > 5 ? '#00f0ff' : b.head.z < -5 ? '#334155' : '#0f172a';
      ctx.lineWidth = (isHeadSelected ? 2.5 : 1.5) / zoom;
      ctx.stroke();

      if (isHeadSelected) {
        ctx.font = `bold ${Math.max(9, 10 / zoom)}px sans-serif`;
        ctx.fillStyle = '#f97316';
        ctx.fillText('HEAD', hX - 14, hY - 12);
      }

      // 6. Draw Tail Joint Handle (Perspective Z Scaled)
      const tailZScale = Math.max(0.65, Math.min(1.6, 1 + b.tail.z / 250));
      const tailRadius = ((isTailSelected ? 8 : isActive ? 6 : 4.5) * tailZScale) / zoom;
      ctx.beginPath();
      ctx.arc(tX, tY, tailRadius, 0, Math.PI * 2);
      ctx.fillStyle = isTailSelected ? '#f97316' : isActive ? '#00f0ff' : isSelected ? '#fbbf24' : '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = isTailSelected ? '#ffffff' : b.tail.z > 5 ? '#00f0ff' : b.tail.z < -5 ? '#334155' : '#0f172a';
      ctx.lineWidth = (isTailSelected ? 2.5 : 1.5) / zoom;
      ctx.stroke();

      if (isTailSelected) {
        ctx.font = `bold ${Math.max(9, 10 / zoom)}px sans-serif`;
        ctx.fillStyle = '#f97316';
        ctx.fillText('TAIL', tX - 12, tY + 18);
      }

      // 7. Bone Name Label
      ctx.font = `${Math.max(10, 11 / zoom)}px monospace`;
      ctx.fillStyle = isActive ? '#f97316' : isSelected ? '#fbbf24' : '#cbd5e1';
      ctx.fillText(b.name, (pMid1.x + pMid2.x) / 2 + 10, (pMid1.y + pMid2.y) / 2 + 4);
    });

    // 8. If in Active Rotation mode (R key or Rotate tool active), draw Rotation Protractor Ring
    if ((activeTool === 'rotate' || transformMode === 'rotate') && activeBoneId) {
      const activeBone = bones.find((b) => b.id === activeBoneId);
      if (activeBone) {
        const pivot = selectedJoint?.part === 'tail' ? activeBone.tail : activeBone.head;
        const ringRadius = 45 / zoom;

        // Outer dashed rotation protractor ring
        ctx.beginPath();
        ctx.arc(pivot.x, pivot.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Degree Ticks (every 45 degrees)
        for (let deg = 0; deg < 360; deg += 45) {
          const rad = (deg * Math.PI) / 180;
          const x1 = pivot.x + Math.cos(rad) * (ringRadius - 4 / zoom);
          const y1 = pivot.y + Math.sin(rad) * (ringRadius - 4 / zoom);
          const x2 = pivot.x + Math.cos(rad) * (ringRadius + 4 / zoom);
          const y2 = pivot.y + Math.sin(rad) * (ringRadius + 4 / zoom);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.8)';
          ctx.lineWidth = 1.5 / zoom;
          ctx.stroke();
        }

        ctx.font = `bold ${Math.max(10, 11 / zoom)}px monospace`;
        ctx.fillStyle = '#f97316';
        ctx.fillText('ROTATE: Drag (2D) | Shift+Drag (3D Pitch Foreshorten)', pivot.x - 130, pivot.y - ringRadius - 8);
      }
    }

    ctx.restore();
  }, [bones, selectedBoneIds, activeBoneId, selectedJoint, hoveredBoneId, activeTool, transformMode, pan, zoom, bgImage, canvasSize]);

  // Mouse Down Event Handler
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click OR Shift + Left click -> Pan
    if (e.button === 1 || e.buttons === 4 || (e.shiftKey && e.button === 0 && !hitTest(screenToCanvas(e.clientX, e.clientY).x, screenToCanvas(e.clientX, e.clientY).y))) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button === 0) {
      const cPos = screenToCanvas(e.clientX, e.clientY);
      const hit = hitTest(cPos.x, cPos.y);

      if (hit) {
        if (onStartTransform) {
          onStartTransform();
        }
        onSelectBone(hit.boneId, e.shiftKey || e.ctrlKey);
        onSelectJoint({ boneId: hit.boneId, part: hit.part });

        const targetBone = bones.find((b) => b.id === hit.boneId);
        if (targetBone) {
          const isRotateMode = activeTool === 'rotate' || transformMode === 'rotate';
          const isRollMode = activeTool === 'roll' || transformMode === 'roll';

          setDraggedTarget({
            boneId: hit.boneId,
            part: hit.part,
            mode: isRotateMode ? 'rotate' : isRollMode ? 'roll' : 'move',
            initialHead: { ...targetBone.head },
            initialTail: { ...targetBone.tail },
            initialRoll: targetBone.roll,
            mouseStart: { x: cPos.x, y: cPos.y },
          });

          if (!isRotateMode && !isRollMode) {
            onSetTransformMode('grab');
          }
        }
      } else {
        // Clicked empty space
        if (activeTool === 'extrude' && activeBoneId) {
          const parentBone = bones.find((b) => b.id === activeBoneId);
          if (parentBone) {
            if (onStartTransform) {
              onStartTransform();
            }
            const isHead = selectedJoint?.part === 'head';
            const startPos = isHead ? parentBone.head : parentBone.tail;

            const newBone: Bone = {
              id: `bone_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              name: `Bone.${(bones.length + 1).toString().padStart(3, '0')}`,
              head: { ...startPos },
              tail: { x: cPos.x, y: cPos.y, z: startPos.z },
              roll: 0,
              parentId: parentBone.id,
              connected: !isHead,
            };
            onAddBone(newBone);
            onSelectJoint({ boneId: newBone.id, part: 'tail' });
          }
        } else if (activeTool === 'single_bone') {
          if (onStartTransform) {
            onStartTransform();
          }
          const newBone: Bone = {
            id: `bone_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: `FloatingBone.${(bones.length + 1).toString().padStart(3, '0')}`,
            head: { x: cPos.x, y: cPos.y, z: 0 },
            tail: { x: cPos.x + 30, y: cPos.y - 50, z: 0 },
            roll: 0,
            parentId: activeBoneId || null,
            connected: false,
          };
          onAddBone(newBone);
          onSelectJoint({ boneId: newBone.id, part: 'tail' });
        } else {
          if (!e.shiftKey) {
            onSelectBone('', false);
            onSelectJoint(null);
          }
        }
      }
    }
  };

  // Mouse Move Handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const cPos = screenToCanvas(e.clientX, e.clientY);

    // Hover check
    const hit = hitTest(cPos.x, cPos.y);
    setHoveredBoneId(hit ? hit.boneId : null);
    setHoveredPart(hit ? hit.part : null);

    // If NOT actively dragging a handle/bone, DO NOT rotate, roll, or move!
    if (!draggedTarget) return;

    // Interactive Rotation Mode (ONLY when mouse is clicked & dragged!)
    if (draggedTarget.mode === 'rotate') {
      const activeBone = bones.find((b) => b.id === draggedTarget.boneId);
      if (activeBone) {
        const pivot = draggedTarget.part === 'tail' ? activeBone.tail : activeBone.head;
        const initialDx = draggedTarget.initialTail.x - draggedTarget.initialHead.x;
        const initialDy = draggedTarget.initialTail.y - draggedTarget.initialHead.y;
        const initialDz = draggedTarget.initialTail.z - draggedTarget.initialHead.z;
        const full3dLen = Math.hypot(initialDx, initialDy, initialDz) || 50;

        const newAngle = Math.atan2(cPos.y - pivot.y, cPos.x - pivot.x);
        const mouseDistToPivot = Math.hypot(cPos.x - pivot.x, cPos.y - pivot.y);

        if (e.shiftKey) {
          // 3D Pitch / Foreshortening Depth Tilt Mode!
          // Mouse radial distance controls 2D projected length, calculated remainder becomes Z depth
          const clamped2dLen = Math.min(full3dLen - 1, Math.max(5, mouseDistToPivot));
          const calculatedDz = Math.sqrt(Math.max(0, full3dLen * full3dLen - clamped2dLen * clamped2dLen));
          const signZ = e.altKey || initialDz < 0 ? -1 : 1;
          const newDz = signZ * calculatedDz;

          if (draggedTarget.part === 'tail') {
            onUpdateBone(draggedTarget.boneId, {
              tail: {
                x: pivot.x + Math.cos(newAngle) * clamped2dLen,
                y: pivot.y + Math.sin(newAngle) * clamped2dLen,
                z: pivot.z + newDz,
              },
            });
          } else {
            onUpdateBone(draggedTarget.boneId, {
              head: {
                x: pivot.x - Math.cos(newAngle) * clamped2dLen,
                y: pivot.y - Math.sin(newAngle) * clamped2dLen,
                z: pivot.z - newDz,
              },
            });
          }
        } else {
          // Standard 2D Planar Rotation
          const target2dLen = Math.hypot(initialDx, initialDy) || 50;
          if (draggedTarget.part === 'tail') {
            onUpdateBone(draggedTarget.boneId, {
              tail: {
                x: pivot.x + Math.cos(newAngle) * target2dLen,
                y: pivot.y + Math.sin(newAngle) * target2dLen,
                z: activeBone.tail.z,
              },
            });
          } else {
            onUpdateBone(draggedTarget.boneId, {
              head: {
                x: pivot.x - Math.cos(newAngle) * target2dLen,
                y: pivot.y - Math.sin(newAngle) * target2dLen,
                z: activeBone.head.z,
              },
            });
          }
        }
      }
      return;
    }

    // Interactive Roll Mode (ONLY when mouse is clicked & dragged!)
    if (draggedTarget.mode === 'roll') {
      const activeBone = bones.find((b) => b.id === draggedTarget.boneId);
      if (activeBone) {
        const boneCenter = {
          x: (draggedTarget.initialHead.x + draggedTarget.initialTail.x) / 2,
          y: (draggedTarget.initialHead.y + draggedTarget.initialTail.y) / 2,
        };
        const startAngle = Math.atan2(
          draggedTarget.mouseStart.y - boneCenter.y,
          draggedTarget.mouseStart.x - boneCenter.x
        );
        const currentAngle = Math.atan2(cPos.y - boneCenter.y, cPos.x - boneCenter.x);
        let angleDiff = ((currentAngle - startAngle) * 180) / Math.PI;

        let newRoll = Math.round(draggedTarget.initialRoll + angleDiff);
        while (newRoll > 180) newRoll -= 360;
        while (newRoll < -180) newRoll += 360;

        onUpdateBone(draggedTarget.boneId, { roll: newRoll });
      }
      return;
    }

    // Standard Drag / Move
    if (draggedTarget.mode === 'move') {
      const dx = cPos.x - draggedTarget.mouseStart.x;
      const dy = cPos.y - draggedTarget.mouseStart.y;

      if (draggedTarget.part === 'head') {
        onUpdateBone(draggedTarget.boneId, {
          head: {
            x: draggedTarget.initialHead.x + dx,
            y: draggedTarget.initialHead.y + dy,
            z: draggedTarget.initialHead.z,
          },
        });
      } else if (draggedTarget.part === 'tail') {
        onUpdateBone(draggedTarget.boneId, {
          tail: {
            x: draggedTarget.initialTail.x + dx,
            y: draggedTarget.initialTail.y + dy,
            z: draggedTarget.initialTail.z,
          },
        });
      } else if (draggedTarget.part === 'body') {
        onUpdateBone(draggedTarget.boneId, {
          head: {
            x: draggedTarget.initialHead.x + dx,
            y: draggedTarget.initialHead.y + dy,
            z: draggedTarget.initialHead.z,
          },
          tail: {
            x: draggedTarget.initialTail.x + dx,
            y: draggedTarget.initialTail.y + dy,
            z: draggedTarget.initialTail.z,
          },
        });
      }
    }
  };

  // Mouse Up Handler
  const handleMouseUp = () => {
    setIsPanning(false);
    if (draggedTarget) {
      setDraggedTarget(null);
      if (onCommitHistory) {
        onCommitHistory();
      }
    }
    if (transformMode !== 'none') {
      onSetTransformMode('none');
    }
  };

  // Zoom & 3D Depth Wheel Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    // Shift + Wheel -> Adjust active bone Z-depth (3D pitch foreshortening) directly!
    if (e.shiftKey && activeBoneId) {
      const activeBone = bones.find((b) => b.id === activeBoneId);
      if (activeBone) {
        if (onStartTransform) onStartTransform();
        const deltaZ = e.deltaY < 0 ? 6 : -6;
        const newTailZ = activeBone.tail.z + deltaZ;

        const dx = activeBone.tail.x - activeBone.head.x;
        const dy = activeBone.tail.y - activeBone.head.y;
        const current2dLen = Math.hypot(dx, dy);

        const dz = newTailZ - activeBone.head.z;
        const full3dLen = Math.hypot(dx, dy, activeBone.tail.z - activeBone.head.z) || 50;
        const new2dLen = Math.sqrt(Math.max(10, full3dLen * full3dLen - dz * dz));
        const angle = current2dLen > 0.1 ? Math.atan2(dy, dx) : 0;

        onUpdateBone(activeBone.id, {
          tail: {
            x: activeBone.head.x + Math.cos(angle) * new2dLen,
            y: activeBone.head.y + Math.sin(angle) * new2dLen,
            z: newTailZ,
          },
        });
        return;
      }
    }

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(3, Math.max(0.3, zoom * zoomFactor));

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="relative flex-1 bg-[#09090b] overflow-hidden cursor-crosshair select-none"
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="block w-full h-full"
      />

      {/* Frosted Glass Floating Canvas Overlay Helpers */}
      <div className="absolute left-3 top-3 bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg text-[11px] text-zinc-300 backdrop-blur-md pointer-events-none space-y-0.5 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-orange-400">Joint Selection:</span>
          <span>Click Head / Tail / Body to select point</span>
        </div>
        <div className="text-[10px] text-zinc-400 font-mono">
          <strong>E</strong> = Extrude | <strong>G</strong> = Move | <strong>R</strong> = Rotate | <strong>Shift+Drag/Wheel</strong> = 3D Foreshorten Tilt
        </div>
      </div>

      {/* Selected Joint Indicator Pill */}
      {selectedJoint && (
        <div className="absolute left-3 bottom-3 bg-orange-500/20 border border-orange-500/40 px-3 py-1 rounded-lg text-[11px] font-mono text-orange-300 backdrop-blur-md pointer-events-none flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          <span>
            Selected: <strong>{bones.find((b) => b.id === selectedJoint.boneId)?.name}</strong> [{selectedJoint.part.toUpperCase()}]
          </span>
        </div>
      )}

      {/* Zoom indicator */}
      <div className="absolute right-3 bottom-3 bg-black/40 border border-white/10 px-2.5 py-1 rounded text-[10px] font-mono text-zinc-400 backdrop-blur-md pointer-events-none">
        Zoom: {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};
