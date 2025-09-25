// types.ts

export type Priority = 'High' | 'Medium' | 'Low';
export type Mode = 'Work' | 'Short Break' | 'Long Break';
export type TaskFilter = 'All' | 'Active' | 'Completed';
export type TaskSort = 'Priority' | 'Newest' | 'Oldest' | 'Pomos';
export type ScheduleDate = 'Today' | 'Tomorrow' | 'Later';
export type EnergyLevel = 'High' | 'Medium' | 'Low';
export type ThemePalette = 'Default' | 'Colorblind';
export type FontSize = 'small' | 'medium' | 'large';


export interface Task {
  id: string;
  title: string;
  estimatedPomos: number;
  completedPomos: number;
  isCompleted: boolean;
  priority: Priority;
  isPinned: boolean;
  createdAt: number;
  scheduleDate: ScheduleDate;
  dependsOn: string[];
}

export interface PomodoroLabel {
  sessionId: number;
  label: string;
}

export interface SessionLog {
  id: number;
  date: string;
  mode: Mode;
  duration: number; // in seconds
  completed: boolean;
  taskId?: string;
  label?: string;
  mood?: 'great' | 'good' | 'ok' | 'bad';
  focusType?: string;
  energyLevel?: EnergyLevel;
}

export interface SkippedSessionLog {
  timestamp: number;
  mode: Mode;
  reason: string;
}

export interface DistractionLog {
    id: number;
    sessionId?: number;
    timestamp: number;
    reason?: string;
}

export interface JournalEntry {
    date: string; // YYYY-MM-DD
    content: string;
}

export interface DailyReview {
  date: string;
  wentWell: string;
  improve: string;
  distractions: string;
  mood: 'great' | 'good' | 'ok' | 'bad';
}

export interface Settings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomos: boolean;
  autoSwitchTasks: boolean;
  alarmSound: string;
  alarmVolume: number;
  alarmFadeIn: boolean;
  soundscape: string;
  soundscapeVolume: number;
  themeColor: string;
  dailyGoal: number;
  isPremium: boolean;
  dndMode: boolean;
  language: 'en' | 'es' | 'de';
  customBreakSuggestions: string[];
  themePalette: ThemePalette;
  fontSize: FontSize;
  reducedMotion: boolean;
}

export interface Template {
  id: string;
  name: string;
  tasks: Omit<Task, 'id' | 'completedPomos' | 'isCompleted' | 'createdAt' | 'scheduleDate' | 'dependsOn'>[];
}
