import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, X, Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';

interface RestTimerProps {
  initialSeconds: number;
  onClose: () => void;
}

/**
 * A floating rest timer component that starts automatically when an exercise is done.
 */
export const RestTimer: React.FC<RestTimerProps> = ({ initialSeconds, onClose }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      // Optional: Play a sound or notification
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (seconds / initialSeconds) * 100;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 right-6 z-[60] w-72 bg-zinc-900 text-white rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden"
    >
      <div className="p-4 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Descanso</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-full transition-colors">
          <X className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      <div className="p-6 flex flex-col items-center gap-4">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-zinc-800"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray="377"
              animate={{ strokeDashoffset: 377 - (377 * progress) / 100 }}
              className="text-brand-500"
            />
          </svg>
          <span className="absolute text-3xl font-black tabular-nums">{formatTime(seconds)}</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSeconds(s => Math.max(0, s - 15))}
            className="p-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsActive(!isActive)}
            className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
          <button 
            onClick={() => setSeconds(s => s + 15)}
            className="p-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={() => { setSeconds(initialSeconds); setIsActive(true); }}
          className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase hover:text-zinc-300 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reiniciar
        </button>
      </div>
    </motion.div>
  );
};
