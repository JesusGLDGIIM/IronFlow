export type ExerciseType = 'strength' | 'cardio';
export type CardioIntensity = 'low' | 'medium' | 'high';

/**
 * Represents a single exercise in a routine.
 */
export interface Exercise {
  id: string;
  name: string;
  muscles: string;
  type?: ExerciseType;
  
  // Strength fields
  sets: number;
  reps: string;
  weight: string;
  restTime: number; // in seconds
  
  // Cardio fields
  duration?: number; // in minutes
  intensity?: CardioIntensity;
  
  imageUrl?: string;
}

/**
 * Represents a snapshot of an exercise for historical tracking.
 */
export interface ExerciseLog {
  exerciseId: string;
  name: string;
  muscles: string;
  type?: ExerciseType;
  
  // Strength fields
  sets: number;
  reps: string;
  weight: string;
  
  // Cardio fields
  duration?: number;
  intensity?: CardioIntensity;
  
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
