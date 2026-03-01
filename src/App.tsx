import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
} from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  parseISO, 
  isSameWeek, 
  subDays 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'motion/react';

// Types & Constants
import { Routine, ScheduledDay, RoutineDay, Exercise, ViewState } from './types';
import { INITIAL_ROUTINES } from './constants/initialData';

// Components
import { Header } from './components/Layout/Header';
import { CalendarDay } from './components/Calendar/CalendarDay';
import { SortableRoutineDay } from './components/Routines/SortableRoutineDay';
import { RoutineConfig } from './components/Routines/RoutineConfig';
import { StatsView } from './components/Stats/StatsView';
import { ExerciseDetailsModal } from './components/Modals/ExerciseDetailsModal';
import { ManualAssignmentModal } from './components/Modals/ManualAssignmentModal';
import { RestTimer } from './components/UI/RestTimer';
import { SimpleAuth } from './components/Auth/SimpleAuth';

import { supabaseService } from './services/supabaseService';

/**
 * Main Application Component
 * Handles global state, persistence, and routing between views.
 */
export default function App() {
  const [view, setView] = useState<ViewState>('schedule');
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [schedule, setSchedule] = useState<ScheduledDay[]>([]);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [selectedDayForDetails, setSelectedDayForDetails] = useState<{ day: RoutineDay, date?: string } | null>(null);
  const [isAssigningToDate, setIsAssigningToDate] = useState<string | null>(null);
  const [activeRestTimer, setActiveRestTimer] = useState<{ seconds: number } | null>(null);

  // Initial Data Fetch & Migration
  useEffect(() => {
    const initData = async () => {
      try {
        const data = await supabaseService.getUserData();
        
        if (data) {
          setRoutines(data.routines || []);
          setSchedule(data.schedule || []);
          setActiveRoutineId(data.routines?.[0]?.id || null);
        } else {
          // Migration from localStorage if no cloud data exists
          const localRoutines = localStorage.getItem('ironflow_routines');
          const localSchedule = localStorage.getItem('ironflow_schedule');
          
          const routinesData = localRoutines ? JSON.parse(localRoutines) : JSON.parse(JSON.stringify(INITIAL_ROUTINES));
          const scheduleData = localSchedule ? JSON.parse(localSchedule) : [];
          
          setRoutines(routinesData);
          setSchedule(scheduleData);
          setActiveRoutineId(routinesData[0]?.id || null);
          
          // Save to Supabase for the first time
          await supabaseService.saveUserData(routinesData, scheduleData);
        }
      } catch (err) {
        console.error('Error initializing data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    initData();
  }, []);

  // Persistence to Supabase (with debounce)
  useEffect(() => {
    if (isLoadingData) return;

    const timer = setTimeout(async () => {
      try {
        await supabaseService.saveUserData(routines, schedule);
      } catch (err) {
        console.error('Error auto-saving data:', err);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [routines, schedule, isLoadingData]);

  // Active Routine ID Persistence (Local is fine for this UI state)
  useEffect(() => {
    if (activeRoutineId) {
      localStorage.setItem('ironflow_active_routine_id', activeRoutineId);
    }
  }, [activeRoutineId]);

  // Calendar Logic
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const activeRoutine = useMemo(() => routines.find(r => r.id === activeRoutineId), [routines, activeRoutineId]);

  const scheduledThisWeek = useMemo(() => {
    return schedule.filter(s => {
      try {
        return isSameWeek(parseISO(s.date), weekStart, { weekStartsOn: 1 });
      } catch {
        return false;
      }
    });
  }, [schedule, weekStart]);

  const availableDays = useMemo(() => {
    if (!activeRoutine) return [];
    const scheduledDayIds = new Set(scheduledThisWeek.map(s => s.routineDayId));
    return activeRoutine.days.filter(day => !scheduledDayIds.has(day.id));
  }, [activeRoutine, scheduledThisWeek]);

  const isWeekCompleted = useMemo(() => {
    if (!activeRoutine || activeRoutine.days.length === 0) return false;
    const scheduledDayIds = new Set(scheduledThisWeek.map(s => s.routineDayId));
    const allDaysScheduled = activeRoutine.days.every(day => scheduledDayIds.has(day.id));
    if (!allDaysScheduled) return false;
    return scheduledThisWeek.every(s => {
      const day = activeRoutine.days.find(d => d.id === s.routineDayId);
      if (!day) return true;
      return day.exercises.length > 0 && s.completedExerciseIds.length === day.exercises.length;
    });
  }, [activeRoutine, scheduledThisWeek]);

  // Auto-scheduling logic
  useEffect(() => {
    const currentWeekDates = weekDays.map(d => format(d, 'yyyy-MM-dd'));
    const hasCurrentWeekSchedule = schedule.some(s => currentWeekDates.includes(s.date));

    if (!hasCurrentWeekSchedule) {
      const prevWeekStart = subDays(weekStart, 7);
      const prevWeekDates = Array.from({ length: 7 }, (_, i) => format(addDays(prevWeekStart, i), 'yyyy-MM-dd'));
      const prevWeekSchedule = schedule.filter(s => prevWeekDates.includes(s.date));
      
      if (prevWeekSchedule.length > 0) {
        const newEntries: ScheduledDay[] = prevWeekSchedule.map(s => {
          const prevDate = parseISO(s.date);
          const dayOffset = (prevDate.getDay() + 6) % 7; // Monday = 0
          const newDate = addDays(weekStart, dayOffset);
          return {
            ...s,
            date: format(newDate, 'yyyy-MM-dd'),
            completedExerciseIds: [],
            exerciseLogs: {} // Clear logs for new week
          };
        });
        setSchedule(prev => [...prev, ...newEntries]);
      }
    }
  }, [weekStart]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;
    const overId = over.id as string;
    if (overId.startsWith('day-')) {
      const dateStr = overId.replace('day-', '');
      const routineDayId = active.id as string;
      if (!activeRoutineId) return;
      setSchedule(prev => {
        const filtered = prev.filter(s => s.date !== dateStr);
        return [...filtered, {
          date: dateStr,
          routineDayId,
          routineId: activeRoutineId,
          completedExerciseIds: [],
          exerciseLogs: {}
        }];
      });
    }
  };

  /**
   * Toggles all exercises in a scheduled day as completed or pending.
   */
  const toggleDayDone = (dateStr: string) => {
    setSchedule(prev => prev.map(s => {
      if (s.date === dateStr) {
        const routine = routines.find(r => r.id === s.routineId);
        const day = routine?.days.find(d => d.id === s.routineDayId);
        if (!day) return s;
        
        const isAllDone = s.completedExerciseIds.length === day.exercises.length;
        const newCompletedIds = isAllDone ? [] : day.exercises.map(e => e.id);
        
        // Snapshot logs when marking as done
        const newLogs: Record<string, any> = { ...s.exerciseLogs };
        day.exercises.forEach(ex => {
          newLogs[ex.id] = {
            exerciseId: ex.id,
            name: ex.name,
            muscles: ex.muscles,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            imageUrl: ex.imageUrl,
            completed: !isAllDone,
            completedAt: !isAllDone ? new Date().toISOString() : undefined
          };
        });

        return {
          ...s,
          completedExerciseIds: newCompletedIds,
          exerciseLogs: newLogs
        };
      }
      return s;
    }));
  };

  /**
   * Toggles a single exercise as completed and snapshots its state for historical tracking.
   */
  const toggleExerciseDone = (dateStr: string, exerciseId: string) => {
    setSchedule(prev => prev.map(s => {
      if (s.date === dateStr) {
        const isDone = s.completedExerciseIds.includes(exerciseId);
        const routine = routines.find(r => r.id === s.routineId);
        const day = routine?.days.find(d => d.id === s.routineDayId);
        const exercise = day?.exercises.find(e => e.id === exerciseId);
        
        if (!exercise) return s;

        const newCompletedIds = isDone 
          ? s.completedExerciseIds.filter(id => id !== exerciseId)
          : [...s.completedExerciseIds, exerciseId];

        // Snapshot current exercise state into logs
        const newLogs = { ...s.exerciseLogs };
        newLogs[exerciseId] = {
          exerciseId: exercise.id,
          name: exercise.name,
          muscles: exercise.muscles,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          imageUrl: exercise.imageUrl,
          completed: !isDone,
          completedAt: !isDone ? new Date().toISOString() : undefined
        };

        // Trigger rest timer if marked as done
        if (!isDone && exercise.restTime > 0) {
          setActiveRestTimer({ seconds: exercise.restTime });
        }

        return {
          ...s,
          completedExerciseIds: newCompletedIds,
          exerciseLogs: newLogs
        };
      }
      return s;
    }));
  };

  const removeFromSchedule = (dateStr: string) => {
    setSchedule(prev => prev.filter(s => s.date !== dateStr));
  };

  // Routine Handlers
  const handleAddRoutine = () => {
    const newRoutine: Routine = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nueva Rutina',
      days: []
    };
    setRoutines([...routines, newRoutine]);
    setActiveRoutineId(newRoutine.id);
    setView('config');
  };

  const handleAddDay = (routineId: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          days: [...r.days, {
            id: Math.random().toString(36).substr(2, 9),
            title: 'Nuevo Día',
            description: '',
            exercises: []
          }]
        };
      }
      return r;
    }));
  };

  const handleUpdateDay = (routineId: string, dayId: string, updates: Partial<RoutineDay>) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          days: r.days.map(d => d.id === dayId ? { ...d, ...updates } : d)
        };
      }
      return r;
    }));
  };

  const handleDeleteDay = (routineId: string, dayId: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === routineId) {
        return { ...r, days: r.days.filter(d => d.id !== dayId) };
      }
      return r;
    }));
    setSchedule(prev => prev.filter(s => s.routineDayId !== dayId));
  };

  const handleAddExercise = (routineId: string, dayId: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          days: r.days.map(d => {
            if (d.id === dayId) {
              return {
                ...d,
                exercises: [...d.exercises, {
                  id: Math.random().toString(36).substr(2, 9),
                  name: 'Ejercicio',
                  muscles: 'Grupo muscular',
                  sets: 3,
                  reps: '10',
                  weight: '0kg',
                  restTime: 60
                }]
              };
            }
            return d;
          })
        };
      }
      return r;
    }));
  };

  const handleUpdateExercise = (routineId: string, dayId: string, exerciseId: string, updates: Partial<Exercise>) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          days: r.days.map(d => {
            if (d.id === dayId) {
              return {
                ...d,
                exercises: d.exercises.map(e => e.id === exerciseId ? { ...e, ...updates } : e)
              };
            }
            return d;
          })
        };
      }
      return r;
    }));
  };

  const handleDeleteExercise = (routineId: string, dayId: string, exerciseId: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === routineId) {
        return {
          ...r,
          days: r.days.map(d => {
            if (d.id === dayId) {
              return { ...d, exercises: d.exercises.filter(e => e.id !== exerciseId) };
            }
            return d;
          })
        };
      }
      return r;
    }));
  };

  const handleResetAll = () => {
    setRoutines(JSON.parse(JSON.stringify(INITIAL_ROUTINES)));
    setSchedule([]);
    setActiveRoutineId(INITIAL_ROUTINES[0]?.id || null);
    localStorage.removeItem('ironflow_routines');
    localStorage.removeItem('ironflow_schedule');
    localStorage.removeItem('ironflow_active_routine_id');
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50">
      <Header view={view} setView={setView} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        <AnimatePresence mode="wait">
          {view === 'schedule' ? (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="lg:col-span-3 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Rutina Activa</h2>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        onClick={handleAddRoutine} 
                        className="p-1 hover:bg-zinc-100 rounded-lg text-brand-600"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <select
                      value={activeRoutineId || ''}
                      onChange={(e) => setActiveRoutineId(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
                    >
                      {routines.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Días Disponibles</h2>
                    <SortableContext 
                      items={availableDays.map(d => d.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {availableDays.map(day => (
                          <SortableRoutineDay 
                            key={day.id} 
                            day={day} 
                            onClick={() => setSelectedDayForDetails({ day })}
                          />
                        ))}
                        {(!activeRoutine || activeRoutine.days.length === 0) && (
                          <div className="p-8 border-2 border-dashed border-zinc-200 rounded-2xl text-center">
                            <p className="text-sm text-zinc-400">No hay días configurados</p>
                            <button 
                              onClick={() => setView('config')}
                              className="mt-2 text-xs font-bold text-brand-600 hover:underline"
                            >
                              Ir a configuración
                            </button>
                          </div>
                        )}
                        {activeRoutine && activeRoutine.days.length > 0 && availableDays.length === 0 && (
                          <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-center">
                            <CheckCircle2 className="w-8 h-8 text-brand-500 mx-auto mb-2" />
                            <p className="text-xs text-zinc-500 font-medium">¡Todos los días asignados!</p>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </div>

                <div className="lg:col-span-9 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center justify-center w-full sm:w-auto gap-4">
                      <button 
                        onClick={() => setCurrentDate(addDays(currentDate, -7))}
                        className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-zinc-600" />
                      </button>
                      <div className="flex flex-col items-center">
                        <h3 className="text-lg font-bold text-zinc-900 min-w-[160px] md:min-w-[200px] text-center capitalize">
                          {format(weekStart, "MMMM yyyy", { locale: es })}
                        </h3>
                        {isWeekCompleted && (
                          <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Semana Completada
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => setCurrentDate(addDays(currentDate, 7))}
                        className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-zinc-600" />
                      </button>
                    </div>
                    <button 
                      onClick={() => setCurrentDate(new Date())}
                      className="w-full sm:w-auto px-6 py-2 text-sm font-bold text-zinc-600 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-100"
                    >
                      Hoy
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {weekDays.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const scheduled = scheduledThisWeek.find(s => s.date === dateStr && s.routineId === activeRoutineId);
                      const routineDay = scheduled ? activeRoutine?.days.find(d => d.id === scheduled.routineDayId) : null;

                      return (
                        <CalendarDay 
                          key={dateStr}
                          day={day}
                          dateStr={dateStr}
                          scheduled={scheduled}
                          routineDay={routineDay}
                          onToggleDone={toggleDayDone}
                          onRemove={removeFromSchedule}
                          onShowDetails={(day: RoutineDay, date: string) => setSelectedDayForDetails({ day, date })}
                          onAddClick={() => setIsAssigningToDate(dateStr)}
                        />
                      );
                    })}
                  </div>
                </div>

                <DragOverlay>
                  {activeDragId ? (
                    <div className="p-4 bg-white border-2 border-brand-500 rounded-xl shadow-xl w-64 opacity-90 rotate-3">
                      <h4 className="font-semibold text-zinc-900 truncate">
                        {activeRoutine?.days.find(d => d.id === activeDragId)?.title}
                      </h4>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </motion.div>
          ) : view === 'config' ? (
            <RoutineConfig 
              routines={routines}
              setRoutines={setRoutines}
              handleResetAll={handleResetAll}
              handleAddRoutine={handleAddRoutine}
              handleAddDay={handleAddDay}
              handleUpdateDay={handleUpdateDay}
              handleDeleteDay={handleDeleteDay}
              handleAddExercise={handleAddExercise}
              handleUpdateExercise={handleUpdateExercise}
              handleDeleteExercise={handleDeleteExercise}
            />
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-900">Tus Estadísticas</h2>
                <p className="text-zinc-500">Analiza tu progreso y constancia.</p>
              </div>
              <StatsView schedule={schedule} routines={routines} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ExerciseDetailsModal 
        selectedDay={selectedDayForDetails}
        schedule={schedule}
        onClose={() => setSelectedDayForDetails(null)}
        onToggleExercise={toggleExerciseDone}
      />

      <ManualAssignmentModal 
        dateStr={isAssigningToDate}
        availableDays={availableDays}
        onClose={() => setIsAssigningToDate(null)}
        onAssign={(dateStr, dayId) => {
          if (activeRoutineId) {
            setSchedule(prev => {
              const filtered = prev.filter(s => s.date !== dateStr);
              return [...filtered, {
                date: dateStr,
                routineDayId: dayId,
                routineId: activeRoutineId,
                completedExerciseIds: [],
                exerciseLogs: {}
              }];
            });
            setIsAssigningToDate(null);
          }
        }}
      />

      <AnimatePresence>
        {activeRestTimer && (
          <RestTimer 
            initialSeconds={activeRestTimer.seconds} 
            onClose={() => setActiveRestTimer(null)} 
          />
        )}
      </AnimatePresence>

      <footer className="p-6 text-center text-zinc-400 text-xs font-medium border-t border-zinc-100">
        &copy; 2026 IronFlow. Diseñado para el máximo rendimiento.
      </footer>
    </div>
  );
}
