import React from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, X, Dumbbell, Timer, RotateCcw } from 'lucide-react';
import { Routine, RoutineDay, Exercise } from '../../types';
import { INITIAL_ROUTINES } from '../../constants/initialData';

interface RoutineConfigProps {
  routines: Routine[];
  setRoutines: React.Dispatch<React.SetStateAction<Routine[]>>;
  handleResetAll: () => void;
  handleAddRoutine: () => void;
  handleAddDay: (routineId: string) => void;
  handleUpdateDay: (routineId: string, dayId: string, updates: Partial<RoutineDay>) => void;
  handleDeleteDay: (routineId: string, dayId: string) => void;
  handleAddExercise: (routineId: string, dayId: string) => void;
  handleUpdateExercise: (routineId: string, dayId: string, exerciseId: string, updates: Partial<Exercise>) => void;
  handleDeleteExercise: (routineId: string, dayId: string, exerciseId: string) => void;
}

/**
 * View for configuring workout routines, days, and exercises.
 */
export const RoutineConfig: React.FC<RoutineConfigProps> = ({
  routines,
  setRoutines,
  handleResetAll,
  handleAddRoutine,
  handleAddDay,
  handleUpdateDay,
  handleDeleteDay,
  handleAddExercise,
  handleUpdateExercise,
  handleDeleteExercise
}) => {
  const [showConfirm, setShowConfirm] = React.useState(false);

  return (
    <motion.div
      key="config"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Configuración de Rutinas</h2>
          <p className="text-zinc-500">Crea y personaliza tus planes de entrenamiento.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {showConfirm ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  handleResetAll();
                  setShowConfirm(false);
                }}
                className="flex items-center justify-center gap-2 bg-red-100 text-red-600 px-4 py-3 rounded-xl font-bold hover:bg-red-200 transition-all"
              >
                Confirmar
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-600 px-4 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowConfirm(true)}
              className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-600 px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar
            </button>
          )}
          <motion.button 
            whileTap={{ scale: 0.95, backgroundColor: "#059669" }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={handleAddRoutine}
            className="flex items-center justify-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Nueva Rutina
          </motion.button>
        </div>
      </div>

      <div className="space-y-6">
        {routines.map((routine) => (
          <div key={routine.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <input
                value={routine.name}
                onChange={(e) => setRoutines(prev => prev.map(r => r.id === routine.id ? { ...r, name: e.target.value } : r))}
                className="text-lg font-bold bg-transparent border-none focus:ring-0 text-zinc-900 w-full max-w-md"
                placeholder="Nombre de la rutina..."
              />
              <div className="flex items-center gap-2 w-full md:w-auto">
                <motion.button 
                  whileTap={{ scale: 0.95, backgroundColor: "#ecfdf5" }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  onClick={() => handleAddDay(routine.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 text-brand-600 bg-brand-50/50 hover:bg-brand-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Día
                </motion.button>
                <button 
                  onClick={() => setRoutines(prev => prev.filter(r => r.id !== routine.id))}
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {routine.days.map((day) => (
                <div key={day.id} className="relative pl-8 border-l-2 border-brand-100 space-y-4">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-500 border-4 border-white shadow-sm" />
                  
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <input
                        value={day.title}
                        onChange={(e) => handleUpdateDay(routine.id, day.id, { title: e.target.value })}
                        className="text-md font-bold text-zinc-900 bg-transparent border-none focus:ring-0 p-0 w-full"
                        placeholder="Título del día (ej: Pecho)"
                      />
                      <textarea
                        value={day.description}
                        onChange={(e) => handleUpdateDay(routine.id, day.id, { description: e.target.value })}
                        className="text-sm text-zinc-500 bg-transparent border-none focus:ring-0 p-0 w-full resize-none"
                        placeholder="Descripción breve..."
                        rows={1}
                      />
                    </div>
                    <button 
                      onClick={() => handleDeleteDay(routine.id, day.id)}
                      className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Ejercicios</h4>
                      <motion.button 
                        whileTap={{ scale: 0.95, backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        onClick={() => handleAddExercise(routine.id, day.id)}
                        className="text-xs font-bold text-brand-600 hover:underline px-2 py-1 rounded-md transition-colors"
                      >
                        + Añadir Ejercicio
                      </motion.button>
                    </div>

                    <div className="space-y-3">
                      {day.exercises.map((ex) => (
                        <div key={ex.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm group">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center shrink-0">
                                <Dumbbell className="w-4 h-4 text-zinc-400" />
                              </div>
                              <div className="flex-1 space-y-1 min-w-0">
                                <input
                                  value={ex.name}
                                  onChange={(e) => handleUpdateExercise(routine.id, day.id, ex.id, { name: e.target.value })}
                                  className="w-full text-sm font-bold text-zinc-800 bg-transparent border-none focus:ring-0 p-0 truncate"
                                  placeholder="Nombre del ejercicio"
                                />
                                <input
                                  value={ex.muscles}
                                  onChange={(e) => handleUpdateExercise(routine.id, day.id, ex.id, { muscles: e.target.value })}
                                  className="w-full text-[10px] text-zinc-500 bg-transparent border-none focus:ring-0 p-0 italic truncate"
                                  placeholder="Músculos (ej: Pecho, Tríceps)"
                                />
                                <div className="flex items-center gap-2 mt-1">
                                  <select
                                    value={ex.type || 'strength'}
                                    onChange={(e) => handleUpdateExercise(routine.id, day.id, ex.id, { type: e.target.value as 'strength' | 'cardio' })}
                                    className="text-[10px] bg-zinc-100 border-none rounded-md px-2 py-0.5 text-zinc-600 focus:ring-0"
                                  >
                                    <option value="strength">Fuerza</option>
                                    <option value="cardio">Cardio</option>
                                  </select>
                                  <label className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md cursor-pointer hover:bg-zinc-200 transition-colors flex items-center gap-1">
                                    Subir Imagen
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            const { uploadImage } = await import('../../lib/supabase');
                                            const publicUrl = await uploadImage(file);
                                            handleUpdateExercise(routine.id, day.id, ex.id, { imageUrl: publicUrl });
                                          } catch (err) {
                                            console.error('Error uploading image:', err);
                                            alert('Error al subir la imagen. Asegúrate de haber creado el bucket "exercise-images" en Supabase.');
                                          }
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0">
                              {ex.imageUrl && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-100 shrink-0 bg-white relative group/img">
                                  <img 
                                    src={ex.imageUrl} 
                                    alt={ex.name} 
                                    className="w-full h-full object-contain"
                                    referrerPolicy="no-referrer"
                                  />
                                  <button
                                    onClick={() => handleUpdateExercise(routine.id, day.id, ex.id, { imageUrl: undefined })}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                  >
                                    <X className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              )}
                              <button 
                                onClick={() => handleDeleteExercise(routine.id, day.id, ex.id)}
                                className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          {(!ex.type || ex.type === 'strength') ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="space-y-1.5">
                                <div className="h-8 flex items-end pb-1">
                                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1">Series</label>
                                </div>
                                <div className="bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100 focus-within:border-brand-200 transition-colors">
                                  <input
                                    type="number"
                                    value={ex.sets}
                                    onChange={(e) => handleUpdateExercise(routine.id, day.id, ex.id, { sets: parseInt(e.target.value) || 0 })}
                                    className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-center"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="h-8 flex items-end pb-1">
                                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1">Reps</label>
                                </div>
                                <div className="bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100 focus-within:border-brand-200 transition-colors">
                                  <input
                                    value={ex.reps}
                                    onChange={(e) => handleUpdateExercise(routine.id, day.id, ex.id, { reps: e.target.value })}
                                    className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-center"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="h-8 flex items-end pb-1">
                                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1">Peso</label>
                                </div>
                                <div className="bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100 focus-within:border-brand-200 transition-colors">
                                  <input
                                    value={ex.weight}
                                    onChange={(e) => handleUpdateExercise(routine.id, day.id, ex.id, { weight: e.target.value })}
                                    className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-center"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="h-8 flex items-end pb-1">
                                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                                    <Timer className="w-2 h-2" /> Descanso (s)
                                  </label>
                                </div>
                                <div className="bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100 focus-within:border-brand-200 transition-colors">
                                  <input
                                    type="number"
                                    value={ex.restTime}
                                    onChange={(e) => handleUpdateExercise(routine.id, day.id, ex.id, { restTime: parseInt(e.target.value) || 0 })}
                                    className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-center"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <div className="h-8 flex items-end pb-1">
                                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1">Duración (min)</label>
                                </div>
                                <div className="bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100 focus-within:border-brand-200 transition-colors">
                                  <input
                                    type="number"
                                    value={ex.duration || ''}
                                    onChange={(e) => handleUpdateExercise(routine.id, day.id, ex.id, { duration: parseInt(e.target.value) || 0 })}
                                    className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-center"
                                    placeholder="Ej: 30"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="h-8 flex items-end pb-1">
                                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest pl-1">Intensidad</label>
                                </div>
                                <div className="bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100 focus-within:border-brand-200 transition-colors">
                                  <select
                                    value={ex.intensity || 'medium'}
                                    onChange={(e) => handleUpdateExercise(routine.id, day.id, ex.id, { intensity: e.target.value as any })}
                                    className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-center"
                                  >
                                    <option value="low">Baja</option>
                                    <option value="medium">Media</option>
                                    <option value="high">Alta</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {day.exercises.length === 0 && (
                        <p className="text-center py-4 text-xs text-zinc-400 italic">No hay ejercicios añadidos aún.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {routine.days.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-zinc-300" />
                  </div>
                  <p className="text-zinc-500 font-medium">Esta rutina no tiene días configurados.</p>
                  <button 
                    onClick={() => handleAddDay(routine.id)}
                    className="mt-4 text-brand-600 font-bold hover:underline"
                  >
                    Añadir el primer día
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
