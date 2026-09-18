import { Bone } from '../types/rigging';

/**
 * Propagates movement and joint constraints through bone hierarchy.
 * - Moving body (head & tail): Translates bone and all descendants.
 * - Moving head: If connected to parent, also updates parent's tail.
 * - Moving tail: Also updates any connected children's heads.
 * - Enforces connected joints: child.head === parent.tail.
 */
export function updateBonesWithHierarchy(
  bones: Bone[],
  targetId: string,
  updates: Partial<Bone>
): Bone[] {
  const targetBone = bones.find((b) => b.id === targetId);
  if (!targetBone) return bones;

  // Clone array items into a Map for fast mutations
  const boneMap = new Map<string, Bone>();
  bones.forEach((b) =>
    boneMap.set(b.id, {
      ...b,
      head: { ...b.head },
      tail: { ...b.tail },
    })
  );

  const current = boneMap.get(targetId)!;

  // 1. Moving entire bone body (both head and tail provided)
  if (updates.head && updates.tail) {
    const deltaX = updates.head.x - current.head.x;
    const deltaY = updates.head.y - current.head.y;
    const deltaZ = updates.head.z - current.head.z;

    current.head = { ...updates.head };
    current.tail = { ...updates.tail };
    if (updates.roll !== undefined) current.roll = updates.roll;
    if (updates.parentId !== undefined) current.parentId = updates.parentId;
    if (updates.connected !== undefined) current.connected = updates.connected;
    if (updates.name !== undefined) current.name = updates.name;
    if (updates.color !== undefined) current.color = updates.color;

    // Helper to collect connected descendants recursively
    const getConnectedDescendantIds = (pId: string): string[] => {
      const descendants: string[] = [];
      boneMap.forEach((b) => {
        if (b.parentId === pId && b.connected) {
          descendants.push(b.id);
          descendants.push(...getConnectedDescendantIds(b.id));
        }
      });
      return descendants;
    };

    const connectedDescendantIds = getConnectedDescendantIds(targetId);
    connectedDescendantIds.forEach((dId) => {
      const dBone = boneMap.get(dId);
      if (dBone) {
        dBone.head.x += deltaX;
        dBone.head.y += deltaY;
        dBone.head.z += deltaZ;

        dBone.tail.x += deltaX;
        dBone.tail.y += deltaY;
        dBone.tail.z += deltaZ;
      }
    });

    // If current bone is connected to its parent, moving current bone's body moves parent's tail
    if (current.parentId && current.connected) {
      const parent = boneMap.get(current.parentId);
      if (parent) {
        parent.tail = { ...current.head };
      }
    }
  }
  // 2. Dragging Head only
  else if (updates.head && !updates.tail) {
    current.head = { ...updates.head };
    if (updates.roll !== undefined) current.roll = updates.roll;

    // If connected to parent, dragging child head moves parent's tail
    if (current.parentId && current.connected) {
      const parent = boneMap.get(current.parentId);
      if (parent) {
        parent.tail = { ...current.head };
      }
    }
  }
  // 3. Dragging Tail only
  else if (updates.tail && !updates.head) {
    current.tail = { ...updates.tail };
    if (updates.roll !== undefined) current.roll = updates.roll;

    // Any connected child's head moves with parent's tail
    boneMap.forEach((child) => {
      if (child.parentId === targetId && child.connected) {
        child.head = { ...current.tail };
      }
    });
  }
  // 4. Other property updates (name, parentId, connected, etc.)
  else {
    Object.assign(current, updates);
    if (updates.connected && current.parentId) {
      const parent = boneMap.get(current.parentId);
      if (parent) {
        current.head = { ...parent.tail };
      }
    }
  }

  // Final Pass: Strict enforcement of connected joint positions
  // Run 3 iterations so long chains propagate completely
  for (let iter = 0; iter < 3; iter++) {
    boneMap.forEach((child) => {
      if (child.parentId && child.connected) {
        const parent = boneMap.get(child.parentId);
        if (parent) {
          child.head = { ...parent.tail };
        }
      }
    });
  }

  return Array.from(boneMap.values());
}
