export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface SelectedJoint {
  boneId: string;
  part: 'head' | 'tail' | 'body';
}

export interface Bone {
  id: string;
  name: string;
  head: Vector3D;
  tail: Vector3D;
  roll: number; // in degrees (-180 to 180)
  parentId: string | null;
  connected: boolean; // true = tail of parent is head of child; false = keep offset
  color?: string;
  group?: string;
  deform?: boolean;
  visible?: boolean;
  locked?: boolean;
  selected?: boolean;
}

export interface PracticeImage {
  id: string;
  title: string;
  category: 'humanoid' | 'quadruped' | 'monster' | 'wing' | 'hand' | 'mecha' | 'tentacle' | 'face' | 'custom';
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  targetBonesCount: number;
  landmarks: { name: string; position: { x: number; y: number }; description: string }[];
  svgContent?: string;
  dataUrl?: string;
}

export type ActiveTool = 
  | 'select'
  | 'extrude'
  | 'single_bone'
  | 'move'
  | 'rotate'
  | 'scale'
  | 'roll'
  | 'parent'
  | 'subdivide'
  | 'symmetrize';

export type TransformMode = 'none' | 'grab' | 'rotate' | 'scale' | 'roll' | 'extruding';

export type ViewportMode = '2d_only' | 'split' | '3d_only';

export interface RigProject {
  id: string;
  name: string;
  createdTime: number;
  updatedTime: number;
  imageId: string;
  customImageDataUrl?: string;
  bones: Bone[];
}

export interface RigValidationIssue {
  type: 'warning' | 'error' | 'info';
  boneId?: string;
  message: string;
  suggestion: string;
}

export interface RigValidationResult {
  score: number; // 0 to 100
  issues: RigValidationIssue[];
  totalBones: number;
  chainCount: number;
  hasRoot: boolean;
  symmetryStatus: string;
}
