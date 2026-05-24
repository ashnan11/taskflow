import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { extendedStorage } from '../utils/extendedStorage';
import type { ActiveReminder } from '../services/reminderService';
import {
  createHistoryEntry,
  getDueReminders,
  getNotificationPermission,
  requestNotificationPermission,
  snoozeReminder,
  triggerReminderAlerts,
} from '../services/reminderService';
import type { ReminderSettings } from '../types/settings';

export function useReminders() {
  const { state, openDetails, showToast, updateTask } = useApp();
  const [activePopup, setActivePopup] = useState<ActiveReminder | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    getNotificationPermission()
  );
  const settingsRef = useRef<ReminderSettings>(extendedStorage.getReminderSettings());
  const voiceRef = useRef(extendedStorage.getVoiceSettings());
  const checkingRef = useRef(false);

  const refreshSettings = useCallback(() => {
    settingsRef.current = extendedStorage.getReminderSettings();
    voiceRef.current = extendedStorage.getVoiceSettings();
  }, []);

  const handleClick = useCallback(
    (taskId: string) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) openDetails(task);
      setActivePopup(null);
    },
    [state.tasks, openDetails]
  );

  const checkReminders = useCallback(() => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    refreshSettings();
    const settings = settingsRef.current;
    if (!state.preferences.notificationsEnabled && !settings.browserNotifications) {
      checkingRef.current = false;
      return;
    }
    const due = getDueReminders(state.tasks);
    due.forEach((reminder) => {
      triggerReminderAlerts(reminder, settings, voiceRef.current, {
        onInApp: (r) => setActivePopup(r),
        onClick: handleClick,
      });
      extendedStorage.addReminderHistory(createHistoryEntry(reminder, 'fired'));
    });
    checkingRef.current = false;
  }, [state.tasks, state.preferences.notificationsEnabled, refreshSettings, handleClick]);

  useEffect(() => {
    const interval = settingsRef.current.checkIntervalMs;
    checkReminders();
    const id = setInterval(checkReminders, interval);
    const onVis = () => {
      if (document.visibilityState === 'visible') checkReminders();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [checkReminders]);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') showToast('Notifications enabled', 'success');
    else if (result === 'denied') showToast('Notifications blocked in browser settings', 'error');
    return result;
  }, [showToast]);

  const dismissPopup = useCallback(() => {
    if (activePopup) {
      extendedStorage.addReminderHistory(createHistoryEntry(activePopup, 'dismissed'));
    }
    setActivePopup(null);
  }, [activePopup]);

  const snoozePopup = useCallback(
    (minutes?: number) => {
      if (!activePopup) return;
      const task = state.tasks.find((t) => t.id === activePopup.taskId);
      if (!task) return;
      const mins = minutes ?? settingsRef.current.defaultSnoozeMinutes;
      snoozeReminder(task, mins, updateTask);
      extendedStorage.addReminderHistory(
        createHistoryEntry(activePopup, 'snoozed', new Date(Date.now() + mins * 60000).toISOString())
      );
      setActivePopup(null);
      showToast(`Snoozed for ${mins} minutes`, 'info');
    },
    [activePopup, state.tasks, updateTask, showToast]
  );

  const openFromPopup = useCallback(() => {
    if (activePopup) {
      handleClick(activePopup.taskId);
      extendedStorage.addReminderHistory(createHistoryEntry(activePopup, 'opened'));
    }
  }, [activePopup, handleClick]);

  return {
    activePopup,
    permission,
    requestPermission,
    dismissPopup,
    snoozePopup,
    openFromPopup,
    checkReminders,
  };
}
