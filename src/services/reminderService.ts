import { parseISO, isBefore, addMinutes, format } from 'date-fns';
import type { Task } from '../types';
import type { ReminderHistoryEntry, ReminderSettings } from '../types/settings';
import { speakReminder } from './voiceService';
import { showTaskNotification } from './notificationService';
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

export { getNotificationPermission, requestNotificationPermission } from './notificationService';

export async function showBrowserNotification(
  reminder: ActiveReminder,
  onClick?: (taskId: string) => void,
  onFallback?: () => void
): Promise<boolean> {
  return showTaskNotification({
    taskId: reminder.taskId,
    taskTitle: reminder.taskTitle,
    dueAt: reminder.dueAt,
    type: reminder.repeat === 'none' ? 'task-reminder' : 'recurring-task',
    onFallback,
  }).then((shown) => {
    if (shown) onClick?.(reminder.taskId);
    return shown;
  });
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
    void showBrowserNotification(reminder, callbacks.onClick, () => callbacks.onInApp(reminder));
  }
  if (settings.inAppPopups) {
    callbacks.onInApp(reminder);
  }
  if (settings.voiceEnabled && voiceSettings.enabled) {
    speakReminder(reminder.taskTitle, voiceSettings);
  }
}
