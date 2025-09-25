// constants.ts
import { Settings, Priority, Mode } from './types';

export const MODES: { [key in Mode]: { id: Mode; color: string; lightColor: string } } = {
  'Work': { id: 'Work', color: 'bg-red-500', lightColor: 'bg-red-100' },
  'Short Break': { id: 'Short Break', color: 'bg-green-500', lightColor: 'bg-green-100' },
  'Long Break': { id: 'Long Break', color: 'bg-blue-500', lightColor: 'bg-blue-100' },
};

export const COLORBLIND_MODES: { [key in Mode]: { id: Mode; color: string; lightColor: string } } = {
  'Work': { id: 'Work', color: 'bg-orange-500', lightColor: 'bg-orange-100' },
  'Short Break': { id: 'Short Break', color: 'bg-sky-500', lightColor: 'bg-sky-100' },
  'Long Break': { id: 'Long Break', color: 'bg-indigo-500', lightColor: 'bg-indigo-100' },
};


export const PRIORITIES: { [key in Priority]: { id: Priority; color: string } } = {
  'High': { id: 'High', color: 'bg-red-500' },
  'Medium': { id: 'Medium', color: 'bg-yellow-500' },
  'Low': { id: 'Low', color: 'bg-blue-300' },
};

export const COLORBLIND_PRIORITIES: { [key in Priority]: { id: Priority; color: string } } = {
  'High': { id: 'High', color: 'bg-rose-700' }, // Darker Red
  'Medium': { id: 'Medium', color: 'bg-blue-500' }, // Blue
  'Low': { id: 'Low', color: 'bg-gray-400' },  // Gray
};


export const DEFAULT_SETTINGS: Settings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomos: false,
  autoSwitchTasks: true,
  alarmSound: 'bell',
  alarmVolume: 0.5,
  alarmFadeIn: true,
  soundscape: 'none',
  soundscapeVolume: 0.5,
  themeColor: 'red',
  dailyGoal: 8,
  isPremium: false,
  dndMode: false,
  language: 'en',
  customBreakSuggestions: ['Stretch your neck', 'Refill your water', 'Do 10 jumping jacks', 'Breathe deeply for 1 minute'],
  themePalette: 'Default',
  fontSize: 'medium',
  reducedMotion: false,
};

export const SOUNDS = {
  bell: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg',
  bird: 'https://actions.google.com/sounds/v1/ambiences/forest_sounds.ogg',
  digital: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm.ogg',
};

export const SOUNDSCAPES = {
  none: '',
  rain: 'https://www.ambient-mixer.com/sfx/rain-on-window.mp3',
  cafe: 'https://www.ambient-mixer.com/sfx/coffee-shop-chatter.mp3',
  forest: 'https://www.ambient-mixer.com/sfx/forest-wind-and-birds.mp3',
};

export const BREAK_SUGGESTIONS = [
  'Do 10 jumping jacks',
  'Stretch your neck',
  'Refill your water',
  'Look out the window for 20 seconds',
  'Tidy up one thing on your desk',
  'Walk around the room',
  'Practice mindful breathing'
];

export const SKIP_REASONS = [
    'Unexpected meeting',
    'Fatigued',
    'Chose to work longer',
    'Interrupted',
    'Not needed'
];

export const FOCUS_TYPES = ['Creative', 'Administrative', 'Learning', 'Deep Work', 'Shallow Work', 'Planning'];
export const ENERGY_LEVELS = ['High', 'Medium', 'Low'];

export const PRODUCTIVITY_TIPS = [
    "Break large tasks into smaller, manageable sub-tasks.",
    "Identify your most productive hours and schedule your most important tasks then.",
    "The 'Two-Minute Rule': If a task takes less than two minutes, do it immediately.",
    "Stay hydrated. Dehydration can lead to fatigue and loss of focus.",
    "Use headphones to minimize auditory distractions, even if you're not listening to music.",
    "Declutter your digital and physical workspace to reduce distractions.",
    "Prepare for your day the night before to hit the ground running.",
    "Take short breaks to walk around and stretch. It's good for your body and mind.",
    "Turn off non-essential notifications on your phone and computer.",
    "Celebrate small wins to maintain motivation throughout the day.",
    "Use natural light when possible; it can improve mood and energy levels.",
    "Mindfulness and meditation can significantly improve your ability to focus."
];

export const translations = {
  en: {
    // General
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    add: 'Add',
    close: 'Close',
    settings: 'Settings',
    reports: 'Reports',
    journal: 'Journal',
    tasks: 'Tasks',

    // Timer
    timeToFocus: 'Time to focus!',
    timeForBreak: 'Time for a break!',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    skip: 'Skip',
    next: 'Next',

    // Tasks
    addTask: 'Add Task',
    taskTitle: 'Task Title',
    estPomos: 'Est. Pomos',
    actPomos: 'Act/Est',
    priority: 'Priority',
    finishAt: 'Finish At',
    addTaskPlaceholder: 'What are you working on?',
    noTaskSelected: 'No task selected',
    pinTask: 'Pin Task',
    unpinTask: 'Unpin Task',
    deleteTask: 'Delete Task',
    markComplete: 'Mark as Complete',
    markIncomplete: 'Mark as Incomplete',
    // Fix: Added missing translation key
    editTask: 'Edit Task',

    // Features
    focusNow: 'Focus Now',
    templates: 'Templates',
    dailyGoal: 'Daily Goal',
    streak: 'Day Streak',
    
    // Settings Screen
    timerSettings: 'Timer Settings',
    pomodoro: 'Pomodoro',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
    longBreakInterval: 'Long Break Interval',
    autoStartBreaks: 'Auto-start Breaks',
    autoStartPomos: 'Auto-start Pomodoros',
    soundSettings: 'Sound Settings',
    alarmSound: 'Alarm Sound',
    alarmVolume: 'Alarm Volume',
    soundscape: 'Background Sound',
    soundscapeVolume: 'Soundscape Volume',
    uiSettings: 'UI Settings',
    themeColor: 'Theme Color',
    language: 'Language',
    dndMode: 'Do Not Disturb',
    customBreakActivities: 'Custom Break Activities',
    addActivity: 'Add Activity',
    keyboardShortcuts: 'Keyboard Shortcuts',
  },
  es: {
    // General
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    confirm: 'Confirmar',
    add: 'Añadir',
    close: 'Cerrar',
    settings: 'Ajustes',
    reports: 'Informes',
    journal: 'Diario',
    tasks: 'Tareas',

    // Timer
    timeToFocus: '¡Hora de concentrarse!',
    timeForBreak: '¡Hora de un descanso!',
    start: 'Empezar',
    pause: 'Pausa',
    reset: 'Reiniciar',
    skip: 'Saltar',
    next: 'Siguiente',

    // Tasks
    addTask: 'Añadir Tarea',
    taskTitle: 'Título de la Tarea',
    estPomos: 'Pomos Est.',
    actPomos: 'Act/Est',
    priority: 'Prioridad',
    finishAt: 'Terminar a las',
    addTaskPlaceholder: '¿En qué estás trabajando?',
    noTaskSelected: 'Ninguna tarea seleccionada',
    pinTask: 'Fijar Tarea',
    unpinTask: 'Desfijar Tarea',
    deleteTask: 'Eliminar Tarea',
    markComplete: 'Marcar como Completada',
    markIncomplete: 'Marcar como Incompleta',
    // Fix: Added missing translation key
    editTask: 'Editar Tarea',

    // Features
    focusNow: 'Enfoque Total',
    templates: 'Plantillas',
    dailyGoal: 'Meta Diaria',
    streak: 'Racha de Días',

    // Settings Screen
    timerSettings: 'Ajustes del Temporizador',
    pomodoro: 'Pomodoro',
    shortBreak: 'Descanso Corto',
    longBreak: 'Descanso Largo',
    longBreakInterval: 'Intervalo de Descanso Largo',
    autoStartBreaks: 'Iniciar Descansos Automáticamente',
    autoStartPomos: 'Iniciar Pomodoros Automáticamente',
    soundSettings: 'Ajustes de Sonido',
    alarmSound: 'Sonido de Alarma',
    alarmVolume: 'Volumen de Alarma',
    soundscape: 'Sonido de Fondo',
    soundscapeVolume: 'Volumen del Sonido de Fondo',
    uiSettings: 'Ajustes de Interfaz',
    themeColor: 'Color del Tema',
    language: 'Idioma',
    dndMode: 'Modo No Molestar',
    customBreakActivities: 'Actividades de Descanso Personalizadas',
    addActivity: 'Añadir Actividad',
    keyboardShortcuts: 'Atajos de Teclado',
  },
  de: {
    // General
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    confirm: 'Bestätigen',
    add: 'Hinzufügen',
    close: 'Schließen',
    settings: 'Einstellungen',
    reports: 'Berichte',
    journal: 'Tagebuch',
    tasks: 'Aufgaben',

    // Timer
    timeToFocus: 'Zeit für Fokus!',
    timeForBreak: 'Zeit für eine Pause!',
    start: 'Start',
    pause: 'Pause',
    reset: 'Zurücksetzen',
    skip: 'Überspringen',
    next: 'Nächste',

    // Tasks
    addTask: 'Aufgabe hinzufügen',
    taskTitle: 'Aufgabentitel',
    estPomos: 'Gesch. Pomos',
    actPomos: 'Akt/Gesch',
    priority: 'Priorität',
    finishAt: 'Fertig um',
    addTaskPlaceholder: 'Woran arbeitest du?',
    noTaskSelected: 'Keine Aufgabe ausgewählt',
    pinTask: 'Aufgabe anheften',
    unpinTask: 'Anheftung lösen',
    deleteTask: 'Aufgabe löschen',
    markComplete: 'Als erledigt markieren',
    markIncomplete: 'Als unerledigt markieren',
    // Fix: Added missing translation key
    editTask: 'Aufgabe bearbeiten',
    
    // Features
    focusNow: 'Fokus Modus',
    templates: 'Vorlagen',
    dailyGoal: 'Tagesziel',
    streak: 'Tage-Serie',

    // Settings Screen
    timerSettings: 'Timer-Einstellungen',
    pomodoro: 'Pomodoro',
    shortBreak: 'Kurze Pause',
    longBreak: 'Lange Pause',
    longBreakInterval: 'Intervall für lange Pausen',
    autoStartBreaks: 'Pausen automatisch starten',
    autoStartPomos: 'Pomodoros automatisch starten',
    soundSettings: 'Sound-Einstellungen',
    alarmSound: 'Alarmton',
    alarmVolume: 'Alarmlautstärke',
    soundscape: 'Hintergrundgeräusch',
    soundscapeVolume: 'Lautstärke des Hintergrundgeräuschs',
    uiSettings: 'UI-Einstellungen',
    // Fix: Corrected typo 'themenfarbe' to 'themeColor' for type consistency.
    themeColor: 'Themenfarbe',
    language: 'Sprache',
    dndMode: 'Bitte nicht stören',
    customBreakActivities: 'Benutzerdefinierte Pausenaktivitäten',
    addActivity: 'Aktivität hinzufügen',
    keyboardShortcuts: 'Tastaturkürzel',
  },
};