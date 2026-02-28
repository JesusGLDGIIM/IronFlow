import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { RoutineDay } from '../../types';

interface ManualAssignmentModalProps {
  dateStr: string | null;
  availableDays: RoutineDay[];
  onClose: () => void;
  onAssign: (dateStr: string, dayId: string) => void;
}

/**
 * Modal for manually assigning a workout day to a specific date.
 */
export const ManualAssignmentModal: React.FC<ManualAssignmentModalProps> = ({
  dateStr,
  availableDays,
  onClose,
  onAssign
}) => {
  if (!dateStr) return null;

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
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Asignar Entrenamiento</h3>
            <p className="text-zinc-500 text-sm">
              Selecciona un día para el {format(parseISO(dateStr), "d 'de' MMMM", { locale: es })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-3">
          {availableDays.map(day => (
            <button
              key={day.id}
              onClick={() => onAssign(dateStr, day.id)}
              className="w-full text-left p-4 rounded-xl border border-zinc-200 hover:border-brand-500 hover:bg-brand-50 transition-all group"
            >
              <h4 className="font-bold text-zinc-900 group-hover:text-brand-700">{day.title}</h4>
              <p className="text-xs text-zinc-500 line-clamp-1">{day.description}</p>
            </button>
          ))}
          {availableDays.length === 0 && (
            <p className="text-center py-4 text-sm text-zinc-400">No hay días disponibles para asignar.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
