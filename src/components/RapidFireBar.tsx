import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  Award, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PracticeImage, Bone } from '../types/rigging';
import confetti from 'canvas-confetti';

interface RapidFireBarProps {
  practiceImages: PracticeImage[];
  currentImageIndex: number;
  onSelectImageIndex: (index: number) => void;
  bones: Bone[];
  validationScore: number;
  onCloseBar: () => void;
}

export const RapidFireBar: React.FC<RapidFireBarProps> = ({
  practiceImages,
  currentImageIndex,
  onSelectImageIndex,
  bones,
  validationScore,
  onCloseBar,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  const currentImage = practiceImages[currentImageIndex];

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleNextImage = () => {
    setSeconds(0);
    setIsRunning(true);
    setExerciseCompleted(false);
    onSelectImageIndex((currentImageIndex + 1) % practiceImages.length);
  };

  const handlePrevImage = () => {
    setSeconds(0);
    setIsRunning(true);
    setExerciseCompleted(false);
    onSelectImageIndex((currentImageIndex - 1 + practiceImages.length) % practiceImages.length);
  };

  const handleFinishExercise = () => {
    setIsRunning(false);
    setExerciseCompleted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.2 }
    });
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black/40 border-b border-orange-500/30 backdrop-blur-md px-4 py-2 flex items-center justify-between text-zinc-200 select-none text-xs z-30 shadow-lg">
      {/* Exercise Title & Image Selector */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2.5 py-1 rounded-lg font-bold tracking-wide">
          <Zap className="w-4 h-4 fill-orange-400 text-orange-400" />
          <span>RAPID FIRE EXERCISE #{currentImageIndex + 1}</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevImage}
            className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
            title="Previous Exercise"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-semibold text-zinc-100 text-sm">{currentImage?.title}</span>

          <button
            onClick={handleNextImage}
            className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
            title="Next Exercise"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="text-zinc-400 text-[11px] hidden lg:inline">
          Target: <strong className="text-orange-400">{currentImage?.targetBonesCount} bones</strong>
        </span>
      </div>

      {/* Timer & Landmark Checklist Status */}
      <div className="flex items-center space-x-4">
        {/* Stopwatch */}
        <div className="flex items-center space-x-2 bg-black/40 px-3 py-1 rounded-lg border border-white/10 font-mono text-sm backdrop-blur-md">
          <span className="text-orange-400 font-bold">{formatTime(seconds)}</span>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setSeconds(0)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress landmark hint */}
        <div className="flex items-center space-x-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 text-[11px] backdrop-blur-md">
          <Target className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-zinc-400">Target Landmarks:</span>
          <span className="font-bold text-orange-300">
            {bones.length} / {currentImage?.targetBonesCount}
          </span>
        </div>

        {/* Finish / Next Exercise */}
        {exerciseCompleted ? (
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-bold flex items-center space-x-1 animate-bounce">
              <Award className="w-4 h-4" />
              <span>Great Job! Score: {validationScore}%</span>
            </span>
            <button
              onClick={handleNextImage}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white px-3 py-1 rounded-lg font-bold flex items-center space-x-1.5 shadow-md"
            >
              <span>Next Image</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleFinishExercise}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg font-bold flex items-center space-x-1.5 shadow-md transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submit Rig</span>
          </button>
        )}
      </div>
    </div>
  );
};
