import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Bone } from '../types/rigging';

interface ThreeDViewportProps {
  bones: Bone[];
  selectedBoneIds: string[];
  activeBoneId: string | null;
  onSelectBone: (id: string, multiSelect: boolean) => void;
  onCloseWindow?: () => void;
  isFloatingWindow?: boolean;
}

export const ThreeDViewport: React.FC<ThreeDViewportProps> = ({
  bones,
  selectedBoneIds,
  activeBoneId,
  onSelectBone,
  onCloseWindow,
  isFloatingWindow = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bonesGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 0.6);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x38bdf8, 0x334155);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Group for Bone Meshes
    const bonesGroup = new THREE.Group();
    scene.add(bonesGroup);
    bonesGroupRef.current = bonesGroup;

    // Simple Orbit Controls using mouse drag
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const domElement = renderer.domElement;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      bonesGroup.rotation.y += deltaX * 0.01;
      bonesGroup.rotation.x += deltaY * 0.01;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.01;
      camera.position.z = Math.max(2, Math.min(40, camera.position.z));
    };

    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('wheel', handleWheel);

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('wheel', handleWheel);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update 3D Bone Meshes when bones or selection changes
  useEffect(() => {
    const group = bonesGroupRef.current;
    if (!group) return;

    // Clear previous
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    bones.forEach((b) => {
      const isSelected = selectedBoneIds.includes(b.id);
      const isActive = activeBoneId === b.id;

      // Convert 2D canvas coordinates (0..800, 0..1000) to 3D Three.js units centered at origin
      const hX = (b.head.x - 400) / 50;
      const hY = (500 - b.head.y) / 50;
      const hZ = (b.head.z || 0) / 50;

      const tX = (b.tail.x - 400) / 50;
      const tY = (500 - b.tail.y) / 50;
      const tZ = (b.tail.z || 0) / 50;

      const headVec = new THREE.Vector3(hX, hY, hZ);
      const tailVec = new THREE.Vector3(tX, tY, tZ);

      // Head sphere
      const headGeom = new THREE.SphereGeometry(0.12, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({
        color: isActive ? 0x00f0ff : isSelected ? 0xf59e0b : 0x38bdf8,
        roughness: 0.3,
        metalness: 0.8,
      });
      const headMesh = new THREE.Mesh(headGeom, headMat);
      headMesh.position.copy(headVec);
      group.add(headMesh);

      // Tail sphere
      const tailGeom = new THREE.SphereGeometry(0.1, 16, 16);
      const tailMesh = new THREE.Mesh(tailGeom, headMat);
      tailMesh.position.copy(tailVec);
      group.add(tailMesh);

      // 3D Octahedral Bone Mesh
      const boneDir = new THREE.Vector3().subVectors(tailVec, headVec);
      const boneLen = boneDir.length();

      if (boneLen > 0.05) {
        // Octahedron geometry
        const octGeom = new THREE.OctahedronGeometry(Math.min(0.4, boneLen * 0.25));
        const octMat = new THREE.MeshStandardMaterial({
          color: isActive ? 0x38bdf8 : isSelected ? 0xd97706 : 0x0284c7,
          roughness: 0.2,
          metalness: 0.6,
          wireframe: false,
        });
        const octMesh = new THREE.Mesh(octGeom, octMat);

        // Orient bone towards tail
        octMesh.position.copy(headVec).add(boneDir.clone().multiplyScalar(0.25));
        octMesh.lookAt(tailVec);
        octMesh.rotation.z += (b.roll * Math.PI) / 180; // Apply roll angle

        group.add(octMesh);
      }

      // Parent offset line if connected: false
      if (b.parentId) {
        const parent = bones.find((p) => p.id === b.parentId);
        if (parent) {
          const pTailX = (parent.tail.x - 400) / 50;
          const pTailY = (500 - parent.tail.y) / 50;
          const pTailZ = (parent.tail.z || 0) / 50;

          const points = [
            new THREE.Vector3(pTailX, pTailY, pTailZ),
            new THREE.Vector3(hX, hY, hZ),
          ];
          const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineDashedMaterial({
            color: 0xf59e0b,
            dashSize: 0.2,
            gapSize: 0.1,
          });
          const line = new THREE.Line(lineGeom, lineMat);
          line.computeLineDistances();
          group.add(line);
        }
      }
    });
  }, [bones, selectedBoneIds, activeBoneId]);

  return (
    <div
      className={`relative bg-[#09090b] overflow-hidden select-none border border-white/10 ${
        isFloatingWindow
          ? 'w-[450px] h-[360px] rounded-xl shadow-2xl backdrop-blur-xl bg-black/60 z-30'
          : 'flex-1 h-full'
      }`}
    >
      {/* Window Titlebar */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/50 border-b border-white/10 flex items-center justify-between px-3 backdrop-blur-md z-20">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
          <span className="text-xs font-bold text-zinc-200 tracking-wide">3D OCTAHEDRAL VIEWPORT</span>
        </div>

        {onCloseWindow && (
          <button
            onClick={onCloseWindow}
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            title="Close 3D Viewport"
          >
            ✕
          </button>
        )}
      </div>

      <div ref={mountRef} className="w-full h-full block pt-8" />

      {/* Floating Helper Label */}
      <div className="absolute left-3 bottom-3 bg-black/40 border border-white/10 px-2.5 py-1 rounded text-[10px] font-mono text-zinc-400 pointer-events-none backdrop-blur-md">
        Left-drag = Orbit 3D | Scroll = Zoom
      </div>
    </div>
  );
};
