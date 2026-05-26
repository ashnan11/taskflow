import { parseISO, isBefore, addMinutes, format } from 'date-fns';
import type { Task } from '../types';
import type { ReminderHistoryEntry, ReminderSettings } from '../types/settings';
import { speakReminder } from './voiceService';
import type { VoiceSettings } from '../types/settings';

export interface ActiveReminder {
  taskId: string;
  taskTitle: string;
  dueAt: Date;
  repeat: 'none' | 'daily' | 'weekly';
}

const firedKeys = new Set<string>();

function reminderKey(taskId: string, dueAt: Date): string {
  return `${taskId}-${dueAt.toISOString()}`;
}

export function getDueReminders(tasks: Task[], now = new Date()): ActiveReminder[] {
  const active: ActiveReminder[] = [];
  for (const task of tasks) {
    if (!task.reminder || task.isCompleted || task.isArchived) continue;
    const dueAt = parseISO(task.reminder);
    if (isBefore(dueAt, now) || dueAt.getTime() <= now.getTime()) {
      const key = reminderKey(task.id, dueAt);
      if (!firedKeys.has(key)) {
        active.push({
          taskId: task.id,
          taskTitle: task.title,
          dueAt,
          repeat: task.isRecurring ? (task.recurrenceType === 'weekly' ? 'weekly' : 'daily') : 'none',
        });
      }
    }
  }
  return active;
}

export function markReminderFired(taskId: string, dueAt: Date): void {
  firedKeys.add(reminderKey(taskId, dueAt));
}

export function clearFiredForTask(taskId: string): void {
  [...firedKeys].forEach((k) => {
    if (k.startsWith(`${taskId}-`)) firedKeys.delete(k);
  });
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function showBrowserNotification(
  reminder: ActiveReminder,
): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification('TaskFlow Reminder', {
      body: reminder.taskTitle,
      icon: '/web-app-manifest-192x192.png',
      badge: '/web-app-manifest-192x192.png',
      tag: reminderKey(reminder.taskId, reminder.dueAt),
      requireInteraction: true,
    });
  });
}
}

export function snoozeReminder(
  task: Task,
  minutes: number,
  updateTask: (task: Task) => void
): void {
  const snoozed = addMinutes(new Date(), minutes);
  updateTask({
    ...task,
    reminder: format(snoozed, "yyyy-MM-dd'T'HH:mm"),
  });
  clearFiredForTask(task.id);
}

export function createHistoryEntry(
  reminder: ActiveReminder,
  action: ReminderHistoryEntry['action'],
  snoozeUntil?: string
): ReminderHistoryEntry {
  return {
    id: `${reminder.taskId}-${Date.now()}`,
    taskId: reminder.taskId,
    taskTitle: reminder.taskTitle,
    firedAt: new Date().toISOString(),
    action,
    snoozeUntil,
  };
}

export function triggerReminderAlerts(
  reminder: ActiveReminder,
  settings: ReminderSettings,
  voiceSettings: VoiceSettings,
  callbacks: {
    onInApp: (r: ActiveReminder) => void;
    onClick?: (taskId: string) => void;
  }
): void {
  markReminderFired(reminder.taskId, reminder.dueAt);
  if (settings.browserNotifications) {
    showBrowserNotification(reminder);
  }
  if (settings.inAppPopups) {
    callbacks.onInApp(reminder);
  }
  if (settings.voiceEnabled && voiceSettings.enabled) {
    speakReminder(reminder.taskTitle, voiceSettings);
  }
}
