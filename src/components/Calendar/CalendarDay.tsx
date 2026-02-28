import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Plus, Dumbbell, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { RoutineDay, ScheduledDay } from '../../types';

interface CalendarDayProps {
  day: Date;
  dateStr: string;
  scheduled?: ScheduledDay;
  routineDay?: RoutineDay;
  onToggleDone: (dateStr: string) => void;
  onRemove: (dateStr: string) => void;
  onShowDetails: (day: RoutineDay, date: string) => void;
  onAddClick: () => void;
}

/**
 * A drop target for the weekly calendar representing a single day.
 */
export const CalendarDay: React.FC<CalendarDayProps> = ({ 
  day, 
  dateStr, 
  scheduled, 
  routineDay, 
  onToggleDone, 
  onRemove, 
  onShowDetails, 
  onAddClick 
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${dateStr}`,
  });

  const isCompleted = useMemo(() => {
    if (!scheduled || !routineDay) return false;
    return routineDay.exercises.length > 0 && scheduled.completedExerciseIds.length === routineDay.exercises.length;
  }, [scheduled, routineDay]);

  const status = useMemo(() => {
    if (!scheduled) return null;
    if (isCompleted) return 'completed';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = parseISO(dateStr);
    if (targetDate < today) return 'missed';
    return 'pending';
  }, [scheduled, isCompleted, dateStr]);

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-h-[160px] sm:min-h-[200px] rounded-2xl border transition-all relative group",
        isToday(day) ? "bg-brand-50/30 border-brand-200" : "bg-white border-zinc-200",
        isOver ? "border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/50" : "hover:border-brand-300"
      )}
    >
      {/* Day Header */}
      <div className="p-3 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
            {format(day, 'eee', { locale: es })}
          </span>
          <span className={cn(
            "text-lg font-bold",
            isToday(day) ? "text-brand-600" : "text-zinc-900"
          )}>
            {format(day, 'd')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {scheduled && (
            <button 
              onClick={() => onToggleDone(dateStr)}
              className={cn(
                "transition-colors p-1",
                isCompleted ? "text-brand-500" : status === 'missed' ? "text-red-400" : "text-zinc-200 hover:text-zinc-300"
              )}
              title={isCompleted ? "Completado" : status === 'missed' ? "No realizado" : "Pendiente"}
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
          {!scheduled && (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={onAddClick}
              className="p-1 text-brand-500 hover:text-brand-600 transition-colors md:opacity-0 group-hover:opacity-100"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-2 flex flex-col gap-2">
        {routineDay ? (
          <motion.div
            layoutId={`scheduled-${dateStr}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "p-3 rounded-xl border flex flex-col gap-2 relative group/card cursor-pointer",
              isCompleted ? "bg-brand-50 border-brand-100" : status === 'missed' ? "bg-red-50 border-red-100" : "bg-white border-zinc-100 shadow-sm"
            )}
            onClick={() => onShowDetails(routineDay, dateStr)}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(dateStr); }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
            <h5 className={cn(
              "text-xs font-bold truncate",
              isCompleted ? "text-brand-700" : status === 'missed' ? "text-red-700" : "text-zinc-900"
            )}>
              {routineDay.title}
            </h5>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                <Dumbbell className="w-3 h-3" />
                {scheduled.completedExerciseIds.length}/{routineDay.exercises.length}
              </div>
              {status === 'missed' && !isCompleted && (
                <span className="text-[8px] font-bold text-red-400 uppercase">Incumplido</span>
              )}
            </div>
          </motion.div>
        ) : (
          <div 
            onClick={onAddClick}
            className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-50 rounded-xl group-hover:border-zinc-100 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-zinc-100 group-hover:text-zinc-200" />
          </div>
        )}
      </div>
    </div>
  );
};
