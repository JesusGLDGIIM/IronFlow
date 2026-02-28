import React, { useMemo, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { format, parseISO, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, Award, History, Dumbbell, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Routine, ScheduledDay } from '../../types';
import { cn } from '../../lib/utils';

interface StatsViewProps {
  schedule: ScheduledDay[];
  routines: Routine[];
}

const parseWeight = (w: string) => parseFloat(w.replace(/[^\d.]/g, '')) || 0;

/**
 * Dashboard for visualizing workout progress and consistency.
 */
export const StatsView: React.FC<StatsViewProps> = ({ schedule, routines }) => {
  const stats = useMemo(() => {
    // 1. Completed Weeks
    const weeksMap = new Map<string, { scheduled: number, completed: number, routineId: string }>();
    
    schedule.forEach(s => {
      const date = parseISO(s.date);
      const weekKey = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const routine = routines.find(r => r.id === s.routineId);
      const day = routine?.days.find(d => d.id === s.routineDayId);
      
      if (!weeksMap.has(weekKey)) {
        weeksMap.set(weekKey, { scheduled: 0, completed: 0, routineId: s.routineId });
      }
      
      const weekData = weeksMap.get(weekKey)!;
      weekData.scheduled++;
      if (day && day.exercises.length > 0 && s.completedExerciseIds.length === day.exercises.length) {
        weekData.completed++;
      }
    });

    const completedWeeks = Array.from(weeksMap.entries())
      .filter(([_, data]) => {
        const routine = routines.find(r => r.id === data.routineId);
        return data.completed === routine?.days.length && data.scheduled === routine?.days.length;
      })
      .map(([date]) => date);

    // 2. Routine Completion Counts
    const routineCounts = new Map<string, number>();
    Array.from(weeksMap.values()).forEach(data => {
      const routine = routines.find(r => r.id === data.routineId);
      if (routine && data.completed === routine.days.length && data.scheduled === routine.days.length) {
        routineCounts.set(routine.name, (routineCounts.get(routine.name) || 0) + 1);
      }
    });

    // 3. Weight Evolution (Last 10 entries per exercise)
    const exerciseEvolution: Record<string, { date: string, weight: number }[]> = {};
    
    // Sort schedule by date
    const sortedSchedule = [...schedule].sort((a, b) => a.date.localeCompare(b.date));
    
    sortedSchedule.forEach(s => {
      // Use historical logs if available, otherwise fallback to current routine data
      if (s.exerciseLogs) {
        Object.values(s.exerciseLogs).forEach((log) => {
          const l = log as any; // Cast to avoid unknown type issues
          if (l.completed) {
            if (!exerciseEvolution[l.name]) exerciseEvolution[l.name] = [];
            exerciseEvolution[l.name].push({
              date: format(parseISO(s.date), 'dd/MM'),
              weight: parseWeight(l.weight)
            });
          }
        });
      } else {
        // Fallback for old data
        const routine = routines.find(r => r.id === s.routineId);
        const day = routine?.days.find(d => d.id === s.routineDayId);
        if (day) {
          day.exercises.forEach(ex => {
            if (s.completedExerciseIds.includes(ex.id)) {
              if (!exerciseEvolution[ex.name]) exerciseEvolution[ex.name] = [];
              exerciseEvolution[ex.name].push({
                date: format(parseISO(s.date), 'dd/MM'),
                weight: parseWeight(ex.weight)
              });
            }
          });
        }
      }
    });

    // Keep only last 10 entries
    Object.keys(exerciseEvolution).forEach(name => {
      exerciseEvolution[name] = exerciseEvolution[name].slice(-10);
    });

    return {
      completedWeeksCount: completedWeeks.length,
      routineStats: Array.from(routineCounts.entries()).map(([name, count]) => ({ name, count })),
      exerciseEvolution,
      totalWorkouts: schedule.filter(s => {
        const routine = routines.find(r => r.id === s.routineId);
        const day = routine?.days.find(d => d.id === s.routineDayId);
        return day && s.completedExerciseIds.length === day.exercises.length;
      }).length
    };
  }, [schedule, routines]);

  const [selectedExercise, setSelectedExercise] = useState<string>(Object.keys(stats.exerciseEvolution)[0] || '');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const scheduled = schedule.find(s => s.date === dateStr);
    
    if (!scheduled) return 'empty';
    
    const routine = routines.find(r => r.id === scheduled.routineId);
    const day = routine?.days.find(d => d.id === scheduled.routineDayId);
    
    if (!day || day.exercises.length === 0) return 'empty';
    
    const isCompleted = scheduled.completedExerciseIds.length === day.exercises.length;
    
    if (isCompleted) return 'completed';
    
    const today = startOfDay(new Date());
    const targetDate = startOfDay(date);
    
    if (isBefore(targetDate, today)) return 'missed';
    
    return 'pending';
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDayIndex = getDay(monthStart);
  const emptyDaysCount = startDayIndex === 0 ? 6 : startDayIndex - 1;
  const emptyDays = Array.from({ length: emptyDaysCount }).map((_, i) => i);

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Semanas Completas</p>
            <h4 className="text-2xl font-bold text-zinc-900">{stats.completedWeeksCount}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
            <History className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Entrenamientos Totales</p>
            <h4 className="text-2xl font-bold text-zinc-900">{stats.totalWorkouts}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Ejercicios Registrados</p>
            <h4 className="text-2xl font-bold text-zinc-900">{Object.keys(stats.exerciseEvolution).length}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            Evolución de Pesos
          </h3>
          
          <div className="mb-6">
            <select 
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {Object.keys(stats.exerciseEvolution).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
              {Object.keys(stats.exerciseEvolution).length === 0 && (
                <option value="">No hay datos aún</option>
              )}
            </select>
          </div>

          <div className="h-[300px] w-full">
            {selectedExercise && stats.exerciseEvolution[selectedExercise] ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.exerciseEvolution[selectedExercise]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a1a1aa' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a1a1aa' }}
                    unit="kg"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                <Dumbbell className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm">Completa ejercicios para ver tu progreso</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-brand-600" />
              Calendario de Actividad
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-zinc-600" />
              </button>
              <span className="text-sm font-bold text-zinc-900 min-w-[100px] text-center capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-zinc-400 uppercase">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map(i => (
                <div key={`empty-${i}`} className="aspect-square rounded-lg bg-transparent" />
              ))}
              {daysInMonth.map(day => {
                const status = getDayStatus(day);
                return (
                  <div 
                    key={day.toISOString()} 
                    className={cn(
                      "aspect-square rounded-lg flex items-center justify-center text-xs font-bold border transition-colors",
                      status === 'completed' ? "bg-emerald-500 border-emerald-600 text-white shadow-sm" :
                      status === 'missed' ? "bg-red-500 border-red-600 text-white shadow-sm" :
                      status === 'pending' ? "bg-amber-400 border-amber-500 text-amber-900 shadow-sm" :
                      "bg-white border-zinc-100 text-zinc-400"
                    )}
                    title={`${format(day, 'dd/MM/yyyy')} - ${status === 'completed' ? 'Completado' : status === 'missed' ? 'No realizado' : status === 'pending' ? 'Pendiente' : 'Sin rutina'}`}
                  >
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" /> Completado
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-500" /> No realizado
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-amber-400" /> Pendiente
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-white border border-zinc-200" /> Sin rutina
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
