import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { subscribeToPushNotifications } from '../services/pushSubscriptionService';

const SESSION_SKIP_KEY = 'taskflow-notification-onboarding-skipped-session';

function getOrCreatePushUserId(authUserId?: string): string {
  if (authUserId) return authUserId;

  let guestId = localStorage.getItem('taskflow-guest-cloud-id');

  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem('taskflow-guest-cloud-id', guestId);
  }

  return guestId;
}

export function useAutoEnablePushOnReminderTask() {
  const { user } = useAuth();
  const { showToast } = useApp();

  useEffect(() => {
    const handleReminderTaskSaved = async () => {
      console.log('AUTO PUSH HOOK TRIGGERED');

      if (!('Notification' in window)) {
        showToast('Notifications are not supported on this browser', 'error');
        return;
      }

      const pushUserId = getOrCreatePushUserId(user?.id);

      console.log('AUTO PUSH USER ID:', pushUserId);
      console.log('CURRENT NOTIFICATION PERMISSION:', Notification.permission);

      // Case 1: Already allowed. Just repair/update push subscription.
      if (Notification.permission === 'granted') {
        const subscription = await subscribeToPushNotifications(pushUserId, {
          forceRefresh: true,
        });

        if (subscription) {
          showToast('Reminders are ready on this device', 'success');
        } else {
          showToast('Push setup failed. Try Enable in Reminder settings.', 'error');
        }

        return;
      }

      // Case 2: User blocked notifications.
      if (Notification.permission === 'denied') {
        showToast(
          'Notifications are blocked. Please allow them from browser/site settings.',
          'error'
        );
        return;
      }

      // Case 3: Permission is default. Ask politely first.
      // Do not show repeatedly in the same app session.
      if (sessionStorage.getItem(SESSION_SKIP_KEY)) {
        showToast(
          'Reminder saved. Enable notifications to receive alerts when app is closed.',
          'info'
        );
        return;
      }

      const wantsReminder = window.confirm(
        'Enable reminders?\n\nTaskFlow can notify you even when the app is closed.\n\nPress OK to enable notifications, or Cancel to do it later.'
      );

      if (!wantsReminder) {
        sessionStorage.setItem(SESSION_SKIP_KEY, 'true');
        showToast('Reminder saved. You can enable notifications later.', 'info');
        return;
      }

      const permission = await Notification.requestPermission();

      console.log('NEW NOTIFICATION PERMISSION:', permission);

      if (permission === 'granted') {
        const subscription = await subscribeToPushNotifications(pushUserId, {
          forceRefresh: true,
        });

        if (subscription) {
          showToast('Notifications enabled for reminders', 'success');
        } else {
          showToast('Notification allowed, but push setup failed.', 'error');
        }

        return;
      }

      if (permission === 'denied') {
        showToast(
          'Notifications were blocked. Allow them from browser/site settings to receive reminders.',
          'error'
        );
        return;
      }

      showToast('Notifications were not enabled. Reminder is still saved.', 'info');
    };

    window.addEventListener('taskflow:reminder-task-saved', handleReminderTaskSaved);

    return () => {
      window.removeEventListener('taskflow:reminder-task-saved', handleReminderTaskSaved);
    };
  }, [user?.id, showToast]);
}