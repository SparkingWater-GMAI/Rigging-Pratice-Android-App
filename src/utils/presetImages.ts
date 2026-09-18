import { PracticeImage } from '../types/rigging';

// High quality vector artwork templates encoded as SVG data URLs for instant offline loading

const humanoidSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <linearGradient id="humanoidBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
    <linearGradient id="armorGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="800" height="1000" fill="url(#humanoidBg)"/>
  
  <!-- Grid guide background -->
  <g stroke="#374151" stroke-width="1" opacity="0.3">
    <path d="M 0 500 L 800 500 M 400 0 L 400 1000"/>
    <circle cx="400" cy="500" r="350" fill="none" stroke="#4b5563" stroke-dasharray="8 8"/>
  </g>

  <!-- Silhouette / Character Graphic -->
  <g id="character_mesh" stroke="#38bdf8" stroke-width="2" fill="#1e293b" fill-opacity="0.8">
    <!-- Head -->
    <path d="M 370 120 C 370 80, 430 80, 430 120 C 430 160, 410 180, 400 185 C 390 180, 370 160, 370 120 Z" fill="#334155"/>
    <circle cx="400" cy="120" r="30" fill="none" stroke="#60a5fa"/>
    <!-- Visor -->
    <path d="M 380 120 Q 400 115 420 120 Q 400 135 380 120" fill="url(#armorGlow)"/>

    <!-- Neck -->
    <path d="M 388 185 L 412 185 L 415 210 L 385 210 Z" fill="#1e293b"/>

    <!-- Shoulders & Torso -->
    <path d="M 310 230 Q 400 210 490 230 L 470 360 Q 400 370 330 360 Z" fill="#334155"/>
    <!-- Chest Plate -->
    <path d="M 340 235 L 460 235 L 440 310 L 400 330 L 360 310 Z" fill="#0f172a" stroke="#00f0ff" stroke-width="1.5"/>

    <!-- Pelvis -->
    <path d="M 335 365 L 465 365 L 440 450 L 360 450 Z" fill="#1e293b"/>

    <!-- Left Arm -->
    <g id="arm_left">
      <!-- Upper Arm -->
      <path d="M 300 235 L 240 340 L 270 350 L 320 250 Z" fill="#334155"/>
      <!-- Shoulder Pad L -->
      <path d="M 290 215 Q 260 220 270 260 Q 320 250 310 220 Z" fill="#0284c7"/>
      <!-- Forearm -->
      <path d="M 240 345 L 180 460 L 210 470 L 270 355 Z" fill="#1e293b"/>
      <!-- Hand L -->
      <path d="M 175 465 L 150 510 L 180 520 L 205 475 Z" fill="#38bdf8"/>
    </g>

    <!-- Right Arm -->
    <g id="arm_right">
      <!-- Upper Arm -->
      <path d="M 500 235 L 560 340 L 530 350 L 480 250 Z" fill="#334155"/>
      <!-- Shoulder Pad R -->
      <path d="M 510 215 Q 540 220 530 260 Q 480 250 490 220 Z" fill="#0284c7"/>
      <!-- Forearm -->
      <path d="M 560 345 L 620 460 L 590 470 L 530 355 Z" fill="#1e293b"/>
      <!-- Hand R -->
      <path d="M 625 465 L 650 510 L 620 520 L 595 475 Z" fill="#38bdf8"/>
    </g>

    <!-- Left Leg -->
    <g id="leg_left">
      <!-- Thigh L -->
      <path d="M 345 450 L 320 620 L 370 630 L 395 450 Z" fill="#334155"/>
      <!-- Shin L -->
      <path d="M 320 630 L 310 820 L 360 820 L 370 630 Z" fill="#1e293b"/>
      <!-- Foot L -->
      <path d="M 310 820 L 260 880 L 360 880 L 360 820 Z" fill="#0284c7"/>
    </g>

    <!-- Right Leg -->
    <g id="leg_right">
      <!-- Thigh R -->
      <path d="M 455 450 L 480 620 L 430 630 L 405 450 Z" fill="#334155"/>
      <!-- Shin R -->
      <path d="M 480 630 L 490 820 L 440 820 L 430 630 Z" fill="#1e293b"/>
      <!-- Foot R -->
      <path d="M 490 820 L 540 880 L 440 880 L 440 820 Z" fill="#0284c7"/>
    </g>
  </g>

  <!-- Landmark Helper Nodes -->
  <g id="landmarks" opacity="0.8">
    <circle cx="400" cy="400" r="6" fill="#ef4444" filter="url(#glow)"/>
    <text x="412" y="405" fill="#f87171" font-size="12" font-family="sans-serif">Root / Pelvis</text>

    <circle cx="400" cy="220" r="5" fill="#3b82f6"/>
    <text x="412" y="225" fill="#60a5fa" font-size="12" font-family="sans-serif">Chest / Neck Base</text>

    <circle cx="280" cy="240" r="5" fill="#10b981"/>
    <text x="210" y="230" fill="#34d399" font-size="12" font-family="sans-serif">Shoulder.L</text>

    <circle cx="520" cy="240" r="5" fill="#10b981"/>
    <text x="532" y="230" fill="#34d399" font-size="12" font-family="sans-serif">Shoulder.R</text>

    <circle cx="345" cy="625" r="5" fill="#f59e0b"/>
    <text x="280" y="630" fill="#fbbf24" font-size="12" font-family="sans-serif">Knee.L</text>

    <circle cx="455" cy="625" r="5" fill="#f59e0b"/>
    <text x="470" y="630" fill="#fbbf24" font-size="12" font-family="sans-serif">Knee.R</text>
  </g>
</svg>
`;

const quadrupedSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
  <rect width="1000" height="700" fill="#0f172a"/>
  
  <g stroke="#334155" stroke-width="1" opacity="0.4">
    <path d="M 0 350 L 1000 350 M 500 0 L 500 700"/>
  </g>

  <!-- Creature Body Silhouette -->
  <g stroke="#f43f5e" stroke-width="2" fill="#1e1b4b" fill-opacity="0.85">
    <!-- Tail -->
    <path d="M 120 280 C 180 320, 220 260, 290 280 Q 230 330, 120 280 Z" fill="#431407"/>

    <!-- Spine / Main Body -->
    <path d="M 280 270 Q 420 220, 600 240 Q 680 260, 720 300 Q 650 420, 500 400 Q 350 410, 280 350 Z" fill="#312e81"/>

    <!-- Head & Neck -->
    <path d="M 600 240 Q 680 180, 750 160 Q 820 180, 850 240 Q 780 290, 700 290 Z" fill="#4338ca"/>
    <!-- Snout & Jaw -->
    <path d="M 750 160 L 880 210 L 860 250 L 780 250 Z" fill="#6366f1"/>

    <!-- Front Left Leg -->
    <path d="M 620 320 L 660 450 L 630 580 L 590 580 L 610 460 L 570 340 Z" fill="#4f46e5"/>

    <!-- Front Right Leg (Offset) -->
    <path d="M 680 330 L 720 460 L 690 590 L 650 590 L 670 470 L 630 350 Z" opacity="0.6" fill="#3730a3"/>

    <!-- Hind Left Leg -->
    <path d="M 320 310 L 260 430 L 320 560 L 280 570 L 220 420 L 280 300 Z" fill="#4f46e5"/>

    <!-- Hind Right Leg (Offset) -->
    <path d="M 360 320 L 300 440 L 360 570 L 320 580 L 260 430 L 320 310 Z" opacity="0.6" fill="#3730a3"/>
  </g>

  <!-- Landmark Guides -->
  <g fill="#fb7185">
    <circle cx="320" cy="290" r="6"/>
    <text x="330" y="280" fill="#f43f5e" font-size="12" font-family="sans-serif">Pelvis Root</text>
    <circle cx="600" cy="250" r="6"/>
    <text x="610" y="240" fill="#f43f5e" font-size="12" font-family="sans-serif">Chest / Withers</text>
    <circle cx="760" cy="180" r="6"/>
    <text x="770" y="170" fill="#f43f5e" font-size="12" font-family="sans-serif">Neck / Head Base</text>
  </g>
</svg>
`;

const dragonWingSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700" width="900" height="700">
  <rect width="900" height="700" fill="#064e3b"/>
  
  <!-- Dragon / Bat Wing Structure -->
  <g stroke="#10b981" stroke-width="2" fill="#022c22">
    <!-- Main Arm/Humerus -->
    <path d="M 150 500 Q 250 350, 380 200 L 420 220 Q 280 380, 180 520 Z" fill="#065f46"/>
    
    <!-- Forearm / Radius -->
    <path d="M 380 200 Q 550 180, 720 120 L 730 145 Q 560 210, 420 220 Z" fill="#047857"/>

    <!-- Wing Finger 1 (Top) -->
    <path d="M 720 120 Q 780 250, 850 420 L 830 430 Q 760 270, 710 135 Z" fill="#10b981" opacity="0.7"/>

    <!-- Wing Finger 2 (Middle) -->
    <path d="M 720 120 Q 680 320, 650 580 L 630 580 Q 660 330, 705 130 Z" fill="#10b981" opacity="0.7"/>

    <!-- Wing Finger 3 (Inner) -->
    <path d="M 720 120 Q 500 350, 420 620 L 400 610 Q 480 340, 700 125 Z" fill="#10b981" opacity="0.7"/>

    <!-- Wing Membrane Webbing -->
    <path d="M 150 500 Q 300 480, 400 610 Q 520 500, 630 580 Q 740 500, 830 430 Q 780 250, 720 120 Q 500 180, 380 200 Z" fill="#064e3b" opacity="0.5" stroke="#34d399" stroke-linecap="round" stroke-dasharray="4 4"/>
  </g>

  <g fill="#a7f3d0">
    <circle cx="150" cy="500" r="7"/>
    <text x="160" y="520" font-size="12" font-family="sans-serif">Wing Base / Shoulder</text>
    <circle cx="380" cy="200" r="7"/>
    <text x="310" y="180" font-size="12" font-family="sans-serif">Elbow Joint</text>
    <circle cx="720" cy="120" r="7"/>
    <text x="735" y="110" font-size="12" font-family="sans-serif">Wrist / Claws Center</text>
  </g>
</svg>
`;

const handSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="800" height="900">
  <rect width="800" height="900" fill="#18181b"/>

  <g stroke="#e4e4e7" stroke-width="2" fill="#27272a">
    <!-- Forearm -->
    <path d="M 320 880 L 340 680 L 460 680 L 480 880 Z"/>

    <!-- Palm -->
    <path d="M 330 680 C 280 620, 270 520, 320 450 L 480 450 C 530 520, 510 620, 470 680 Z" fill="#3f3f46"/>

    <!-- Thumb -->
    <path d="M 290 620 L 200 560 L 160 470 L 200 450 L 250 520 L 310 560 Z" fill="#52525b"/>

    <!-- Index Finger -->
    <path d="M 320 450 L 300 320 L 290 220 L 280 140 L 320 140 L 330 220 L 345 320 L 360 450 Z" fill="#52525b"/>

    <!-- Middle Finger -->
    <path d="M 370 450 L 380 300 L 385 180 L 385 80 L 420 80 L 420 180 L 415 300 L 410 450 Z" fill="#52525b"/>

    <!-- Ring Finger -->
    <path d="M 420 450 L 440 310 L 450 200 L 455 120 L 490 120 L 485 200 L 470 310 L 460 450 Z" fill="#52525b"/>

    <!-- Pinky Finger -->
    <path d="M 465 460 L 500 350 L 520 270 L 530 200 L 560 210 L 550 280 L 530 360 L 495 470 Z" fill="#52525b"/>
  </g>

  <g fill="#a1a1aa" font-size="12" font-family="sans-serif">
    <circle cx="400" cy="680" r="5" fill="#ef4444"/>
    <text x="415" y="685" fill="#f87171">Wrist Joint</text>
    <circle cx="390" cy="450" r="5" fill="#eab308"/>
    <text x="405" y="445" fill="#fde047">Knuckles Row (MCP)</text>
  </g>
</svg>
`;

const foreshortenedSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1000" width="900" height="1000">
  <defs>
    <linearGradient id="actionBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="fistGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <filter id="fistBloom">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="900" height="1000" fill="url(#actionBg)"/>

  <!-- Perspective Grid Lines -->
  <g stroke="#1e293b" stroke-width="1.5" opacity="0.6">
    <line x1="450" y1="200" x2="50" y2="950"/>
    <line x1="450" y1="200" x2="250" y2="950"/>
    <line x1="450" y1="200" x2="450" y2="950"/>
    <line x1="450" y1="200" x2="650" y2="950"/>
    <line x1="450" y1="200" x2="850" y2="950"/>
    <circle cx="450" cy="500" r="300" fill="none" stroke="#334155" stroke-dasharray="6 6"/>
  </g>

  <!-- Receding Body Mesh (Tilted back in 3D Depth) -->
  <g stroke="#f97316" stroke-width="2" fill="#1e293b" fill-opacity="0.9">
    <!-- Receding Head (Smaller due to depth) -->
    <circle cx="520" cy="220" r="38" fill="#334155" stroke="#fb923c"/>
    <!-- Visor -->
    <path d="M 495 215 Q 520 210 545 220 Q 520 235 495 215" fill="#f97316"/>

    <!-- Torso / Chest (Angled away) -->
    <path d="M 430 280 L 590 270 L 550 420 L 420 410 Z" fill="#1e293b" stroke="#f97316"/>
    <!-- Chest Core Plate -->
    <path d="M 460 290 L 560 285 L 530 370 L 450 365 Z" fill="#0f172a" stroke="#fbbf24" stroke-width="1.5"/>

    <!-- Left Arm (Receding Back in Z-depth) -->
    <path d="M 590 270 L 700 310 L 680 380 L 580 340 Z" fill="#0f172a" stroke="#64748b"/>
    <path d="M 700 310 L 770 380 L 740 430 L 680 380 Z" fill="#0284c7" stroke="#38bdf8"/>

    <!-- Receding Left Leg (Far Away, Small Foot) -->
    <path d="M 510 415 L 620 580 L 570 600 L 480 420 Z" fill="#1f2937"/>
    <path d="M 620 580 L 680 780 L 640 800 L 570 600 Z" fill="#111827"/>
    <path d="M 680 780 L 730 830 L 630 830 Z" fill="#334155"/>

    <!-- Forward Right Leg (Stepping Forward with Large Boot) -->
    <path d="M 420 410 L 330 600 L 250 580 L 350 410 Z" fill="#334155" stroke="#fbbf24"/>
    <path d="M 330 600 L 210 820 L 120 790 L 250 580 Z" fill="#1e293b" stroke="#f97316" stroke-width="2.5"/>
    <!-- Giant Foreshortened Front Boot -->
    <path d="M 210 820 L 80 940 L 280 960 L 310 850 Z" fill="url(#fistGlow)" stroke="#ffffff" stroke-width="2"/>

    <!-- DRAMATIC FORESHORTENED RIGHT ARM (Reaching Directly at Viewer!) -->
    <!-- Shoulder Connection -->
    <path d="M 430 280 L 330 300 L 350 380 L 430 350 Z" fill="#334155"/>
    <!-- Foreshortened Upper Arm (Visually short overlapping cylinder) -->
    <path d="M 330 300 L 260 340 L 280 430 L 350 380 Z" fill="#0284c7" stroke="#00f0ff" stroke-width="2"/>
    <!-- Foreshortened Forearm (Broadening rapidly as it approaches camera) -->
    <path d="M 260 340 L 150 420 L 190 580 L 280 430 Z" fill="#0369a1" stroke="#38bdf8" stroke-width="3"/>

    <!-- GIANT FORESHORTENED POWER FIST (Foreground Focal Point) -->
    <g filter="url(#fistBloom)">
      <!-- Main Palm/Knuckles Block -->
      <path d="M 150 420 L 20 500 L 80 720 L 240 660 L 190 580 Z" fill="url(#fistGlow)" stroke="#ffffff" stroke-width="3"/>
      <!-- Individual Clenched Knuckles (Large Foreground Cylinders) -->
      <rect x="20" y="480" width="70" height="90" rx="15" fill="#f97316" stroke="#ffffff" stroke-width="2"/>
      <rect x="80" y="460" width="80" height="100" rx="15" fill="#fbbf24" stroke="#ffffff" stroke-width="2"/>
      <rect x="150" y="470" width="75" height="95" rx="15" fill="#f97316" stroke="#ffffff" stroke-width="2"/>
      <!-- Clenched Thumb -->
      <path d="M 120 590 Q 200 620 220 540 Q 170 510 120 590 Z" fill="#ea580c" stroke="#ffffff" stroke-width="2"/>
    </g>
  </g>

  <!-- Depth Annotation Overlay Guides -->
  <g font-family="monospace" font-size="11" font-weight="bold">
    <!-- Fist Z-Depth Tag -->
    <rect x="20" y="420" width="160" height="24" rx="4" fill="#0f172a" stroke="#ef4444"/>
    <text x="30" y="436" fill="#f87171">+180px Front Depth (Fist)</text>

    <!-- Shoulder Z-Depth Tag -->
    <rect x="420" y="245" width="160" height="24" rx="4" fill="#0f172a" stroke="#38bdf8"/>
    <text x="430" y="261" fill="#38bdf8">0px Center Depth (Torso)</text>

    <!-- Receding Left Leg Z-Depth Tag -->
    <rect x="650" y="740" width="170" height="24" rx="4" fill="#0f172a" stroke="#64748b"/>
    <text x="660" y="756" fill="#94a3b8">-140px Receding Depth (Leg)</text>
  </g>
</svg>
`;

function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

export const PRESET_PRACTICE_IMAGES: PracticeImage[] = [
  {
    id: 'preset_foreshortened',
    title: 'Dynamic Foreshortened Fighter',
    category: 'humanoid',
    description: 'Extreme foreshortening perspective pose with giant foreground fist and forward stepping boot. Perfect for practicing 3D depth pitch and foreshortening tilt adjustments.',
    difficulty: 'Advanced',
    targetBonesCount: 18,
    svgContent: foreshortenedSVG,
    dataUrl: svgToDataUrl(foreshortenedSVG),
    landmarks: [
      { name: 'Giant Foreground Fist', position: { x: 120, y: 550 }, description: '+180px Z-depth extreme foreshortened right arm' },
      { name: 'Forward Boot', position: { x: 210, y: 880 }, description: '+120px Z-depth forward right foot' },
      { name: 'Chest / Core', position: { x: 500, y: 330 }, description: '0px center plane root' },
      { name: 'Receding Arm', position: { x: 700, y: 350 }, description: '-90px Z-depth left arm angled back' },
      { name: 'Receding Foot', position: { x: 680, y: 810 }, description: '-140px Z-depth far left foot' },
    ],
  },
  {
    id: 'preset_humanoid',
    title: 'Heroic Sci-Fi Humanoid',
    category: 'humanoid',
    description: 'Standard 2足 (bipedal) character mesh with armor plates. Great for practicing standard biped rig hierarchy, IK targets, and arm/leg chains.',
    difficulty: 'Beginner',
    targetBonesCount: 18,
    svgContent: humanoidSVG,
    dataUrl: svgToDataUrl(humanoidSVG),
    landmarks: [
      { name: 'Root / Pelvis', position: { x: 400, y: 400 }, description: 'Center of mass & pelvis root' },
      { name: 'Spine Chain', position: { x: 400, y: 310 }, description: 'Spine.01 to Spine.03 up to Chest' },
      { name: 'Neck & Head', position: { x: 400, y: 150 }, description: 'Neck base and Head bone' },
      { name: 'Left Arm Chain', position: { x: 300, y: 240 }, description: 'Clavicle.L -> Shoulder.L -> Elbow.L -> Wrist.L' },
      { name: 'Right Arm Chain', position: { x: 500, y: 240 }, description: 'Clavicle.R -> Shoulder.R -> Elbow.R -> Wrist.R' },
      { name: 'Left Leg Chain', position: { x: 345, y: 450 }, description: 'Hip.L -> Knee.L -> Ankle.L -> Foot.L' },
      { name: 'Right Leg Chain', position: { x: 455, y: 450 }, description: 'Hip.R -> Knee.R -> Ankle.R -> Foot.R' },
    ],
  },
  {
    id: 'preset_quadruped',
    title: 'Shadow Beast (Quadruped)',
    category: 'quadruped',
    description: 'Four-legged creature with tail and elongated neck. Practice quadruped leg mechanics, scapula offset bones, and tail bone chains.',
    difficulty: 'Intermediate',
    targetBonesCount: 22,
    svgContent: quadrupedSVG,
    dataUrl: svgToDataUrl(quadrupedSVG),
    landmarks: [
      { name: 'Pelvis Root', position: { x: 320, y: 290 }, description: 'Hind legs parent root' },
      { name: 'Chest Withers', position: { x: 600, y: 250 }, description: 'Front shoulder & neck root' },
      { name: 'Tail Chain', position: { x: 200, y: 280 }, description: '3-5 bone flex tail' },
      { name: 'Front Leg Chain', position: { x: 630, y: 350 }, description: 'Scapula -> Elbow -> Wrist -> Paw' },
      { name: 'Hind Leg Chain', position: { x: 300, y: 310 }, description: 'Hip -> Stifle -> Hock -> Paw' },
    ],
  },
  {
    id: 'preset_wing',
    title: 'Dragon Wing & Membrane',
    category: 'wing',
    description: 'Complex winged appendage with humerus, radius, carpals, and multiple long finger bone chains.',
    difficulty: 'Advanced',
    targetBonesCount: 16,
    svgContent: dragonWingSVG,
    dataUrl: svgToDataUrl(dragonWingSVG),
    landmarks: [
      { name: 'Shoulder Base', position: { x: 150, y: 500 }, description: 'Main wing attachment' },
      { name: 'Elbow Joint', position: { x: 380, y: 200 }, description: 'Humerus -> Forearm bend' },
      { name: 'Wrist Center', position: { x: 720, y: 120 }, description: 'Finger root hub & claws' },
      { name: 'Finger 1 Chain', position: { x: 800, y: 300 }, description: 'Top wing finger spine' },
      { name: 'Finger 2 Chain', position: { x: 660, y: 400 }, description: 'Middle wing finger spine' },
      { name: 'Finger 3 Chain', position: { x: 500, y: 450 }, description: 'Inner wing finger spine' },
    ],
  },
  {
    id: 'preset_hand',
    title: 'Anatomical Hand & Phalanges',
    category: 'hand',
    description: 'Detailed 5-finger anatomical hand. Master metacarpal offset roots, finger phalange chains, and thumb rotation.',
    difficulty: 'Intermediate',
    targetBonesCount: 20,
    svgContent: handSVG,
    dataUrl: svgToDataUrl(handSVG),
    landmarks: [
      { name: 'Wrist', position: { x: 400, y: 680 }, description: 'Hand root joint' },
      { name: 'Thumb Chain', position: { x: 220, y: 530 }, description: '3 thumb phalange bones' },
      { name: 'Index Chain', position: { x: 320, y: 300 }, description: 'Metacarpal + 3 phalanges' },
      { name: 'Middle Chain', position: { x: 400, y: 280 }, description: 'Metacarpal + 3 phalanges' },
      { name: 'Ring Chain', position: { x: 460, y: 290 }, description: 'Metacarpal + 3 phalanges' },
      { name: 'Pinky Chain', position: { x: 520, y: 320 }, description: 'Metacarpal + 3 phalanges' },
    ],
  },
];
