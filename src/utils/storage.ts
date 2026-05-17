import type { AppState } from '../types';
import { DEFAULT_PREFERENCES } from '../types';

const STORAGE_KEY = 'taskflow-app-state';

export function loadState(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AppState>;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save app state');
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function getInitialState(): AppState {
  const saved = loadState();
  return {
    tasks: saved?.tasks ?? [],
    categories: saved?.categories ?? ['Personal', 'Work', 'Learning'],
    allTags: saved?.allTags ?? ['focus', 'urgent', 'meeting'],
    preferences: { ...DEFAULT_PREFERENCES, ...saved?.preferences },
    completionStreak: saved?.completionStreak ?? 0,
    lastActiveDate: saved?.lastActiveDate ?? null,
    weeklyCompletions: saved?.weeklyCompletions ?? [0, 0, 0, 0, 0, 0, 0],
  };
}
