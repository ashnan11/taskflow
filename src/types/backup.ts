import type { AppState } from './index';
import type {
  AccessibilitySettings,
  Habit,
  OnboardingState,
  ReminderHistoryEntry,
  ReminderSettings,
  SyncSettings,
  TaskTemplate,
  VoiceSettings,
} from './settings';

export const BACKUP_VERSION = 2;

export interface TaskFlowBackup {
  version: number;
  exportedAt: string;
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

export type ImportMode = 'merge' | 'replace';
