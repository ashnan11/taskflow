import type { AppState } from '../types';
import { DEFAULT_PREFERENCES } from '../types';

const STORAGE_KEY = 'taskflow-app-state';

const DEMO_TASK_TITLES = new Set([
  'Submit expense report',
  'Review quarterly goals',
  'Grocery shopping',
  'Complete TypeScript course module',
  'Plan weekend trip',
]);

export function removeDemoTasksFromState(state: Partial<AppState>): Partial<AppState> {
  if (!state.tasks || !Array.isArray(state.tasks)) {
    return state;
  }

  return {
    ...state,
    tasks: state.tasks.filter((task) => !DEMO_TASK_TITLES.has(task.title)),
  };
}

export function loadState(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AppState>;
    return removeDemoTasksFromState(parsed);
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    const cleanState = removeDemoTasksFromState(state) as AppState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState));
  } catch {
    console.error('Failed to save app state');
  }
}

export function exportState(state: AppState): string {
  const cleanState = removeDemoTasksFromState(state);
  return JSON.stringify(cleanState, null, 2);
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