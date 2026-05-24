export type VoiceGender = 'auto' | 'male' | 'female';
export type VoiceMessageStyle = 'default' | 'motivational' | 'urgent' | 'calm';

export type VoicePresetId =
  | 'calm-assistant'
  | 'motivational-coach'
  | 'serious-reminder'
  | 'soft-voice'
  | 'energetic-voice'
  | 'custom';

export interface VoicePreset {
  id: VoicePresetId;
  label: string;
  pitch: number;
  rate: number;
  volume: number;
  messageStyle: VoiceMessageStyle;
}

export interface VoiceSettings {
  enabled: boolean;
  gender: VoiceGender;
  voiceURI: string;
  pitch: number;
  rate: number;
  volume: number;
  messageStyle: VoiceMessageStyle;
  presetId: VoicePresetId;
}

export type ReminderRepeat = 'none' | 'daily' | 'weekly';

export interface ReminderSettings {
  browserNotifications: boolean;
  inAppPopups: boolean;
  voiceEnabled: boolean;
  defaultSnoozeMinutes: number;
  defaultRepeat: ReminderRepeat;
  checkIntervalMs: number;
}

export interface ReminderHistoryEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  firedAt: string;
  action: 'fired' | 'snoozed' | 'dismissed' | 'opened';
  snoozeUntil?: string;
}

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  keyboardHints: boolean;
}

export interface SyncSettings {
  autoSync: boolean;
  syncIntervalMs: number;
  lastSyncedAt: string | null;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  streak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  completions: string[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: import('./index').Priority;
  category: string;
  tags: string[];
  estimatedMinutes: number | null;
  subtaskTitles: string[];
}

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  skipped: boolean;
}

export const VOICE_PRESETS: VoicePreset[] = [
  { id: 'calm-assistant', label: 'Calm Assistant', pitch: 0.95, rate: 0.9, volume: 0.85, messageStyle: 'calm' },
  { id: 'motivational-coach', label: 'Motivational Coach', pitch: 1.1, rate: 1.05, volume: 1, messageStyle: 'motivational' },
  { id: 'serious-reminder', label: 'Serious Reminder', pitch: 0.85, rate: 0.95, volume: 1, messageStyle: 'urgent' },
  { id: 'soft-voice', label: 'Soft Voice', pitch: 1.05, rate: 0.85, volume: 0.75, messageStyle: 'calm' },
  { id: 'energetic-voice', label: 'Energetic Voice', pitch: 1.15, rate: 1.15, volume: 1, messageStyle: 'motivational' },
  { id: 'custom', label: 'Custom', pitch: 1, rate: 1, volume: 1, messageStyle: 'default' },
];

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: true,
  gender: 'auto',
  voiceURI: '',
  pitch: 1,
  rate: 1,
  volume: 1,
  messageStyle: 'default',
  presetId: 'calm-assistant',
};

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  browserNotifications: true,
  inAppPopups: true,
  voiceEnabled: true,
  defaultSnoozeMinutes: 10,
  defaultRepeat: 'none',
  checkIntervalMs: 30000,
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  reduceMotion: false,
  highContrast: false,
  largeText: false,
  keyboardHints: true,
};

export const DEFAULT_SYNC_SETTINGS: SyncSettings = {
  autoSync: true,
  syncIntervalMs: 60000,
  lastSyncedAt: null,
};
