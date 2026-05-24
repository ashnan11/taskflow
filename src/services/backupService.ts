import type { AppState } from '../types';
import type { TaskFlowBackup } from '../types/backup';
import { BACKUP_VERSION } from '../types/backup';
import type {
  AccessibilitySettings,
  Habit,
  OnboardingState,
  ReminderHistoryEntry,
  ReminderSettings,
  SyncSettings,
  TaskTemplate,
  VoiceSettings,
} from '../types/settings';
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  DEFAULT_REMINDER_SETTINGS,
  DEFAULT_SYNC_SETTINGS,
  DEFAULT_VOICE_SETTINGS,
} from '../types/settings';

export interface BackupPayload {
  app: AppState;
  voiceSettings: VoiceSettings;
  reminderSettings: ReminderSettings;
  reminderHistory: ReminderHistoryEntry[];
  accessibilitySettings: AccessibilitySettings;
  syncSettings: SyncSettings;
  habits: Habit[];
  taskTemplates: TaskTemplate[];
  onboarding: OnboardingState;
}

export function createBackup(payload: BackupPayload): TaskFlowBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    ...payload,
  };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isValidTask(t: unknown): boolean {
  if (!isObject(t)) return false;
  return typeof t.id === 'string' && typeof t.title === 'string' && typeof t.status === 'string';
}

export function validateBackup(data: unknown): { valid: true; backup: TaskFlowBackup } | { valid: false; error: string } {
  if (!isObject(data)) return { valid: false, error: 'Invalid backup file format.' };
  if (typeof data.version !== 'number' || data.version < 1) {
    return { valid: false, error: 'Unsupported backup version.' };
  }
  if (!isObject(data.app)) return { valid: false, error: 'Missing app data in backup.' };
  if (!Array.isArray(data.app.tasks)) return { valid: false, error: 'Invalid tasks array in backup.' };
  if (!data.app.tasks.every(isValidTask)) {
    return { valid: false, error: 'One or more tasks are corrupted.' };
  }
  if (!isObject(data.app.preferences)) {
    return { valid: false, error: 'Missing preferences in backup.' };
  }
  return { valid: true, backup: data as unknown as TaskFlowBackup };
}

export function mergeAppState(current: AppState, imported: AppState, mode: 'merge' | 'replace'): AppState {
  if (mode === 'replace') return normalizeAppState(imported);
  const taskMap = new Map(current.tasks.map((t) => [t.id, t]));
  imported.tasks.forEach((t) => taskMap.set(t.id, t));
  return {
    ...current,
    tasks: Array.from(taskMap.values()).sort((a, b) => a.order - b.order),
    categories: [...new Set([...current.categories, ...(imported.categories ?? [])])],
    allTags: [...new Set([...current.allTags, ...(imported.allTags ?? [])])],
    preferences: { ...current.preferences, ...imported.preferences },
    completionStreak: Math.max(current.completionStreak, imported.completionStreak ?? 0),
    lastActiveDate: imported.lastActiveDate ?? current.lastActiveDate,
    weeklyCompletions: imported.weeklyCompletions?.length === 7 ? imported.weeklyCompletions : current.weeklyCompletions,
  };
}

function normalizeAppState(state: AppState): AppState {
  return {
    tasks: state.tasks ?? [],
    categories: state.categories ?? ['Personal', 'Work', 'Learning'],
    allTags: state.allTags ?? [],
    preferences: state.preferences,
    completionStreak: state.completionStreak ?? 0,
    lastActiveDate: state.lastActiveDate ?? null,
    weeklyCompletions: state.weeklyCompletions?.length === 7 ? state.weeklyCompletions : [0, 0, 0, 0, 0, 0, 0],
  };
}

export function parseBackupFile(text: string): { valid: true; backup: TaskFlowBackup } | { valid: false; error: string } {
  try {
    const parsed = JSON.parse(text) as unknown;
    return validateBackup(parsed);
  } catch {
    return { valid: false, error: 'Could not parse JSON file.' };
  }
}

export function downloadBackup(backup: TaskFlowBackup): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-backup-${backup.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getBackupDefaults(): Omit<BackupPayload, 'app'> {
  return {
    voiceSettings: DEFAULT_VOICE_SETTINGS,
    reminderSettings: DEFAULT_REMINDER_SETTINGS,
    reminderHistory: [],
    accessibilitySettings: DEFAULT_ACCESSIBILITY_SETTINGS,
    syncSettings: DEFAULT_SYNC_SETTINGS,
    habits: [],
    taskTemplates: [],
    onboarding: { completed: false, currentStep: 0, skipped: false },
  };
}
