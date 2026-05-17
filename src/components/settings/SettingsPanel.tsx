import { Download, Trash2, Timer } from 'lucide-react';
import type { AppView, Priority } from '../../types';
import { useApp } from '../../context/AppContext';
import { ThemeToggle } from '../ui/ThemeToggle';

export function SettingsPanel() {
  const { state, updatePreferences, exportData, clearCompleted, setPomodoroActive, openShortcuts } = useApp();
  const prefs = state.preferences;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold">Appearance</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">Theme</span>
          <ThemeToggle />
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs text-slate-500">Theme mode</label>
          <select
            value={prefs.theme}
            onChange={(e) => updatePreferences({ theme: e.target.value as 'light' | 'dark' | 'system' })}
            className="input"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold">Task defaults</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Default priority</label>
            <select
              value={prefs.defaultPriority}
              onChange={(e) => updatePreferences({ defaultPriority: e.target.value as Priority })}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Default view</label>
            <select
              value={prefs.defaultView}
              onChange={(e) => updatePreferences({ defaultView: e.target.value as AppView })}
              className="input"
            >
              <option value="dashboard">Dashboard</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={prefs.notificationsEnabled}
              onChange={(e) => updatePreferences({ notificationsEnabled: e.target.checked })}
            />
            Enable notifications
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={prefs.showMotivationalMessages}
              onChange={(e) => updatePreferences({ showMotivationalMessages: e.target.checked })}
            />
            Motivational messages on complete
          </label>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Pomodoro duration (minutes)</label>
            <input
              type="number"
              min={5}
              max={60}
              value={prefs.pomodoroMinutes}
              onChange={(e) => updatePreferences({ pomodoroMinutes: +e.target.value })}
              className="input"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold">Tools</h3>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setPomodoroActive(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
            <Timer className="h-4 w-4" /> Open Pomodoro
          </button>
          <button type="button" onClick={openShortcuts} className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
            Keyboard shortcuts
          </button>
          <button type="button" onClick={exportData} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
            <Download className="h-4 w-4" /> Export data
          </button>
          <button type="button" onClick={clearCompleted} className="flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-900/20">
            <Trash2 className="h-4 w-4" /> Clear completed
          </button>
        </div>
      </section>
    </div>
  );
}
