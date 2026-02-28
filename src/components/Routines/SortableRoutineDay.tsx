import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Dumbbell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { RoutineDay } from '../../types';

interface SortableRoutineDayProps {
  day: RoutineDay;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * A draggable routine day component for the sidebar.
 */
export const SortableRoutineDay: React.FC<SortableRoutineDayProps> = ({ day, isSelected, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: day.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col p-4 rounded-xl border transition-all cursor-pointer",
        isSelected ? "bg-brand-50 border-brand-500 ring-1 ring-brand-500" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-zinc-900 truncate">{day.title}</h4>
        <div {...attributes} {...listeners} className="p-1 hover:bg-zinc-100 rounded drag-handle">
          <GripVertical className="w-4 h-4 text-zinc-400" />
        </div>
      </div>
      <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{day.description}</p>
      <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
        <Dumbbell className="w-3 h-3" />
        {day.exercises.length} Ejercicios
      </div>
    </div>
  );
};
