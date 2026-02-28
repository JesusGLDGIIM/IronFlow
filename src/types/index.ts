/**
 * Represents a single exercise in a routine.
 */
export interface Exercise {
  id: string;
  name: string;
  muscles: string;
  sets: number;
  reps: string;
  weight: string;
  restTime: number; // in seconds
  imageUrl?: string;
}

/**
 * Represents a snapshot of an exercise for historical tracking.
 */
export interface ExerciseLog {
  exerciseId: string;
  name: string;
  muscles: string;
  sets: number;
  reps: string;
  weight: string;
  completed: boolean;
  completedAt?: string; // ISO string
  imageUrl?: string;
}

/**
 * Represents a day within a routine.
 */
export interface RoutineDay {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
}

/**
 * Represents a complete workout routine.
 */
export interface Routine {
  id: string;
  name: string;
  days: RoutineDay[];
}

/**
 * Represents a day scheduled in the calendar.
 */
export interface ScheduledDay {
  date: string; // ISO string (YYYY-MM-DD)
  routineDayId: string;
  routineId: string;
  completedExerciseIds: string[]; // For backward compatibility
  exerciseLogs?: Record<string, ExerciseLog>; // Detailed historical logs
}

/**
 * Application view states.
 */
export type ViewState = 'schedule' | 'config' | 'stats';
