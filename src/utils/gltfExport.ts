import { Bone } from '../types/rigging';

export function generateGLTFJson(bones: Bone[], name = "RigMasterSkeleton") {
  const nodes: any[] = [];

  // Root node
  nodes.push({
    name: name,
    children: []
  });

  const boneNodeIndexMap = new Map<string, number>();

  bones.forEach((bone, idx) => {
    // node index starts at 1 (0 is root node)
    const nodeIdx = idx + 1;
    boneNodeIndexMap.set(bone.id, nodeIdx);

    const hX = (bone.head.x - 400) / 100;
    const hY = (1000 - bone.head.y - 500) / 100;
    const hZ = (bone.head.z || 0) / 100;

    nodes.push({
      name: bone.name,
      translation: [hX, hY, hZ],
      children: []
    });
  });

  // Assign children
  bones.forEach((bone) => {
    const currentIdx = boneNodeIndexMap.get(bone.id);
    if (!currentIdx) return;

    if (bone.parentId && boneNodeIndexMap.has(bone.parentId)) {
      const parentIdx = boneNodeIndexMap.get(bone.parentId)!;
      if (!nodes[parentIdx].children) nodes[parentIdx].children = [];
      nodes[parentIdx].children.push(currentIdx);
    } else {
      // Connect to root node 0
      nodes[0].children.push(currentIdx);
    }
  });

  const gltf = {
    asset: {
      generator: "RigMaster 3D Studio",
      version: "2.0"
    },
    scene: 0,
    scenes: [
      {
        name: "Scene",
        nodes: [0]
      }
    ],
    nodes: nodes
  };

  return JSON.stringify(gltf, null, 2);
}
