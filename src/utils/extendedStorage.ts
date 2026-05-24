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
import { migrateHabits } from '../services/habitService';

const KEYS = {
  voice: 'taskflow-voice-settings',
  reminders: 'taskflow-reminder-settings',
  reminderHistory: 'taskflow-reminder-history',
  accessibility: 'taskflow-a11y-settings',
  sync: 'taskflow-sync-settings',
  habits: 'taskflow-habits',
  templates: 'taskflow-templates',
  onboarding: 'taskflow-onboarding',
  rememberMe: 'taskflow-remember-me',
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error(`Failed to save ${key}`);
  }
}

export const extendedStorage = {
  getVoiceSettings: () => load(KEYS.voice, DEFAULT_VOICE_SETTINGS),
  setVoiceSettings: (v: VoiceSettings) => save(KEYS.voice, v),

  getReminderSettings: () => load(KEYS.reminders, DEFAULT_REMINDER_SETTINGS),
  setReminderSettings: (v: ReminderSettings) => save(KEYS.reminders, v),

  getReminderHistory: (): ReminderHistoryEntry[] => {
    try {
      const raw = localStorage.getItem(KEYS.reminderHistory);
      return raw ? (JSON.parse(raw) as ReminderHistoryEntry[]) : [];
    } catch {
      return [];
    }
  },
  setReminderHistory: (entries: ReminderHistoryEntry[]) => {
    save(KEYS.reminderHistory, entries.slice(-100));
  },
  addReminderHistory: (entry: ReminderHistoryEntry) => {
    const history = extendedStorage.getReminderHistory();
    extendedStorage.setReminderHistory([entry, ...history].slice(0, 100));
  },

  getAccessibilitySettings: () => load(KEYS.accessibility, DEFAULT_ACCESSIBILITY_SETTINGS),
  setAccessibilitySettings: (v: AccessibilitySettings) => save(KEYS.accessibility, v),

  getSyncSettings: () => load(KEYS.sync, DEFAULT_SYNC_SETTINGS),
  setSyncSettings: (v: SyncSettings) => save(KEYS.sync, v),

  getHabits: (): Habit[] => {
    try {
      const raw = localStorage.getItem(KEYS.habits);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      return migrateHabits(Array.isArray(parsed) ? parsed : []);
    } catch {
      return [];
    }
  },
  setHabits: (h: Habit[]) => save(KEYS.habits, h),

  getTemplates: (): TaskTemplate[] => {
    try {
      const raw = localStorage.getItem(KEYS.templates);
      return raw ? (JSON.parse(raw) as TaskTemplate[]) : [];
    } catch {
      return [];
    }
  },
  setTemplates: (t: TaskTemplate[]) => save(KEYS.templates, t),

  getOnboarding: (): OnboardingState =>
    load(KEYS.onboarding, { completed: false, currentStep: 0, skipped: false }),
  setOnboarding: (o: OnboardingState) => save(KEYS.onboarding, o),

  getRememberMe: () => localStorage.getItem(KEYS.rememberMe) === 'true',
  setRememberMe: (v: boolean) => localStorage.setItem(KEYS.rememberMe, String(v)),
};

export function getAllExtendedForBackup() {
  return {
    voiceSettings: extendedStorage.getVoiceSettings(),
    reminderSettings: extendedStorage.getReminderSettings(),
    reminderHistory: extendedStorage.getReminderHistory(),
    accessibilitySettings: extendedStorage.getAccessibilitySettings(),
    syncSettings: extendedStorage.getSyncSettings(),
    habits: extendedStorage.getHabits(),
    taskTemplates: extendedStorage.getTemplates(),
    onboarding: extendedStorage.getOnboarding(),
  };
}

export function restoreAllExtended(data: ReturnType<typeof getAllExtendedForBackup>): void {
  extendedStorage.setVoiceSettings(data.voiceSettings);
  extendedStorage.setReminderSettings(data.reminderSettings);
  extendedStorage.setReminderHistory(data.reminderHistory);
  extendedStorage.setAccessibilitySettings(data.accessibilitySettings);
  extendedStorage.setSyncSettings(data.syncSettings);
  extendedStorage.setHabits(data.habits);
  extendedStorage.setTemplates(data.taskTemplates);
  extendedStorage.setOnboarding(data.onboarding);
}
