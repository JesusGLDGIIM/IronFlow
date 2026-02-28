import { Routine } from '../types';

/**
 * Initial mock routines for first-time users.
 */
export const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'r1',
    name: 'Rutina de Entrenamiento Completa',
    days: [
      {
        id: 'd0',
        title: 'Día 0 — Voleyball',
        description: 'Actividad deportiva intensa.',
        exercises: [
          { id: 'e0', name: 'Voleyball', muscles: 'Cuerpo completo, cardio', sets: 1, reps: '1h', weight: '-', restTime: 0, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/volleyball.png' },
        ]
      },
      {
        id: 'd1',
        title: 'Día 1 — Pecho + Tríceps',
        description: 'Enfoque en empujes horizontales e inclinados.',
        exercises: [
          { id: 'e1_1', name: 'Press banca con barra', muscles: 'Pecho mayor, deltoides anterior, tríceps', sets: 4, reps: '8', weight: '0kg', restTime: 120, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/bench-press.png' },
          { id: 'e1_2', name: 'Press inclinado con mancuernas', muscles: 'Pecho superior, deltoides anterior', sets: 3, reps: '10', weight: '0kg', restTime: 90, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/bench-press.png' },
          { id: 'e1_3', name: 'Aperturas en polea baja (crossover)', muscles: 'Pecho mayor, pecho menor', sets: 3, reps: '12', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/chest.png' },
          { id: 'e1_4', name: 'Fondos en paralelas → Press banca agarre cerrado', muscles: 'Tríceps, pecho interior, deltoides anterior', sets: 3, reps: '10', weight: '0kg', restTime: 90, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/dip-station.png' },
          { id: 'e1_5', name: 'Extensiones de tríceps en polea alta', muscles: 'Tríceps (cabeza larga y lateral)', sets: 3, reps: '12', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/triceps.png' },
          { id: 'e1_6', name: 'Press francés → Extensión de tríceps con mancuerna sobre la cabeza', muscles: 'Tríceps (cabeza larga)', sets: 3, reps: '10', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/triceps.png' },
          { id: 'e1_7', name: 'Kickbacks con mancuerna', muscles: 'Tríceps (cabeza lateral)', sets: 3, reps: '12', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/triceps.png' },
        ]
      },
      {
        id: 'd2',
        title: 'Día 2 — Espalda + Bíceps',
        description: 'Enfoque en tracciones y cadena posterior.',
        exercises: [
          { id: 'e2_1', name: 'Peso muerto convencional', muscles: 'Erector espinal, glúteos, isquiotibiales, trapecios', sets: 4, reps: '6', weight: '0kg', restTime: 180, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/deadlift.png' },
          { id: 'e2_2', name: 'Remo con barra', muscles: 'Dorsal ancho, romboides, bíceps', sets: 4, reps: '8', weight: '0kg', restTime: 120, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/back-muscles.png' },
          { id: 'e2_3', name: 'Dominadas → Jalón al pecho', muscles: 'Dorsal ancho, bíceps, redondo mayor', sets: 3, reps: '10', weight: 'BW', restTime: 90, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/pullups.png' },
          { id: 'e2_4', name: 'Remo en polea baja sentado', muscles: 'Romboides, trapecio medio, dorsal', sets: 3, reps: '12', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/back-muscles.png' },
          { id: 'e2_5', name: 'Face pull en polea', muscles: 'Deltoides posterior, rotadores externos, trapecios', sets: 3, reps: '15', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/shoulders.png' },
          { id: 'e2_6', name: 'Curl con barra', muscles: 'Bíceps, braquial', sets: 3, reps: '10', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/biceps.png' },
          { id: 'e2_7', name: 'Curl martillo con mancuernas', muscles: 'Braquiorradial, bíceps, braquial', sets: 3, reps: '12', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/biceps.png' },
        ]
      },
      {
        id: 'd3',
        title: 'Día 3 — Piernas',
        description: 'Día pesado de tren inferior.',
        exercises: [
          { id: 'e3_1', name: 'Sentadilla con barra', muscles: 'Cuádriceps, glúteos, isquiotibiales, core', sets: 4, reps: '8', weight: '0kg', restTime: 180, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/squats.png' },
          { id: 'e3_2', name: 'Prensa de piernas', muscles: 'Cuádriceps, glúteos, isquiotibiales', sets: 4, reps: '10', weight: '0kg', restTime: 120, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/leg-press.png' },
          { id: 'e3_3', name: 'Zancadas con mancuernas', muscles: 'Glúteos, cuádriceps, isquiotibiales', sets: 3, reps: '12/pierna', weight: '0kg', restTime: 90, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/lunges.png' },
          { id: 'e3_4', name: 'Curl femoral en máquina', muscles: 'Isquiotibiales', sets: 3, reps: '12', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/leg-muscles.png' },
          { id: 'e3_5', name: 'Extensiones de cuádriceps en máquina', muscles: 'Cuádriceps', sets: 3, reps: '12', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/leg-muscles.png' },
          { id: 'e3_6', name: 'Hip thrust con barra', muscles: 'Glúteo mayor, isquiotibiales', sets: 4, reps: '10', weight: '0kg', restTime: 120, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/glutes.png' },
          { id: 'e3_7', name: 'Elevación de gemelos de pie', muscles: 'Gastrocnemio, sóleo', sets: 4, reps: '15', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/leg-muscles.png' },
          { id: 'e3_8', name: 'Sentadilla búlgara', muscles: 'Cuádriceps, glúteo mayor, estabilizadores', sets: 3, reps: '10', weight: '0kg', restTime: 90, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/squats.png' },
        ]
      },
      {
        id: 'd4',
        title: 'Día 4 — Hombros + Core',
        description: 'Enfoque en deltoides y estabilidad abdominal.',
        exercises: [
          { id: 'e4_1', name: 'Press militar con barra', muscles: 'Deltoides anterior y medio, tríceps, trapecios', sets: 4, reps: '8', weight: '0kg', restTime: 120, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/military-press.png' },
          { id: 'e4_2', name: 'Elevaciones laterales con mancuernas', muscles: 'Deltoides medio', sets: 4, reps: '12', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/shoulders.png' },
          { id: 'e4_3', name: 'Press Arnold', muscles: 'Deltoides (los tres haces), tríceps', sets: 3, reps: '10', weight: '0kg', restTime: 90, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/military-press.png' },
          { id: 'e4_4', name: 'Pájaro (elevaciones posteriores)', muscles: 'Deltoides posterior, romboides', sets: 3, reps: '12', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/shoulders.png' },
          { id: 'e4_5', name: 'Encogimientos con mancuernas', muscles: 'Trapecio superior, elevador de la escápula', sets: 3, reps: '15', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/shoulders.png' },
          { id: 'e4_6', name: 'Plancha frontal', muscles: 'Core, transverso abdominal, glúteos', sets: 3, reps: '45 seg', weight: '-', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/plank.png' },
          { id: 'e4_7', name: 'Crunch en polea', muscles: 'Recto abdominal, oblicuos', sets: 3, reps: '15', weight: '0kg', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/crunch.png' },
          { id: 'e4_8', name: 'Rueda abdominal', muscles: 'Recto abdominal, core profundo, dorsales', sets: 3, reps: '10', weight: '-', restTime: 60, imageUrl: 'https://img.icons8.com/ios-filled/100/000000/ab-wheel.png' },
        ]
      }
    ]
  }
];
