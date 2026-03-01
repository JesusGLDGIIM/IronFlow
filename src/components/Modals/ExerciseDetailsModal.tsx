import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { RoutineDay, ScheduledDay } from '../../types';

interface ExerciseDetailsModalProps {
  selectedDay: { day: RoutineDay, date?: string } | null;
  schedule: ScheduledDay[];
  onClose: () => void;
  onToggleExercise: (dateStr: string, exerciseId: string) => void;
}

/**
 * Modal for viewing exercise details and marking them as completed.
 */
export const ExerciseDetailsModal: React.FC<ExerciseDetailsModalProps> = ({
  selectedDay,
  schedule,
  onClose,
  onToggleExercise
}) => {
  if (!selectedDay) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-brand-600 text-white">
          <div>
            <h3 className="text-xl font-bold">{selectedDay.day.title}</h3>
            <p className="text-brand-100 text-sm">{selectedDay.day.description}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {selectedDay.day.exercises.map((ex, idx) => {
              const isDone = selectedDay.date && schedule.find(s => s.date === selectedDay.date)?.completedExerciseIds.includes(ex.id);
              
              return (
                <div 
                  key={ex.id} 
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                    isDone ? "bg-brand-50 border-brand-100" : "bg-zinc-50 border-zinc-100"
                  )}
                  onClick={() => selectedDay.date && onToggleExercise(selectedDay.date, ex.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-colors",
                      isDone ? "bg-brand-500 border-brand-500 text-white" : "bg-white border-zinc-200 text-zinc-400"
                    )}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    {ex.imageUrl && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-100 bg-white shrink-0">
                        <img 
                          src={ex.imageUrl} 
                          alt={ex.name} 
                          className="w-full h-full object-contain p-1"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-bold transition-colors truncate",
                        isDone ? "text-brand-700" : "text-zinc-900"
                      )}>{ex.name}</h4>
                      <p className="text-[10px] text-zinc-400 italic leading-tight mb-1 truncate">
                        {ex.muscles}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {(!ex.type || ex.type === 'strength') ? (
                          <>
                            <span className="text-xs text-zinc-500 font-medium">
                              <span className="text-brand-600 font-bold">{ex.sets}</span> Series
                            </span>
                            <span className="text-xs text-zinc-500 font-medium">
                              <span className="text-brand-600 font-bold">{ex.reps}</span> Reps
                            </span>
                            <span className="text-xs text-zinc-500 font-medium">
                              <span className="text-brand-600 font-bold">{ex.weight}</span>
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-zinc-500 font-medium">
                              <span className="text-brand-600 font-bold">{ex.duration}</span> min
                            </span>
                            <span className="text-xs text-zinc-500 font-medium">
                              Intensidad <span className="text-brand-600 font-bold capitalize">{ex.intensity === 'low' ? 'Baja' : ex.intensity === 'medium' ? 'Media' : 'Alta'}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {selectedDay.day.exercises.length === 0 && (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                <p className="text-zinc-400">No hay ejercicios para este día.</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 bg-zinc-50 border-t border-zinc-100">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </div>
  );
};
