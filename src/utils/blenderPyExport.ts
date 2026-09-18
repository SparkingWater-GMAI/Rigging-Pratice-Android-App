import { Bone } from '../types/rigging';

export function generateBlenderPythonScript(bones: Bone[], armatureName = "Armature"): string {
  const lines: string[] = [];

  lines.push(`# =========================================================`);
  lines.push(`# RigMaster 3D - Generated Blender Rigging Script`);
  lines.push(`# Paste this script into Blender's Scripting workspace and click Run.`);
  lines.push(`# =========================================================`);
  lines.push(``);
  lines.push(`import bpy`);
  lines.push(`import math`);
  lines.push(`import mathutils`);
  lines.push(``);
  lines.push(`# Switch to Object Mode if needed`);
  lines.push(`if bpy.context.mode != 'OBJECT':`);
  lines.push(`    bpy.ops.object.mode_set(mode='OBJECT')`);
  lines.push(``);
  lines.push(`# Create armature data and object`);
  lines.push(`arm_data = bpy.data.armatures.new("${armatureName}_Data")`);
  lines.push(`arm_obj = bpy.data.objects.new("${armatureName}", arm_data)`);
  lines.push(`bpy.context.collection.objects.link(arm_obj)`);
  lines.push(`bpy.context.view_layer.objects.active = arm_obj`);
  lines.push(`arm_obj.select_set(True)`);
  lines.push(``);
  lines.push(`# Enter Edit Mode to create bones`);
  lines.push(`bpy.ops.object.mode_set(mode='EDIT')`);
  lines.push(`edit_bones = arm_data.edit_bones`);
  lines.push(``);
  lines.push(`# Dictionary to hold created bone references`);
  lines.push(`created_bones = {}`);
  lines.push(``);

  // First pass: create all edit bones with heads and tails
  lines.push(`# Pass 1: Create Bones and set Head/Tail/Roll`);
  bones.forEach((bone) => {
    // Convert 2D canvas coordinates (0..800, 0..1000) to normalized 3D units (e.g., center at 0, Y up, Z forward/depth)
    const hX = (bone.head.x - 400) / 100;
    const hY = (bone.head.z || 0) / 100;
    const hZ = (1000 - bone.head.y - 500) / 100;

    const tX = (bone.tail.x - 400) / 100;
    const tY = (bone.tail.z || 0) / 100;
    const tZ = (1000 - bone.tail.y - 500) / 100;

    const rollRad = (bone.roll * Math.PI) / 180;

    const safeName = bone.name.replace(/[^a-zA-Z0-9_\.]/g, '_');

    lines.push(`b_${safeName} = edit_bones.new("${safeName}")`);
    lines.push(`b_${safeName}.head = mathutils.Vector((${hX.toFixed(4)}, ${hY.toFixed(4)}, ${hZ.toFixed(4)}))`);
    lines.push(`b_${safeName}.tail = mathutils.Vector((${tX.toFixed(4)}, ${tY.toFixed(4)}, ${tZ.toFixed(4)}))`);
    lines.push(`b_${safeName}.roll = ${rollRad.toFixed(4)}`);
    lines.push(`created_bones["${bone.id}"] = b_${safeName}`);
    lines.push(``);
  });

  // Second pass: setup parenting and connected flags
  lines.push(`# Pass 2: Setup Parenting & Connected Constraints`);
  bones.forEach((bone) => {
    if (bone.parentId) {
      const parentBone = bones.find(b => b.id === bone.parentId);
      if (parentBone) {
        const safeName = bone.name.replace(/[^a-zA-Z0-9_\.]/g, '_');
        const parentSafeName = parentBone.name.replace(/[^a-zA-Z0-9_\.]/g, '_');
        lines.push(`if "${bone.id}" in created_bones and "${parentBone.id}" in created_bones:`);
        lines.push(`    created_bones["${bone.id}"].parent = created_bones["${parentBone.id}"]`);
        lines.push(`    created_bones["${bone.id}"].use_connect = ${bone.connected ? 'True' : 'False'}`);
      }
    }
  });

  lines.push(``);
  lines.push(`# Return to Object mode`);
  lines.push(`bpy.ops.object.mode_set(mode='OBJECT')`);
  lines.push(`print("RigMaster 3D Armature '${armatureName}' created successfully in Blender!")`);

  return lines.join('\n');
}
