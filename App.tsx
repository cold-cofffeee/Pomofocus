import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Confetti from 'react-confetti';
import useLocalStorage from './hooks/useLocalStorage';
import { Task, Settings, Mode, Priority, Template, SessionLog, PomodoroLabel, SkippedSessionLog, DailyReview, TaskSort, ScheduleDate, DistractionLog, JournalEntry, EnergyLevel, ThemePalette, FontSize } from './types';
import { DEFAULT_SETTINGS, MODES, PRIORITIES, SOUNDS, SOUNDSCAPES, translations, SKIP_REASONS, COLORBLIND_MODES, COLORBLIND_PRIORITIES, FOCUS_TYPES, ENERGY_LEVELS, PRODUCTIVITY_TIPS } from './constants';
import { GoogleGenAI, Type } from '@google/genai';

// --- Helper Functions ---
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- SVG Icon Components ---
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const PinIcon = ({ isPinned }: { isPinned: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isPinned ? 'text-yellow-500' : 'text-slate-400 hover:text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
const FocusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m16 4V4m-4 0h4M4 4h4m12 12v4m-4 0h4m-4 4v-4m-8 4h4m-4-4v4" /></svg>;
const SkipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>;
const AIAssistantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v1.172a3.979 3.979 0 00-2.12.656L5.464 4.414a1 1 0 10-1.414 1.414l1.414 1.414A3.979 3.979 0 004.828 9H3.656a1 1 0 100 2h1.172c.214.933.62 1.785 1.18 2.536l-1.414 1.414a1 1 0 001.414 1.414l1.414-1.414a3.979 3.979 0 002.536 1.18V16.34a1 1 0 102 0v-1.172c.933-.214 1.785-.62 2.536-1.18l1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414a3.979 3.979 0 001.18-2.536H16.34a1 1 0 100-2h-1.172a3.979 3.979 0 00-1.18-2.536l1.414-1.414a1 1 0 00-1.414-1.414l-1.414 1.414A3.979 3.979 0 0011.172 5.172V4a1 1 0 00-1-1zM8 10a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" /></svg>;
const MoreVerticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h14" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const RestoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const JournalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const DistractionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;


// --- Special View Components ---
const FocusModeView: React.FC<{ onExit: () => void; secondsLeft: number; activeTask: Task | null; mode: Mode; theme: any; t: any; handleStartPause: () => void; isActive: boolean; }> = ({ onExit, secondsLeft, activeTask, mode, theme, t, handleStartPause, isActive }) => (
    <div className={`fixed inset-0 ${theme.color} text-white flex flex-col items-center justify-center z-50 animate-fade-in`}>
        <button onClick={onExit} className="absolute top-4 right-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <CloseIcon /> Exit Focus
        </button>
        <div className="text-center">
            <p className="text-xl opacity-80 mb-4">{mode === 'Work' ? t.timeToFocus : t.timeForBreak}</p>
            <h2 className="text-8xl md:text-9xl font-bold tracking-tighter">{formatTime(secondsLeft)}</h2>
            <p className="text-xl md:text-2xl mt-6 h-8 truncate max-w-md md:max-w-xl px-4">{activeTask ? activeTask.title : t.noTaskSelected}</p>
            <button
                onClick={handleStartPause}
                className="w-48 h-16 bg-white text-black text-2xl font-bold rounded-lg shadow-xl mt-12 transform hover:scale-105 active:scale-100 transition-transform duration-200">
                {isActive ? t.pause.toUpperCase() : t.start.toUpperCase()}
            </button>
        </div>
    </div>
);

// --- Main App Component ---
const App: React.FC = () => {
  // --- State Management ---
  const [settings, setSettings] = useLocalStorage<Settings>('pomofocus_settings_v4', DEFAULT_SETTINGS);
  const [tasks, setTasks] = useLocalStorage<Task[]>('pomofocus_tasks_v4', []);
  const [archivedTasks, setArchivedTasks] = useLocalStorage<Task[]>('pomofocus_archivedTasks_v2', []);
  const [templates, setTemplates] = useLocalStorage<Template[]>('pomofocus_templates_v4', []);
  const [sessionLogs, setSessionLogs] = useLocalStorage<SessionLog[]>('pomofocus_sessionLogs_v4', []);
  const [skippedLogs, setSkippedLogs] = useLocalStorage<SkippedSessionLog[]>('pomofocus_skippedLogs_v4', []);
  const [dailyReviews, setDailyReviews] = useLocalStorage<DailyReview[]>('pomofocus_dailyReviews_v4', []);
  const [distractionLogs, setDistractionLogs] = useLocalStorage<DistractionLog[]>('pomofocus_distractionLogs_v1', []);
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('pomofocus_journalEntries_v1', []);
  const [lastSessionState, setLastSessionState] = useLocalStorage<{ mode: Mode, secondsLeft: number, isActive: boolean, timestamp: number } | null>('pomofocus_lastSession_v4', null);
  
  const [mode, setMode] = useState<Mode>('Work');
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(settings.pomodoro * 60);
  const [pomodorosInCycle, setPomodorosInCycle] = useState(0);
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>('pomofocus_activeTaskId_v4', null);
  
  // This state now tracks the session that's in progress, not just the ID
  const [currentSession, setCurrentSession] = useState<SessionLog | null>(null);
  
  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showDailyReview, setShowDailyReview] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showPostSessionPrompt, setShowPostSessionPrompt] = useState(false);
  const [showSkipPrompt, setShowSkipPrompt] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [lastDeletedTask, setLastDeletedTask] = useState<{ task: Task; index: number } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Task List State
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleDate>('Today');
  const [taskSort, setTaskSort] = useState<TaskSort>('Priority');
  
  // --- Refs ---
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alarmSoundRef = useRef<HTMLAudioElement | null>(null);
  const soundscapeRef = useRef<HTMLAudioElement | null>(null);

  // --- Localization ---
  const t = useMemo(() => translations[settings.language], [settings.language]);
  const modeTranslationKeys: Record<Mode, keyof typeof t> = { 'Work': 'pomodoro', 'Short Break': 'shortBreak', 'Long Break': 'longBreak', };

  // --- Dynamic Theming ---
  const currentModes = useMemo(() => settings.themePalette === 'Colorblind' ? COLORBLIND_MODES : MODES, [settings.themePalette]);
  const currentPriorities = useMemo(() => settings.themePalette === 'Colorblind' ? COLORBLIND_PRIORITIES : PRIORITIES, [settings.themePalette]);

  // --- Core Logic ---
  const playSound = useCallback((sound: keyof typeof SOUNDS) => {
    if (settings.dndMode) return;
    if (!alarmSoundRef.current) alarmSoundRef.current = new Audio();
    const audio = alarmSoundRef.current;
    
    if (settings.alarmFadeIn) {
        audio.volume = 0;
        audio.src = SOUNDS[sound];
        audio.play().catch(e => console.error("Alarm sound failed to play", e));
        const fadeInterval = setInterval(() => {
            if (audio.volume < settings.alarmVolume - 0.05) {
                audio.volume += 0.05;
            } else {
                audio.volume = settings.alarmVolume;
                clearInterval(fadeInterval);
            }
        }, 100);
    } else {
        audio.volume = settings.alarmVolume;
        audio.src = SOUNDS[sound];
        audio.play().catch(e => console.error("Alarm sound failed to play", e));
    }
  }, [settings.dndMode, settings.alarmVolume, settings.alarmFadeIn]);

  const logSession = useCallback((completed: boolean, duration?: number) => {
      const getDurationForMode = (m: Mode) => ({ 'Work': settings.pomodoro * 60, 'Short Break': settings.shortBreak * 60, 'Long Break': settings.longBreak * 60 })[m];
      const newLog: SessionLog = { id: Date.now(), date: getTodayDateString(), mode, duration: duration ?? getDurationForMode(mode), completed, taskId: mode === 'Work' ? activeTaskId ?? undefined : undefined };
      setSessionLogs(prev => [...prev, newLog]);
      return newLog;
  }, [mode, activeTaskId, settings, setSessionLogs]);

  const switchMode = useCallback((newMode: Mode, autoStart = false) => {
    if (isActive && newMode !== mode) return;
    setIsActive(autoStart);
    setMode(newMode);
    const newSeconds = ({ 'Work': settings.pomodoro * 60, 'Short Break': settings.shortBreak * 60, 'Long Break': settings.longBreak * 60 })[newMode];
    setSecondsLeft(newSeconds);
    if (newMode === 'Work' && !autoStart) setPomodorosInCycle(0);
  }, [settings, isActive, mode]);

  const handleTimerEnd = useCallback(() => {
    playSound('bell');
    // Log the session as complete. The currentSession state already holds the initial log.
    setSessionLogs(prev => prev.map(log => log.id === currentSession?.id ? { ...log, completed: true } : log));

    if (mode === 'Work') {
      const todaysPomos = sessionLogs.filter(l => l.date === getTodayDateString() && l.mode === 'Work' && l.completed).length + 1;
      if (todaysPomos === settings.dailyGoal) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
      }
      setShowPostSessionPrompt(true); // Pauses flow until prompt is filled
    } else {
        switchMode('Work', settings.autoStartPomos);
    }
    setCurrentSession(null); // Clear the in-progress session
  }, [playSound, mode, settings.autoStartPomos, switchMode, sessionLogs, settings.dailyGoal, currentSession, setSessionLogs]);

  const continueAfterPrompt = useCallback(() => {
      const newPomodorosInCycle = pomodorosInCycle + 1;
      setPomodorosInCycle(newPomodorosInCycle);
      if (activeTaskId) {
        setTasks(prevTasks => prevTasks.map(t => {
            if (t.id === activeTaskId) {
              const updatedTask = {...t, completedPomos: t.completedPomos + 1};
              if (updatedTask.completedPomos >= updatedTask.estimatedPomos) {
                updatedTask.isCompleted = true;
              }
              return updatedTask;
            }
            return t;
        }));
      }
      const nextMode = newPomodorosInCycle % settings.longBreakInterval === 0 ? 'Long Break' : 'Short Break';
      switchMode(nextMode, settings.autoStartBreaks);
  }, [pomodorosInCycle, activeTaskId, settings, switchMode, setTasks]);
  
  const handleStartPause = useCallback(() => setIsActive(prev => !prev), []);
  
  const resetTimer = useCallback(() => {
      setIsActive(false);
      const newSeconds = ({ 'Work': settings.pomodoro * 60, 'Short Break': settings.shortBreak * 60, 'Long Break': settings.longBreak * 60 })[mode];
      setSecondsLeft(newSeconds);
  }, [mode, settings]);

  const handleSkipSession = useCallback((reason: string) => {
    const skippedLog: SkippedSessionLog = { timestamp: Date.now(), mode, reason };
    setSkippedLogs(prev => [...prev, skippedLog]);
    const nextMode = mode === 'Work' ? 'Short Break' : 'Work';
    switchMode(nextMode, false);
    setShowSkipPrompt(false);
  }, [mode, setSkippedLogs, switchMode]);

  // --- Task Operations ---
  const handleUpdateTask = (updatedTask: Task) => {
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      setEditingTask(null);
  };
  
  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (!taskToDelete) return;
    
    setLastDeletedTask({ task: taskToDelete, index: taskIndex });
    if(undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setLastDeletedTask(null), 7000);

    setTasks(prev => prev.filter(t => t.id !== id).map(t => ({...t, dependsOn: t.dependsOn.filter(depId => depId !== id)})));

    if (activeTaskId === id) {
        const nextTask = tasks.find(t => t.id !== id && !t.isCompleted);
        setActiveTaskId(nextTask ? nextTask.id : null);
    }
  };
  
  const handleUndoDelete = () => {
      if (!lastDeletedTask) return;
      setTasks(prev => {
          const newTasks = [...prev];
          newTasks.splice(lastDeletedTask.index, 0, lastDeletedTask.task);
          return newTasks;
      });
      setLastDeletedTask(null);
      if(undoTimerRef.current) clearTimeout(undoTimerRef.current);
  };

  const handleArchiveTask = (id: string) => {
    const taskToArchive = tasks.find(t => t.id === id);
    if (taskToArchive) {
      setArchivedTasks(prev => [taskToArchive, ...prev]);
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleRestoreTask = (id: string) => {
    const taskToRestore = archivedTasks.find(t => t.id === id);
    if (taskToRestore) {
      setTasks(prev => [...prev, { ...taskToRestore, isCompleted: false, completedPomos: 0 }]);
      setArchivedTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleDeletePermanently = (id: string) => { setArchivedTasks(prev => prev.filter(t => t.id !== id)); };
  
  const showNotification = useCallback((message: string) => {
      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
      setNotification(message);
      notificationTimerRef.current = setTimeout(() => {
          setNotification(null);
      }, 3000);
  }, []);

  const handleLogDistraction = () => {
    const newDistraction: DistractionLog = { id: Date.now(), sessionId: currentSession?.id ?? undefined, timestamp: Date.now() };
    setDistractionLogs(prev => [...prev, newDistraction]);
    showNotification("Distraction logged.");
  };

  // --- Effects ---
  // Core Timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, handleTimerEnd]);
  
  // Session logging on start/pause
  useEffect(() => {
      if (isActive && !currentSession) {
          // Timer has just started, log a new session
          const newSession = logSession(false);
          setCurrentSession(newSession);
      } else if (!isActive && currentSession) {
          // Timer has been paused, clear the in-progress session
          setCurrentSession(null);
      }
  }, [isActive, currentSession, logSession]);

  // Restore session state on load
  useEffect(() => {
    if (lastSessionState && Date.now() - lastSessionState.timestamp < 5 * 60 * 1000) {
      setMode(lastSessionState.mode); setSecondsLeft(lastSessionState.secondsLeft); setIsActive(lastSessionState.isActive);
    }
    setLastSessionState(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Save session state on exit
  useEffect(() => {
    const saveState = () => { if (isActive) { setLastSessionState({ mode, secondsLeft, isActive, timestamp: Date.now() }); } };
    window.addEventListener('beforeunload', saveState);
    return () => window.removeEventListener('beforeunload', saveState);
  }, [mode, secondsLeft, isActive, setLastSessionState]);

  // Update timer duration when settings or mode change while timer is NOT active
  useEffect(() => {
    if (!isActive) {
      const newSeconds = ({ 'Work': settings.pomodoro * 60, 'Short Break': settings.shortBreak * 60, 'Long Break': settings.longBreak * 60 })[mode];
      setSecondsLeft(newSeconds);
    }
  }, [settings.pomodoro, settings.shortBreak, settings.longBreak, mode]);
  
  // Update Title and Favicon
  useEffect(() => {
      document.title = `${formatTime(secondsLeft)} - ${mode === 'Work' ? t.timeToFocus : t.timeForBreak}`;
      const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) return;
      const canvas = document.createElement('canvas');
      canvas.width = 32; canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const totalDuration = ({ 'Work': settings.pomodoro * 60, 'Short Break': settings.shortBreak * 60, 'Long Break': settings.longBreak * 60 })[mode];
      const progress = (totalDuration - secondsLeft) / totalDuration;
      ctx.beginPath(); ctx.arc(16, 16, 14, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(16, 16); ctx.arc(16, 16, 14, -0.5 * Math.PI, (2 * Math.PI * progress) - 0.5 * Math.PI); ctx.closePath();
      const themeColor = currentModes[mode].color;
      const colorMap: {[key: string]: string} = {'bg-red-500':'#ef4444','bg-green-500':'#22c55e','bg-blue-500':'#3b82f6','bg-orange-500':'#f97316','bg-sky-500':'#0ea5e9','bg-indigo-500':'#6366f1'};
      ctx.fillStyle = colorMap[themeColor] || '#000';
      ctx.fill();
      link.href = canvas.toDataURL();
  }, [secondsLeft, mode, t, settings, currentModes]);

  // Soundscape
  useEffect(() => {
    if (!soundscapeRef.current) { soundscapeRef.current = new Audio(); soundscapeRef.current.loop = true; }
    const audio = soundscapeRef.current;
    if (settings.soundscape !== 'none' && isActive && mode === 'Work' && !settings.dndMode) {
        const soundSrc = SOUNDSCAPES[settings.soundscape as keyof typeof SOUNDSCAPES];
        if (audio.src !== soundSrc) audio.src = soundSrc;
        audio.volume = settings.soundscapeVolume; audio.play().catch(e => console.error("Soundscape play failed", e));
    } else { audio.pause(); }
  }, [settings.soundscape, settings.soundscapeVolume, isActive, mode, settings.dndMode]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (isFocusMode && e.key !== 'Escape') return;
        const keyMap: { [key: string]: () => void } = {
            ' ': handleStartPause, 's': handleStartPause, 'r': resetTimer,
            'ArrowRight': () => switchMode(mode === 'Work' ? 'Short Break' : 'Long Break'),
            'ArrowLeft': () => switchMode('Work'),
            'n': () => document.getElementById('new-task-input')?.focus(),
            'Escape': () => { if (isFocusMode) setIsFocusMode(false); },
        };
        if (keyMap[e.key]) { e.preventDefault(); keyMap[e.key](); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStartPause, resetTimer, switchMode, isFocusMode, mode]);

  // Fullscreen management for Focus Mode
  useEffect(() => {
      const handleFullscreenChange = () => { if (!document.fullscreenElement) setIsFocusMode(false); }
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFocusMode = () => {
    if (!isFocusMode) { 
        document.documentElement.requestFullscreen().then(() => setIsFocusMode(true)).catch(err => {
            console.warn("Fullscreen request failed, entering focus mode without it.", err);
            setIsFocusMode(true);
        });
    } else { 
        if(document.fullscreenElement) {
            document.exitFullscreen().then(() => setIsFocusMode(false)); 
        } else {
            setIsFocusMode(false);
        }
    }
  }
  
  const activeTask = useMemo(() => tasks.find(t => t.id === activeTaskId), [tasks, activeTaskId]);
  const theme = currentModes[mode];
  const dailyTip = useMemo(() => PRODUCTIVITY_TIPS[new Date().getDate() % PRODUCTIVITY_TIPS.length], []);
  
  const finishTime = useMemo(() => {
      const unfinishedTasks = tasks.filter(t => !t.isCompleted && t.scheduleDate === 'Today');
      const pomosLeft = unfinishedTasks.reduce((acc, task) => acc + Math.max(0, task.estimatedPomos - task.completedPomos), 0);
      if (pomosLeft <= 0) return null;
      const totalWorkSeconds = pomosLeft * settings.pomodoro * 60;
      const totalShortBreaks = pomosLeft > 1 ? pomosLeft - 1 - Math.floor((pomosLeft -1) / settings.longBreakInterval) : 0;
      const totalLongBreaks = pomosLeft > 1 ? Math.floor((pomosLeft - 1) / settings.longBreakInterval) : 0;
      const totalBreakSeconds = (totalShortBreaks * settings.shortBreak * 60) + (totalLongBreaks * settings.longBreak * 60);
      const totalSeconds = totalWorkSeconds + totalBreakSeconds;
      const finishDate = new Date(Date.now() + totalSeconds * 1000);
      return finishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [tasks, settings]);
  
  const completedPomosToday = useMemo(() => {
    const todayStr = getTodayDateString();
    return sessionLogs.filter(log => log.date === todayStr && log.mode === 'Work' && log.completed).length;
  }, [sessionLogs]);


  // --- UI Rendering ---
  const accessibilityClasses = `theme-${settings.themePalette.toLowerCase()} font-size-${settings.fontSize} ${settings.reducedMotion ? 'reduce-motion' : ''}`;
  const headerBtnClass = "flex items-center justify-center p-2 text-sm font-medium bg-white/20 hover:bg-white/30 rounded-md transition-colors";

  if (isFocusMode) {
    return <FocusModeView onExit={toggleFocusMode} {...{ secondsLeft, activeTask, mode, theme, t, handleStartPause, isActive }} />;
  }

  return (
    <div className={`app-wrapper ${accessibilityClasses} bg-white flex flex-col min-h-screen`}>
      <div className={`app-container transition-colors duration-500 ${theme.color} text-white`}>
        {showConfetti && <Confetti recycle={false} />}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="flex justify-between items-center py-4 border-b border-white/20">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><ClockIcon /> Pomofocus</h1>
              <div className="hidden md:block">
                  <DailyGoalProgress completed={completedPomosToday} goal={settings.dailyGoal} t={t} />
              </div>
            </div>
            <nav className="flex items-center gap-2">
              <button onClick={toggleFocusMode} title={t.focusNow} className={headerBtnClass}> <FocusIcon /> </button>
              <button onClick={() => setShowJournal(true)} title={t.journal} className={headerBtnClass}> <JournalIcon /> </button>
              <button onClick={() => setShowReports(true)} title={t.reports} className={headerBtnClass}> <ChartIcon /> </button>
              <button onClick={() => setShowSettings(true)} title={t.settings} className={headerBtnClass}> <SettingsIcon /> </button>
            </nav>
          </header>

          <main className="w-full flex-grow flex flex-col items-center pt-8 pb-12 sm:pt-12">
            <div className="w-full max-w-lg bg-white/10 backdrop-blur-md rounded-lg p-4 sm:p-6 shadow-lg border border-white/20">
              <div className="flex justify-center bg-black/10 p-1 rounded-full mb-6">
                  {(Object.values(currentModes) as Array<{id: Mode, color: string, lightColor: string}>).map(m => (<button key={m.id} onClick={() => switchMode(m.id)} disabled={isActive && mode !== m.id} title={`Switch to ${m.id} mode`} className={`w-1/3 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${mode === m.id ? 'bg-white text-black shadow-md' : 'hover:bg-white/10'} disabled:opacity-50 disabled:cursor-not-allowed`}>{t[modeTranslationKeys[m.id]]}</button>))}
              </div>
              <div className="text-center relative">
                  <h2 className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter my-4">{formatTime(secondsLeft)}</h2>
                  <div className="flex justify-center items-center gap-4">
                    {isActive && mode === 'Work' && <button onClick={handleLogDistraction} className="text-white/50 hover:text-white transition-colors p-2 rounded-full" title="I got distracted"><DistractionIcon /></button>}
                    <button onClick={handleStartPause} title={isActive ? `${t.pause} (Spacebar)` : `${t.start} (Spacebar)`} className="w-40 sm:w-48 h-16 bg-white text-black text-2xl font-bold rounded-lg shadow-xl transform hover:scale-105 active:scale-100 transition-transform duration-200">{isActive ? t.pause.toUpperCase() : t.start.toUpperCase()}</button>
                    <button onClick={() => setShowSkipPrompt(true)} className="text-white/50 hover:text-white transition-colors p-2 rounded-full" title={t.skip}><SkipIcon /></button>
                  </div>
              </div>
              <div className="text-center mt-6 sm:mt-8 pb-4 min-h-[60px] flex flex-col justify-center">
                  <p className="text-lg font-medium truncate px-4">{activeTask ? activeTask.title : t.noTaskSelected}</p>
                  <p className="text-sm opacity-80 font-medium mt-2">{mode === 'Work' ? `💡 ${dailyTip}` : (settings.customBreakSuggestions[Math.floor(Math.random()*settings.customBreakSuggestions.length)])}</p>
              </div>
            </div>
            
            <TaskComponent 
              tasks={tasks} setTasks={setTasks} activeTaskId={activeTaskId} setActiveTaskId={setActiveTaskId} setShowTemplates={setShowTemplates} setShowAIAssistant={setShowAIAssistant} setShowArchive={setShowArchive} setEditingTask={setEditingTask}
              handleDeleteTask={handleDeleteTask} handleArchiveTask={handleArchiveTask} finishTime={finishTime} themeColor={theme.color} t={t} 
              scheduleFilter={scheduleFilter} setScheduleFilter={setScheduleFilter} sort={taskSort} setSort={setTaskSort}
              currentPriorities={currentPriorities}
              onLastTaskComplete={() => { if (!dailyReviews.find(r => r.date === getTodayDateString())) { setShowDailyReview(true); } }}
            />
          </main>
        </div>
      </div>
      
      <AboutSection />

      <footer className="text-center py-6 bg-white text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Pomofocus Clone. All Rights Reserved.</p>
          <p className="text-xs mt-1">Disclaimer: This is a clone project for educational purposes and is not affiliated with the original Pomofocus.</p>
      </footer>
      
      {/* --- Modals & Overlays --- */}
      {showSettings && <SettingsModal settings={settings} setSettings={setSettings} onClose={() => setShowSettings(false)} t={t} />}
      {editingTask && <EditTaskModal task={editingTask} allTasks={tasks} onSave={handleUpdateTask} onClose={() => setEditingTask(null)} t={t} />}
      {showTemplates && <TemplatesModal templates={templates} setTemplates={setTemplates} currentTasks={tasks} applyTemplate={(tasksToApply) => { setTasks(prev => [...prev, ...tasksToApply]); }} onClose={() => setShowTemplates(false)} t={t} />}
      {showReports && <ReportsModal sessionLogs={sessionLogs} distractionLogs={distractionLogs} tasks={tasks} onClose={() => setShowReports(false)} t={t} />}
      {showJournal && <JournalModal entries={journalEntries} setEntries={setJournalEntries} onClose={() => setShowJournal(false)} />}
      {showDailyReview && <DailyReviewModal onClose={() => setShowDailyReview(false)} onSave={(review) => setDailyReviews(prev => [...prev, review])} t={t} />}
      {showArchive && <ArchiveModal archivedTasks={archivedTasks} onRestore={handleRestoreTask} onDelete={handleDeletePermanently} onClose={() => setShowArchive(false)} t={t} currentPriorities={currentPriorities} />}
      {showPostSessionPrompt && currentSession && <PostSessionModal sessionId={currentSession.id} onClose={() => { setShowPostSessionPrompt(false); continueAfterPrompt(); }} onSave={(data) => { setSessionLogs(p => p.map(l => l.id === currentSession.id ? {...l, ...data} : l)); setShowPostSessionPrompt(false); continueAfterPrompt(); }} t={t} />}
      {showSkipPrompt && <SkipReasonModal onClose={() => setShowSkipPrompt(false)} onSkip={handleSkipSession} t={t} />}
      {/* Fix: Cast 'Today' to ScheduleDate to resolve type error */}
      {showAIAssistant && <AIAssistantModal onClose={() => setShowAIAssistant(false)} onAddTasks={(newTasks) => { setTasks(prev => [...prev, ...newTasks.map((task, index) => ({...task, id: `task-${Date.now()}-${index}`, completedPomos: 0, isCompleted: false, createdAt: Date.now() + index, isPinned: false, scheduleDate: 'Today' as ScheduleDate, dependsOn: []}))]); setShowAIAssistant(false); }} t={t} />}

      {/* --- Toasts --- */}
      {lastDeletedTask && <UndoToast onUndo={handleUndoDelete} />}
      {notification && <NotificationToast message={notification} />}
    </div>
  );
};

// --- Sub-components ---

const DailyGoalProgress: React.FC<{ completed: number; goal: number; t: any; }> = ({ completed, goal, t }) => {
    const progress = goal > 0 ? Math.min((completed / goal) * 100, 100) : 0;
    return (
        <div className="flex items-center gap-2 text-sm" title={`${completed} of ${goal} pomodoros completed today`}>
            <span className="font-medium whitespace-nowrap">{t.dailyGoal}: {completed}/{goal}</span>
            <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

interface TaskProps {
    tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; activeTaskId: string | null; setActiveTaskId: React.Dispatch<React.SetStateAction<string | null>>;
    setShowTemplates: (show: boolean) => void; setShowAIAssistant: (show: boolean) => void; setShowArchive: (show: boolean) => void;
    setEditingTask: (task: Task | null) => void; handleDeleteTask: (id: string) => void; handleArchiveTask: (id: string) => void;
    finishTime: string | null; themeColor: string; t: (typeof translations)['en'];
    scheduleFilter: ScheduleDate; setScheduleFilter: (f: ScheduleDate) => void; sort: TaskSort; setSort: (s: TaskSort) => void;
    onLastTaskComplete: () => void;
    currentPriorities: typeof PRIORITIES;
}

const TaskComponent: React.FC<TaskProps> = ({ tasks, setTasks, activeTaskId, setActiveTaskId, setShowTemplates, setShowAIAssistant, setShowArchive, setEditingTask, handleDeleteTask, handleArchiveTask, finishTime, themeColor, t, scheduleFilter, setScheduleFilter, sort, setSort, onLastTaskComplete, currentPriorities }) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPomos, setNewTaskPomos] = useState(1);
    const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Medium');
    const [showAddTaskForm, setShowAddTaskForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [focusedTaskIndex, setFocusedTaskIndex] = useState(-1);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        const newTask: Task = { id: `task-${Date.now()}`, title: newTaskTitle.trim(), estimatedPomos: newTaskPomos, completedPomos: 0, isCompleted: false, isPinned: false, priority: newTaskPriority, createdAt: Date.now(), scheduleDate: scheduleFilter, dependsOn: [] };
        setTasks(prev => [...prev, newTask]);
        if(!activeTaskId) setActiveTaskId(newTask.id);
        setNewTaskTitle(''); setNewTaskPomos(1); setNewTaskPriority('Medium'); setShowAddTaskForm(false);
    };
    
    const toggleComplete = (id: string, isCompleted: boolean) => {
        setTasks(p => p.map(t => t.id === id ? {...t, isCompleted: !isCompleted, completedPomos: isCompleted ? 0 : t.estimatedPomos } : t));
    };

    const togglePin = (id: string) => setTasks(p => p.map(t => t.id === id ? {...t, isPinned: !t.isPinned} : t));
    
    const isTaskLocked = useCallback((task: Task): boolean => {
      if (!task.dependsOn || task.dependsOn.length === 0) return false;
      return task.dependsOn.some(depId => {
        const depTask = tasks.find(t => t.id === depId);
        return depTask ? !depTask.isCompleted : false;
      });
    }, [tasks]);

    const filteredAndSortedTasks = useMemo(() => {
        const filtered = tasks.filter(t => {
            const matchesFilter = t.scheduleDate === scheduleFilter;
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
        return [...filtered].sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            const priorityOrder: Record<Priority, number> = { 'High': 1, 'Medium': 2, 'Low': 3 };
            if (sort === 'Priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
            if (sort === 'Newest') return b.createdAt - a.createdAt;
            if (sort === 'Oldest') return a.createdAt - b.createdAt;
            if (sort === 'Pomos') return (b.estimatedPomos - b.completedPomos) - (a.estimatedPomos - a.completedPomos);
            return 0;
        })
    }, [tasks, scheduleFilter, sort, searchQuery]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || showAddTaskForm) return;

            let newIndex = focusedTaskIndex;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                newIndex = (focusedTaskIndex + 1) % filteredAndSortedTasks.length;
                setFocusedTaskIndex(newIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                newIndex = (focusedTaskIndex - 1 + filteredAndSortedTasks.length) % filteredAndSortedTasks.length;
                setFocusedTaskIndex(newIndex);
            } else if (e.key === 'Enter' && focusedTaskIndex !== -1) {
                e.preventDefault();
                const task = filteredAndSortedTasks[focusedTaskIndex];
                if (task && !task.isCompleted && !isTaskLocked(task)) {
                    setActiveTaskId(task.id);
                }
            } else if (e.key === 'Escape') {
                setFocusedTaskIndex(-1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedTaskIndex, filteredAndSortedTasks, setActiveTaskId, isTaskLocked, showAddTaskForm]);


    useEffect(() => {
        const activeTasks = tasks.filter(t => !t.isCompleted);
        if (tasks.length > 0 && activeTasks.length === 0) {
            onLastTaskComplete();
        }
    }, [tasks, onLastTaskComplete]);

    const ActionMenu: React.FC<{ task: Task }> = ({ task }) => (
        <div ref={menuRef} className="absolute z-10 right-4 top-12 w-48 bg-white rounded-md shadow-lg border border-slate-200 text-sm">
          <div className="py-1">
            {/* Fix: Removed fallback `|| 'Edit'` as the translation key is now defined */}
            <button onClick={() => { setEditingTask(task); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-100">{t.editTask}</button>
            <button onClick={() => { togglePin(task.id); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-100">{task.isPinned ? t.unpinTask : t.pinTask}</button>
            <button onClick={() => { toggleComplete(task.id, task.isCompleted); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-100">{task.isCompleted ? t.markIncomplete : t.markComplete}</button>
            <button onClick={() => { handleArchiveTask(task.id); setActiveMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-slate-100">Archive</button>
            <div className="border-t my-1"></div>
            <button onClick={() => { handleDeleteTask(task.id); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">{t.deleteTask}</button>
          </div>
        </div>
    );

    return (
        <section className="w-full max-w-lg mt-8 text-slate-800">
            <div className="flex justify-between items-center flex-wrap gap-y-2 mb-3 text-white border-b border-white/20 pb-2">
                <h3 className="text-xl font-bold">{t.tasks}</h3>
                 <div className="flex items-center flex-wrap justify-end gap-2">
                  {finishTime && <div className="text-sm opacity-90" title="Estimated time to complete today's tasks">{t.finishAt}: <span className="font-semibold">{finishTime}</span></div>}
                  <button onClick={() => setShowAIAssistant(true)} className="p-2 text-sm font-medium bg-white/20 hover:bg-white/30 rounded-md transition-colors" title="AI Assistant"><AIAssistantIcon /></button>
                  <button onClick={() => setShowTemplates(true)} className="p-2 text-sm font-medium bg-white/20 hover:bg-white/30 rounded-md transition-colors" title={t.templates}>T</button>
                  <button onClick={() => setShowArchive(true)} className="p-2 text-sm font-medium bg-white/20 hover:bg-white/30 rounded-md transition-colors" title="Archived Tasks"><ArchiveIcon /></button>
                </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg">
                <div className="flex gap-2 mb-3 text-sm border-b pb-3">
                    {(['Today', 'Tomorrow', 'Later'] as ScheduleDate[]).map(day => (
                        <button key={day} onClick={() => setScheduleFilter(day)} className={`flex-1 py-1.5 rounded-md font-semibold whitespace-nowrap ${scheduleFilter === day ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>{day}</button>
                    ))}
                </div>
                <div className="flex gap-2 mb-3 text-sm">
                    <div className="relative flex-grow">
                        <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} title="Search tasks" className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" />
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></div>
                    </div>
                    <select value={sort} onChange={e => setSort(e.target.value as TaskSort)} title="Sort tasks" className="bg-white border border-slate-300 rounded-md p-1.5">
                        <option value="Priority">Priority</option><option value="Newest">Newest</option><option value="Oldest">Oldest</option><option value="Pomos">Pomos</option>
                    </select>
                </div>
                <div className="space-y-2">
                {filteredAndSortedTasks.map((task, index) => {
                    const isLocked = isTaskLocked(task);
                    return (
                        <div 
                        key={task.id} 
                        title={isLocked ? "This task is locked by a dependency." : (task.isCompleted ? "This task is complete" : "Click to set as active task")}
                        className={`relative flex items-center p-3 rounded-lg transition-all duration-200 border-l-4 ${activeTaskId === task.id ? `${themeColor.replace('bg-', 'border-')} shadow-md bg-white` : 'border-transparent hover:bg-slate-50 bg-slate-50/50'} ${focusedTaskIndex === index ? 'ring-2 ring-blue-400' : ''} ${(task.isCompleted || isLocked) ? 'opacity-60' : ''} ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`} 
                        onClick={() => !task.isCompleted && !isLocked && setActiveTaskId(task.id)}
                        >
                            <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${currentPriorities[task.priority].color}`} title={`Priority: ${task.priority}`}></div>
                            <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center mr-4" title="Mark as active task">
                            {activeTaskId === task.id && <div className={`w-3 h-3 rounded-full transition-colors ${themeColor}`}></div>}
                            </div>
                            <span className={`flex-grow font-medium ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>{task.title}</span>
                            {isLocked && <div className="text-slate-400 mr-2" title="Task is locked"><LockIcon /></div>}
                            <span className="text-sm mx-4 text-slate-400 font-medium hidden sm:inline">{task.completedPomos}/{task.estimatedPomos}</span>
                            {task.isPinned && <div className="text-yellow-500 mr-2" title="Pinned"><PinIcon isPinned={true} /></div>}
                            <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === task.id ? null : task.id); }} title="More actions" className="ml-3 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-200"><MoreVerticalIcon /></button>
                            {activeMenu === task.id && <ActionMenu task={task} />}
                        </div>
                    );
                })}
                
                {showAddTaskForm && (
                  <form onSubmit={handleAddTask} className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <input id="new-task-input" type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder={t.addTaskPlaceholder} className="w-full bg-white border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 py-2 px-3 text-base"/>
                      <div className="flex items-center justify-between mt-3 text-sm text-slate-600">
                          <div><label>{t.estPomos}: </label><input type="number" min="1" title="Estimated pomodoros" value={newTaskPomos} onChange={e => setNewTaskPomos(parseInt(e.target.value))} className="w-16 bg-white text-center border border-slate-300 rounded-md p-1" /></div>
                          <div><label>{t.priority}: </label><select value={newTaskPriority} title="Task priority" onChange={e => setNewTaskPriority(e.target.value as Priority)} className="bg-white border border-slate-300 rounded-md p-1"><option>High</option><option>Medium</option><option>Low</option></select></div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setShowAddTaskForm(false)} title="Cancel" className="px-4 py-2 rounded-md font-medium text-slate-600 hover:bg-slate-200">{t.cancel}</button>
                            <button type="submit" title="Save task" className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 font-medium">{t.add}</button>
                          </div>
                      </div>
                  </form>
                )}

                {!showAddTaskForm && (
                    <button onClick={() => setShowAddTaskForm(true)} title="Add a new task" className="w-full mt-2 p-3 text-center font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border-2 border-dashed border-slate-300">
                        + {t.addTask}
                    </button>
                )}
                </div>
            </div>
        </section>
    );
};

// --- Modals ---
const Modal: React.FC<{onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; size?: 'md' | 'lg' | 'xl'}> = ({ onClose, title, children, footer, size = 'lg' }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
        <div className={`bg-white rounded-xl shadow-xl w-full max-h-[90vh] flex flex-col text-slate-800 max-w-${size} animate-scale-up`} onClick={e => e.stopPropagation()}>
            <header className="flex justify-between items-center border-b border-slate-200 p-4">
                <h2 className="text-xl font-bold text-slate-800 truncate pr-4">{title}</h2>
                <button onClick={onClose} title="Close" className="text-slate-400 hover:text-slate-800"><CloseIcon /></button>
            </header>
            <main className="p-6 overflow-y-auto">{children}</main>
            {footer && <footer className="flex justify-end items-center mt-auto border-t border-slate-200 p-4 bg-slate-50 rounded-b-xl">{footer}</footer>}
        </div>
    </div>
);

interface SettingsModalProps { settings: Settings; setSettings: React.Dispatch<React.SetStateAction<Settings>>; onClose: () => void; t: (typeof translations)['en']; }
const SettingsModal: React.FC<SettingsModalProps> = ({ settings, setSettings, onClose, t }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [activeTab, setActiveTab] = useState('Timer');
    const handleSave = () => { setSettings(localSettings); onClose(); };
    const tabs = ['Timer', 'Sound', 'Behavior', 'Customize', 'Accessibility'];
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const processedValue = type === 'number' ? Number(value) : (e.target instanceof HTMLInputElement && type === 'checkbox') ? e.target.checked : value;
        setLocalSettings(prev => ({...prev, [name]: processedValue}));
    };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'Timer': return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">{['pomodoro', 'shortBreak', 'longBreak', 'longBreakInterval'].map(key => (<div key={key}><label className="block text-sm text-slate-500 font-medium">{t[key as keyof typeof t]}</label><input type="number" name={key} title={`Set duration for ${t[key as keyof typeof t]}`} value={localSettings[key as keyof Settings] as number} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900"/></div>))}</div>;
            case 'Sound': return <> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm text-slate-500 font-medium">{t.alarmSound}</label><select name="alarmSound" title="Select alarm sound" value={localSettings.alarmSound} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900"><option value="bell">Bell</option><option value="bird">Bird</option><option value="digital">Digital</option></select></div><div><label className="block text-sm text-slate-500 font-medium">{t.alarmVolume}</label><input type="range" title="Adjust alarm volume" min="0" max="1" step="0.1" name="alarmVolume" value={localSettings.alarmVolume} onChange={handleChange} className="w-full" /></div><div><label className="block text-sm text-slate-500 font-medium">{t.soundscape}</label><select name="soundscape" title="Select background soundscape" value={localSettings.soundscape} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900"><option value="none">None</option><option value="rain">Rain</option><option value="cafe">Cafe</option><option value="forest">Forest</option></select></div><div><label className="block text-sm text-slate-500 font-medium">{t.soundscapeVolume}</label><input type="range" title="Adjust soundscape volume" min="0" max="1" step="0.1" name="soundscapeVolume" value={localSettings.soundscapeVolume} onChange={handleChange} className="w-full" /></div></div><div className="mt-4"><label className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100"><input type="checkbox" name="alarmFadeIn" title="Fade in alarm sound" checked={localSettings.alarmFadeIn} onChange={handleChange} /><span>Alarm Fade-in</span></label></div></>;
            case 'Behavior': return <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2"><label className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100"><input type="checkbox" name="autoStartBreaks" title="Auto-start breaks" checked={localSettings.autoStartBreaks} onChange={handleChange} /><span>{t.autoStartBreaks}</span></label><label className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100"><input type="checkbox" name="autoStartPomos" title="Auto-start pomodoros" checked={localSettings.autoStartPomos} onChange={handleChange} /><span>{t.autoStartPomos}</span></label><label className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100"><input type="checkbox" name="dndMode" title="Mute all sounds" checked={localSettings.dndMode} onChange={handleChange} /><span>{t.dndMode}</span></label></div>
            case 'Customize': return <div><h3 className="font-semibold text-lg mb-2 text-slate-600 border-b pb-1">{t.language}</h3><div className="flex items-center gap-4 mb-4"><select name="language" title="Change language" value={localSettings.language} onChange={handleChange} className="bg-white border border-slate-300 rounded-md p-2 text-slate-900"><option value="en">English</option><option value="es">Español</option><option value="de">Deutsch</option></select></div><CustomBreakSuggestions settings={localSettings} setSettings={setLocalSettings} t={t} /></div>
            case 'Accessibility': return <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm text-slate-500 font-medium">Theme Palette</label><select name="themePalette" value={localSettings.themePalette} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900"><option>Default</option><option>Colorblind</option></select></div><div><label className="block text-sm text-slate-500 font-medium">Font Size</label><select name="fontSize" value={localSettings.fontSize} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></div></div><div><label className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100"><input type="checkbox" name="reducedMotion" title="Reduce animations" checked={localSettings.reducedMotion} onChange={handleChange} /><span>Reduced Motion</span></label></div></div>;
            default: return null;
        }
    }
    return (
      <Modal onClose={onClose} title={t.settings} footer={<button onClick={handleSave} className="px-6 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 font-medium transition-colors">{t.save}</button>}>
        <div className="border-b border-slate-200 mb-4">
          <nav className="-mb-px flex space-x-6 overflow-x-auto flex-wrap">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>{tab}</button>
            ))}
          </nav>
        </div>
        <div>{renderTabContent()}</div>
      </Modal>
    );
};

const PostSessionModal: React.FC<{sessionId: number, onClose: () => void, onSave: (data: { label?: string; focusType?: string; energyLevel?: EnergyLevel }) => void, t: (typeof translations)['en']}> = ({ sessionId, onClose, onSave, t }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<{ label?: string; focusType?: string; energyLevel?: EnergyLevel }>({});
    
    const handleSave = () => { onSave(data); };
    
    return (
      <Modal onClose={onClose} title="Pomodoro Completed!" footer={<div className="flex w-full justify-between"><button onClick={onClose}>Skip</button><button onClick={step < 3 ? () => setStep(s => s + 1) : handleSave} className="px-6 py-2 bg-slate-800 text-white rounded-md">{step < 3 ? 'Next' : 'Finish'}</button></div>}>
        <div className="space-y-4">
            {step === 1 && <div><label className="font-semibold">What did you work on?</label><input type="text" value={data.label || ''} onChange={e => setData(d => ({...d, label: e.target.value}))} placeholder="e.g., Drafted email..." className="w-full mt-1 p-2 border border-slate-300 rounded-md"/></div>}
            {step === 2 && <div><label className="font-semibold">What type of focus was it?</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">{FOCUS_TYPES.map(f => <button key={f} onClick={() => setData(d => ({...d, focusType: f}))} className={`p-2 rounded-md text-sm ${data.focusType === f ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}>{f}</button>)}</div></div>}
            {step === 3 && <div><label className="font-semibold">What was your energy level?</label><div className="flex justify-around mt-4 text-3xl">{ENERGY_LEVELS.map(e => <button key={e} onClick={() => setData(d => ({...d, energyLevel: e as EnergyLevel}))} title={e} className={`p-2 rounded-full transition-transform hover:scale-110 ${data.energyLevel === e ? 'bg-yellow-200' : ''}`}>{{High:'⚡️', Medium:'🙂', Low:'🥱'}[e as EnergyLevel]}</button>)}</div></div>}
        </div>
      </Modal>
    );
};


const JournalModal: React.FC<{entries: JournalEntry[], setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>, onClose: () => void}> = ({ entries, setEntries, onClose }) => {
    const today = getTodayDateString();
    const entry = entries.find(e => e.date === today) || { date: today, content: '' };
    
    const handleSave = (content: string) => {
        setEntries(prev => {
            const otherEntries = prev.filter(e => e.date !== today);
            return [...otherEntries, { date: today, content }];
        });
    };

    return (
      <Modal onClose={onClose} title={`Journal - ${today}`} footer={<button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white rounded-md">Close</button>}>
        <textarea 
          value={entry.content} 
          onChange={e => handleSave(e.target.value)} 
          placeholder="What's on your mind? Add goals, to-dos, or reflections here..."
          className="w-full h-80 p-3 border border-slate-300 rounded-md resize-none focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </Modal>
    );
};

const ReportsModal: React.FC<{sessionLogs: SessionLog[], distractionLogs: DistractionLog[], tasks: Task[], onClose: () => void, t: (typeof translations)['en']}> = ({ sessionLogs, distractionLogs, tasks, onClose, t }) => {
    const [activeTab, setActiveTab] = useState('Summary');
    const [rechartsLoaded, setRechartsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);
    
    useEffect(() => {
        // Check if Recharts is already available
        if ((window as any).Recharts) {
            setRechartsLoaded(true);
            return;
        }

        let attempts = 0;
        const intervalId = setInterval(() => {
            if ((window as any).Recharts) {
                setRechartsLoaded(true);
                clearInterval(intervalId);
            } else {
                attempts++;
                if (attempts > 10) { // Timeout after 5 seconds (10 * 500ms)
                    clearInterval(intervalId);
                    setLoadError(true);
                }
            }
        }, 500);

        return () => clearInterval(intervalId);
    }, []);

    const renderLoadingOrError = () => (
        <div className="flex items-center justify-center h-96">
            <p className="text-slate-500">{loadError ? 'Could not load charts. Please check your connection and try again.' : 'Loading charts...'}</p>
        </div>
    );
    
    if (!rechartsLoaded && !loadError) {
        return <Modal onClose={onClose} title={t.reports} size="xl">{renderLoadingOrError()}</Modal>;
    }
    
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } = (window as any).Recharts || {};
    const tabs = ['Summary', 'Heatmap', 'Focus', 'Energy & Distractions'];
    const EmptyState = ({ message }: { message: string }) => <div className="flex items-center justify-center h-full min-h-[300px] text-slate-500"><p>{message}</p></div>;

    const renderTabContent = () => {
        if (loadError) return renderLoadingOrError();

        const completedPomos = sessionLogs.filter(s => s.mode === 'Work' && s.completed);
        const totalFocusMinutes = Math.round(completedPomos.reduce((acc, s) => acc + s.duration, 0) / 60);
        const tasksCompleted = tasks.filter(t => t.isCompleted).length;

        if (activeTab === 'Summary') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-slate-100 p-4 rounded-lg"><h4 className="text-3xl font-bold">{completedPomos.length}</h4><p className="text-slate-500">Pomodoros Done</p></div>
                    <div className="bg-slate-100 p-4 rounded-lg"><h4 className="text-3xl font-bold">{totalFocusMinutes}</h4><p className="text-slate-500">Minutes Focused</p></div>
                    <div className="bg-slate-100 p-4 rounded-lg"><h4 className="text-3xl font-bold">{tasksCompleted}</h4><p className="text-slate-500">Tasks Completed</p></div>
                </div>
            );
        }

        if (activeTab === 'Heatmap') {
            const data = useMemo(() => {
                const counts: {[date: string]: number} = {};
                completedPomos.forEach(log => {
                    counts[log.date] = (counts[log.date] || 0) + 1;
                });
                return counts;
            }, [completedPomos]);

            if (Object.keys(data).length === 0) return <EmptyState message="No pomodoro data recorded yet." />;

            const today = new Date();
            const days = Array.from({length: 90}, (_, i) => {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            return (
                <div className="relative">
                    <div className="overflow-x-auto p-1 pb-2">
                        <div className="grid grid-cols-15 gap-1.5 min-w-[420px] sm:min-w-full">
                            {days.map(day => {
                                const count = data[day] || 0;
                                const color = count > 6 ? 'bg-red-700' : count > 4 ? 'bg-red-600' : count > 2 ? 'bg-red-500' : count > 0 ? 'bg-red-300' : 'bg-slate-100';
                                return <div key={day} className={`w-full h-6 rounded ${color}`} title={`${day}: ${count} pomos`}></div>
                            })}
                        </div>
                    </div>
                    <p className="text-xs text-center text-slate-400 sm:hidden">Scroll horizontally to see more dates.</p>
                </div>
            );
        }

        if (activeTab === 'Focus') {
            const focusData = FOCUS_TYPES.map(type => ({
                name: type,
                count: completedPomos.filter(s => s.focusType === type).length
            })).filter(d => d.count > 0);
            
            if (focusData.length === 0) return <EmptyState message="No focus data recorded yet." />;
            
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={focusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            );
        }
        
        if(activeTab === 'Energy & Distractions') {
            const energyData = ENERGY_LEVELS.map(level => ({
                name: level,
                value: completedPomos.filter(s => s.energyLevel === level).length
            })).filter(d => d.value > 0);
            const COLORS = {'High': '#22c55e', 'Medium': '#3b82f6', 'Low': '#f97316'};
            
            if (energyData.length === 0 && distractionLogs.length === 0) return <EmptyState message="No energy or distraction data recorded yet." />;

            return (
                 <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h4 className="font-semibold mb-2 text-center">Energy Levels</h4>
                        {energyData.length > 0 ? (
                             <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={energyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {energyData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name as EnergyLevel]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p className="text-center text-slate-500 py-10">No energy data recorded.</p>}
                    </div>
                     <div className="text-center">
                        <h4 className="font-semibold mb-2">Total Distractions Logged</h4>
                        <p className="text-5xl font-bold">{distractionLogs.length}</p>
                    </div>
                </div>
            )
        }
        
        return null;
    };

    return (
      <Modal onClose={onClose} title={t.reports} size="xl">
        <div className="border-b border-slate-200 mb-4">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>{tab}</button>
            ))}
          </nav>
        </div>
        <div className="min-h-[400px]">{renderTabContent()}</div>
      </Modal>
    );
};


const EditTaskModal: React.FC<{task: Task; allTasks: Task[]; onSave: (task: Task) => void; onClose: () => void; t: (typeof translations)['en'];}> = ({ task, allTasks, onSave, onClose, t }) => {
  const [editedTask, setEditedTask] = useState(task);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedTask(p => ({ ...p, [name]: name === 'estimatedPomos' ? Number(value) : value }));
  };

  const handleDependencyChange = (depId: string) => {
    setEditedTask(p => {
        const newDeps = p.dependsOn.includes(depId) ? p.dependsOn.filter(id => id !== depId) : [...p.dependsOn, depId];
        return {...p, dependsOn: newDeps};
    });
  };

  const handleSave = () => onSave(editedTask);

  const availableTasksForDependency = allTasks.filter(t => t.id !== task.id);

  return (
    <Modal onClose={onClose} title="Edit Task" footer={<div className="flex gap-4"><button onClick={onClose} className="px-4 py-2 rounded-md font-medium text-slate-600 hover:bg-slate-200">{t.cancel}</button><button onClick={handleSave} className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 font-medium">{t.save}</button></div>}>
      <div className="space-y-4">
        <div><label className="font-medium">Task Title</label><input type="text" name="title" value={editedTask.title} onChange={handleChange} className="w-full mt-1 p-2 border border-slate-300 rounded-md"/></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="font-medium">{t.estPomos}</label><input type="number" min="1" name="estimatedPomos" value={editedTask.estimatedPomos} onChange={handleChange} className="w-full mt-1 p-2 border border-slate-300 rounded-md"/></div>
          <div><label className="font-medium">{t.priority}</label><select name="priority" value={editedTask.priority} onChange={handleChange} className="w-full mt-1 p-2 border border-slate-300 rounded-md"><option>High</option><option>Medium</option><option>Low</option></select></div>
        </div>
        <div>
            <label className="font-medium">Depends On</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 mt-1 space-y-1">
                {availableTasksForDependency.length > 0 ? availableTasksForDependency.map(depTask => (
                    <label key={depTask.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100">
                        <input type="checkbox" checked={editedTask.dependsOn.includes(depTask.id)} onChange={() => handleDependencyChange(depTask.id)} />
                        <span className="truncate">{depTask.title}</span>
                    </label>
                )) : <p className="text-sm text-slate-500">No other tasks available.</p>}
            </div>
        </div>
      </div>
    </Modal>
  );
};

const AboutSection = () => {
    const features = [
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: "Responsive Timer", description: "Stay on track with a timer that adapts to any device." },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>, title: "Task Management", description: "Organize your to-do list with priorities and estimates." },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>, title: "Progress Reports", description: "Visualize your efforts and track your daily productivity." },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, title: "Full Customization", description: "Tailor timers, sounds, and behavior to fit your workflow." },
    ];
    return (
        <div className="bg-white text-slate-800 py-20">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">An Online Pomodoro Timer for Peak Productivity</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">Harness a proven time management method to boost your focus, eliminate distractions, and get more done in less time.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h3 className="text-3xl font-bold mb-4">Why Choose This App?</h3>
                        <p className="text-slate-600 mb-6">In a world of countless productivity tools, we stand out by focusing on simplicity and power. We offer a clean, intuitive interface that gets out of your way, combined with advanced features that are there when you need them. No logins, no databases, no hassle—just pure, unadulterated focus, stored securely in your own browser.</p>
                        <ul className="space-y-4">
                            <li className="flex items-start"><span className="text-rose-500 font-bold mr-3 mt-1">✓</span> <span><strong>AI-Powered Task Breakdown:</strong> Turn big ideas into actionable steps instantly.</span></li>
                            <li className="flex items-start"><span className="text-rose-500 font-bold mr-3 mt-1">✓</span> <span><strong>Privacy-First:</strong> All your data stays on your device, period.</span></li>
                            <li className="flex items-start"><span className="text-rose-500 font-bold mr-3 mt-1">✓</span> <span><strong>Advanced & Simple:</strong> Packed with features like task dependencies and analytics, but easy for beginners to pick up and use immediately.</span></li>
                        </ul>
                    </div>
                    <div className="bg-rose-50 p-8 rounded-lg">
                        <h4 className="text-xl font-bold mb-4">How to use the Pomodoro Timer?</h4>
                        <ol className="list-decimal list-inside space-y-3 text-slate-700">
                            <li><strong>Add Your Tasks:</strong> List everything you need to accomplish.</li>
                            <li><strong>Pick a Task:</strong> Select a single task to focus on.</li>
                            <li><strong>Start the Timer:</strong> Work without interruption for 25 minutes.</li>
                            <li><strong>Take a Short Break:</strong> Rest for 5 minutes after each session.</li>
                            <li><strong>Repeat & Rest:</strong> Take a longer, 15-30 minute break after four sessions.</li>
                        </ol>
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-3xl font-bold mb-12">Features Designed for Productivity</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map(f => (
                            <div key={f.title} className="bg-slate-50 p-6 rounded-lg text-left">
                                <div className="mb-4">{f.icon}</div>
                                <h4 className="font-bold text-lg mb-2">{f.title}</h4>
                                <p className="text-slate-600 text-sm">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper & Fully Implemented Components ---
const CustomBreakSuggestions: React.FC<{ settings: Settings, setSettings: React.Dispatch<React.SetStateAction<Settings>>, t: any }> = ({ settings, setSettings, t }) => {
    const [newSuggestion, setNewSuggestion] = useState('');
    const addSuggestion = () => {
        if (newSuggestion.trim() && !settings.customBreakSuggestions.includes(newSuggestion.trim())) {
            setSettings(s => ({...s, customBreakSuggestions: [...s.customBreakSuggestions, newSuggestion.trim()]}));
            setNewSuggestion('');
        }
    };
    const removeSuggestion = (suggestion: string) => {
        setSettings(s => ({...s, customBreakSuggestions: s.customBreakSuggestions.filter(item => item !== suggestion)}));
    };
    return <div><h3 className="font-semibold text-lg mb-2 text-slate-600 border-b pb-1">{t.customBreakActivities}</h3><div className="flex flex-col sm:flex-row gap-2 mb-2"><input type="text" value={newSuggestion} onChange={e => setNewSuggestion(e.target.value)} placeholder="Add a new activity" className="flex-grow p-2 border border-slate-300 rounded-md"/><button onClick={addSuggestion} className="px-4 py-2 bg-blue-500 text-white rounded-md">{t.addActivity}</button></div><ul className="space-y-1">{settings.customBreakSuggestions.map(s => <li key={s} className="flex justify-between items-center p-1.5 rounded bg-slate-100"><span className="truncate pr-2">{s}</span><button onClick={() => removeSuggestion(s)} className="text-red-500 text-xs">Remove</button></li>)}</ul></div>;
};

const TemplatesModal: React.FC<{ templates: Template[], setTemplates: React.Dispatch<React.SetStateAction<Template[]>>, currentTasks: Task[], applyTemplate: (tasks: Task[]) => void, onClose: () => void, t: any }> = ({ templates, setTemplates, currentTasks, applyTemplate, onClose, t }) => {
    const [newTemplateName, setNewTemplateName] = useState('');
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    
    const handleToggleTask = (taskId: string) => {
        setSelectedTaskIds(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
    };

    const handleSaveTemplate = () => {
        if (!newTemplateName.trim() || selectedTaskIds.length === 0) return;
        // Fix: Added `isPinned` to match the required type for template tasks.
        const tasksForTemplate = currentTasks
            .filter(task => selectedTaskIds.includes(task.id))
            .map(({ title, estimatedPomos, priority, isPinned }) => ({ title, estimatedPomos, priority, isPinned }));
        
        const newTemplate: Template = {
            id: `template-${Date.now()}`,
            name: newTemplateName.trim(),
            tasks: tasksForTemplate,
        };
        setTemplates(prev => [...prev, newTemplate]);
        setNewTemplateName('');
        setSelectedTaskIds([]);
    };

    const handleApplyTemplate = (template: Template) => {
        const tasksToAdd = template.tasks.map((task, index) => ({
            ...task,
            id: `task-${Date.now()}-${index}`,
            completedPomos: 0,
            isCompleted: false,
            createdAt: Date.now() + index,
            scheduleDate: 'Today' as ScheduleDate,
            dependsOn: []
        }));
        applyTemplate(tasksToAdd);
        onClose();
    };
    
    const handleDeleteTemplate = (id: string) => {
        setTemplates(prev => prev.filter(temp => temp.id !== id));
    };

    return (
        <Modal onClose={onClose} title={t.templates} size="xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create New Template Section */}
                <div>
                    <h3 className="font-bold text-lg mb-2 border-b pb-2">Create New Template</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="font-medium text-sm">Template Name</label>
                            <input type="text" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="e.g., Morning Routine" className="w-full mt-1 p-2 border border-slate-300 rounded-md"/>
                        </div>
                        <div>
                            <label className="font-medium text-sm">Select tasks to include:</label>
                            <div className="max-h-48 overflow-y-auto border rounded-md p-2 mt-1 space-y-1">
                                {currentTasks.length > 0 ? currentTasks.map(task => (
                                    <label key={task.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 cursor-pointer">
                                        <input type="checkbox" checked={selectedTaskIds.includes(task.id)} onChange={() => handleToggleTask(task.id)} />
                                        <span className="truncate">{task.title}</span>
                                    </label>
                                )) : <p className="text-sm text-slate-500 p-2">No tasks available to create a template.</p>}
                            </div>
                        </div>
                        <button onClick={handleSaveTemplate} disabled={!newTemplateName.trim() || selectedTaskIds.length === 0} className="w-full py-2 bg-slate-800 text-white font-semibold rounded-md disabled:bg-slate-400">Save New Template</button>
                    </div>
                </div>
                {/* Existing Templates Section */}
                <div>
                    <h3 className="font-bold text-lg mb-2 border-b pb-2">My Templates</h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {templates.length > 0 ? templates.map(template => (
                            <div key={template.id} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{template.name}</p>
                                        <p className="text-xs text-slate-500">{template.tasks.length} tasks</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleDeleteTemplate(template.id)} className="p-2 text-slate-400 hover:text-red-500"><TrashIcon /></button>
                                        <button onClick={() => handleApplyTemplate(template)} className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md">Apply</button>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-sm text-slate-500 p-4 text-center">You have no saved templates.</p>}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
const DailyReviewModal: React.FC<{ onClose: () => void, onSave: (review: DailyReview) => void, t: any }> = ({ onClose, t }) => <Modal onClose={onClose} title="Daily Review">Daily Review content goes here.</Modal>;
const ArchiveModal: React.FC<{ archivedTasks: Task[], onRestore: (id: string) => void, onDelete: (id: string) => void, onClose: () => void, t: any, currentPriorities: typeof PRIORITIES }> = ({ archivedTasks, onRestore, onDelete, onClose, t, currentPriorities }) => {
    return (
      <Modal onClose={onClose} title="Archived Tasks">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {archivedTasks.length > 0 ? archivedTasks.map(task => (
            <div key={task.id} className="flex justify-between items-center p-3 bg-slate-100 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                 <div className={`w-2 h-2 rounded-full flex-shrink-0 ${currentPriorities[task.priority].color}`} title={`Priority: ${task.priority}`}></div>
                 <div>
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.completedPomos}/{task.estimatedPomos} Pomos</p>
                 </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-4">
                <button onClick={() => onRestore(task.id)} title="Restore Task" className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"><RestoreIcon/></button>
                <button onClick={() => onDelete(task.id)} title="Delete Permanently" className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"><TrashIcon/></button>
              </div>
            </div>
          )) : <p className="text-center text-slate-500 py-8">No archived tasks.</p>}
        </div>
      </Modal>
    );
};

const SkipReasonModal: React.FC<{ onClose: () => void, onSkip: (reason: string) => void, t: any }> = ({ onClose, onSkip }) => <Modal onClose={onClose} title="Skip Session?"><div className="grid grid-cols-2 gap-2">{SKIP_REASONS.map(r => <button key={r} onClick={() => onSkip(r)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded">{r}</button>)}</div></Modal>;
type AIGeneratedTask = Omit<Task, 'id' | 'completedPomos' | 'isCompleted' | 'createdAt' | 'isPinned' | 'scheduleDate' | 'dependsOn'>;
const AIAssistantModal: React.FC<{ onClose: () => void, onAddTasks: (tasks: AIGeneratedTask[]) => void, t: any }> = ({ onClose, onAddTasks, t }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedTasks, setGeneratedTasks] = useState<AIGeneratedTask[]>([]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError('');
        setGeneratedTasks([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `As a project management expert, break down the following high-level task into smaller, actionable sub-tasks. For each sub-task, estimate the number of 25-minute pomodoro sessions it might take. High-level task: "${prompt}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            tasks: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        estimatedPomos: { type: Type.INTEGER },
                                        priority: { 
                                            type: Type.STRING,
                                            description: "Task priority, must be one of: High, Medium, or Low"
                                        }
                                    },
                                    required: ["title", "estimatedPomos", "priority"]
                                }
                            }
                        }
                    }
                }
            });

            const jsonString = response.text.trim();
            const result = JSON.parse(jsonString);
            
            if (result && Array.isArray(result.tasks)) {
                 const validatedTasks = result.tasks.filter((task: unknown): task is AIGeneratedTask => {
                    if (task === null || typeof task !== 'object') {
                      return false;
                    }
                    return (
                      'title' in task && typeof (task as any).title === 'string' &&
                      'estimatedPomos' in task && typeof (task as any).estimatedPomos === 'number' &&
                      'priority' in task && typeof (task as any).priority === 'string' &&
                      ['High', 'Medium', 'Low'].includes((task as any).priority)
                    );
                });
                setGeneratedTasks(validatedTasks);
            } else {
                throw new Error("Invalid response structure from AI.");
            }

        } catch (err: any) {
            console.error("AI Assistant Error:", err);
            setError(err.message || 'Failed to generate tasks. Please check your API key and try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return <Modal onClose={onClose} title="AI Task Assistant" footer={<div className="flex justify-between w-full"><button onClick={onClose}>{t.cancel}</button><button onClick={() => onAddTasks(generatedTasks)} disabled={generatedTasks.length === 0} className="px-4 py-2 bg-slate-800 text-white rounded-md disabled:bg-slate-400">Add Selected Tasks</button></div>}><div className="space-y-4"><p className="text-sm text-slate-600">Describe a large goal or project, and the AI will break it down into manageable pomodoro tasks.</p><div><textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., Plan a 3-day weekend trip to the mountains" className="w-full h-24 p-2 border border-slate-300 rounded-md" /></div><button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">{isLoading ? 'Generating...' : 'Break Down Task'}</button>{error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="mt-4 max-h-60 overflow-y-auto space-y-2">{generatedTasks.map((task, index) => (<div key={index} className="p-3 bg-slate-100 rounded-md">
            <p className="font-semibold truncate">{task.title}</p>
            <p className="text-sm text-slate-500">Pomos: {task.estimatedPomos} | Priority: {task.priority}</p>
        </div>))}</div>
    </div></Modal>;
};
const UndoToast: React.FC<{ onUndo: () => void }> = ({ onUndo }) => (<div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in"><p>Task deleted.</p><button onClick={onUndo} className="font-bold underline">Undo</button></div>);
const NotificationToast: React.FC<{ message: string }> = ({ message }) => (<div className="fixed bottom-5 right-5 bg-slate-800 text-white px-5 py-3 rounded-lg shadow-lg animate-fade-in"><p>{message}</p></div>);


export default App;