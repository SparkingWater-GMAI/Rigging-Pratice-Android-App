import { Bone, PracticeImage, RigValidationIssue, RigValidationResult } from '../types/rigging';

export function validateSkeleton(bones: Bone[], practiceImage?: PracticeImage): RigValidationResult {
  const issues: RigValidationIssue[] = [];
  let score = 100;

  if (bones.length === 0) {
    return {
      score: 0,
      issues: [{
        type: 'error',
        message: 'No bones created yet.',
        suggestion: 'Press E or click "Extrude Bone" / "Single Bone" to place your first bone.'
      }],
      totalBones: 0,
      chainCount: 0,
      hasRoot: false,
      symmetryStatus: 'None'
    };
  }

  // 1. Check for Root bone
  const roots = bones.filter(b => !b.parentId);
  const hasRoot = roots.length >= 1;

  if (roots.length === 0) {
    issues.push({
      type: 'error',
      message: 'No root bone found in skeleton.',
      suggestion: 'Ensure at least one main parent bone (like pelvis or root) has no parent.'
    });
    score -= 25;
  } else if (roots.length > 3 && bones.length > 6) {
    issues.push({
      type: 'warning',
      message: `Multiple unparented root bones (${roots.length} unparented roots).`,
      suggestion: 'Consider parenting floating limb chains or IK targets back to the main Spine/Pelvis root or Root bone with "Keep Offset".'
    });
    score -= 10;
  }

  // 2. Check for Zero-Length or Overlapping Bones
  bones.forEach(b => {
    const dx = b.tail.x - b.head.x;
    const dy = b.tail.y - b.head.y;
    const len = Math.hypot(dx, dy);
    if (len < 10) {
      issues.push({
        type: 'warning',
        boneId: b.id,
        message: `Bone "${b.name}" is extremely short (${Math.round(len)}px).`,
        suggestion: 'Drag the bone tail joint to give it proper length.'
      });
      score -= 5;
    }
  });

  // 3. Check Circular Parenting Loops
  bones.forEach(b => {
    let current: Bone | undefined = b;
    const visited = new Set<string>();
    while (current && current.parentId) {
      if (visited.has(current.id)) {
        issues.push({
          type: 'error',
          boneId: b.id,
          message: `Circular parenting loop detected involving bone "${b.name}".`,
          suggestion: 'Clear parent (Alt+P) or reparent to break the loop cycle.'
        });
        score -= 30;
        break;
      }
      visited.add(current.id);
      current = bones.find(x => x.id === current?.parentId);
    }
  });

  // 4. Symmetry Check
  const leftBones = bones.filter(b => b.name.toLowerCase().endsWith('.l') || b.name.toLowerCase().endsWith('_l') || b.name.toLowerCase().includes('left'));
  const rightBones = bones.filter(b => b.name.toLowerCase().endsWith('.r') || b.name.toLowerCase().endsWith('_r') || b.name.toLowerCase().includes('right'));
  
  let symmetryStatus = 'Asymmetrical';
  if (leftBones.length > 0 && rightBones.length > 0) {
    if (Math.abs(leftBones.length - rightBones.length) <= 1) {
      symmetryStatus = `Balanced (${leftBones.length} L / ${rightBones.length} R)`;
    } else {
      symmetryStatus = `Imbalanced (${leftBones.length} L vs ${rightBones.length} R)`;
      issues.push({
        type: 'info',
        message: 'Limb symmetry imbalance detected.',
        suggestion: 'Use "Symmetrize (.L -> .R)" tool to mirror left bones across the center line.'
      });
    }
  }

  // 5. Check Practice Landmarks if in Practice Mode
  if (practiceImage && practiceImage.landmarks.length > 0) {
    let coveredLandmarks = 0;
    practiceImage.landmarks.forEach(lm => {
      const hit = bones.some(b => {
        const distHead = Math.hypot(b.head.x - lm.position.x, b.head.y - lm.position.y);
        const distTail = Math.hypot(b.tail.x - lm.position.x, b.tail.y - lm.position.y);
        return distHead < 60 || distTail < 60;
      });
      if (hit) coveredLandmarks++;
    });

    const landmarkCoverage = coveredLandmarks / practiceImage.landmarks.length;
    if (landmarkCoverage < 0.5) {
      issues.push({
        type: 'warning',
        message: `Covered ${coveredLandmarks} of ${practiceImage.landmarks.length} suggested landmark areas.`,
        suggestion: 'Extend bone chains to cover key anatomical joints indicated on the image.'
      });
      score -= Math.round((1 - landmarkCoverage) * 20);
    }
  }

  // Calculate chain count
  const chainCount = roots.length;

  return {
    score: Math.max(10, Math.min(100, score)),
    issues,
    totalBones: bones.length,
    chainCount,
    hasRoot,
    symmetryStatus
  };
}
