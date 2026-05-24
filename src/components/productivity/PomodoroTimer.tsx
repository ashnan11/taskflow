import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

export function PomodoroTimer() {
  const { pomodoroActive, setPomodoroActive, state } = useApp();
  const minutes = state.preferences.pomodoroMinutes;
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || !pomodoroActive) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          return minutes * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, pomodoroActive, minutes]);

  if (!pomodoroActive) return null;

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed inset-x-4 bottom-above-mobile-chrome z-50 mx-auto w-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:mx-0 lg:w-72"
        role="dialog"
        aria-label="Pomodoro timer"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Pomodoro</span>
          <button type="button" onClick={() => setPomodoroActive(false)} aria-label="Close timer">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
        <p className="text-center text-4xl font-bold tabular-nums">
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setRunning(!running)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm text-white"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            onClick={() => setSecondsLeft(minutes * 60)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
          >
            Reset
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
