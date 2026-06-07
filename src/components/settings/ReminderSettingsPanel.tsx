import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { extendedStorage } from '../../utils/extendedStorage';
import type { ReminderSettings } from '../../types/settings';
import { useReminders } from '../../hooks/useReminders';
import { subscribeToPushNotifications } from '../../services/pushSubscriptionService';

function getOrCreatePushUserId(authUserId?: string): string {
  if (authUserId) return authUserId;

  let guestId = localStorage.getItem('taskflow-guest-cloud-id');

  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem('taskflow-guest-cloud-id', guestId);
  }

  return guestId;
}

function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined') return 'default';

  const notificationApi = (window as unknown as {
    Notification?: {
      permission?: NotificationPermission;
    };
  }).Notification;

  return notificationApi?.permission ?? 'default';
}

export function ReminderSettingsPanel() {
  const { permission, requestPermission } = useReminders();
  const { user } = useAuth();
  const { showToast } = useApp();

  const [settings, setSettings] = useState<ReminderSettings>(() =>
    extendedStorage.getReminderSettings()
  );

  const history = extendedStorage.getReminderHistory().slice(0, 10);

  useEffect(() => {
    const autoRepairPush = async () => {
      if (!('Notification' in window)) return;
      if (getNotificationPermission() !== 'granted') return;

      const pushUserId = getOrCreatePushUserId(user?.id);

      await subscribeToPushNotifications(pushUserId);
    };

    autoRepairPush();
  }, [user?.id]);

  const persist = (next: ReminderSettings) => {
    setSettings(next);
    extendedStorage.setReminderSettings(next);
  };

  const handleEnableNotifications = async () => {
    console.log('ENABLE BUTTON CLICKED');

    if (!('Notification' in window)) {
      showToast('Notifications are not supported on this browser', 'error');
      return;
    }

    const pushUserId = getOrCreatePushUserId(user?.id);

    if (getNotificationPermission() === 'granted') {
      const subscription = await subscribeToPushNotifications(pushUserId, {
        forceRefresh: true,
      });

      if (subscription) {
        showToast('Reminders enabled on this device', 'success');
      } else {
        showToast('Push setup failed. Please try again.', 'error');
      }

      return;
    }

    if (getNotificationPermission() === 'denied') {
      showToast(
        'Notifications are blocked. Please allow them from browser/site settings.',
        'error'
      );
      return;
    }

    const wantsPermission = window.confirm(
      'Enable notifications?\n\nTaskFlow needs notification permission to remind you even when the app is closed.\n\nPress OK to continue, or Cancel to do it later.'
    );

    if (!wantsPermission) {
      showToast('Notifications were not enabled. You can enable them later.', 'info');
      return;
    }

    const result = await requestPermission();

    console.log('NOTIFICATION PERMISSION RESULT:', result);
    console.log('CURRENT NOTIFICATION PERMISSION:', getNotificationPermission());

    if (result === 'granted' || getNotificationPermission() === 'granted') {
      const subscription = await subscribeToPushNotifications(pushUserId, {
        forceRefresh: true,
      });

      if (subscription) {
        showToast('Reminders enabled on this device', 'success');
      } else {
        showToast('Notification allowed, but push setup failed.', 'error');
      }

      return;
    }

    if (getNotificationPermission() === 'denied') {
      showToast(
        'Notifications were blocked. Allow them from browser/site settings.',
        'error'
      );
      return;
    }

    showToast('Notifications were not enabled.', 'info');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 font-semibold">Reminders & notifications</h3>

      <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
        <span className="text-sm">Browser permission: {permission}</span>

        <button
          type="button"
          onClick={handleEnableNotifications}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white hover:bg-brand-700"
        >
          <Bell className="h-3 w-3" /> Enable
        </button>
      </div>

      <div className="space-y-3">
        {(
          [
            ['browserNotifications', 'Browser notifications'],
            ['inAppPopups', 'In-app popup alerts'],
            ['voiceEnabled', 'Voice on reminder'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings[key]}
              onChange={(e) => persist({ ...settings, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}

        <div>
          <label className="mb-1 block text-xs text-slate-500">
            Default snooze (minutes)
          </label>
          <input
            type="number"
            min={1}
            max={120}
            value={settings.defaultSnoozeMinutes}
            onChange={(e) =>
              persist({ ...settings, defaultSnoozeMinutes: +e.target.value })
            }
            className="input"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">
            Background check interval (seconds)
          </label>
          <input
            type="number"
            min={15}
            max={300}
            value={settings.checkIntervalMs / 1000}
            onChange={(e) =>
              persist({
                ...settings,
                checkIntervalMs: Math.max(15000, +e.target.value * 1000),
              })
            }
            className="input"
          />
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 text-sm font-medium text-slate-500">
            Recent reminder history
          </h4>

          <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-slate-600 dark:text-slate-400">
            {history.map((h) => (
              <li key={h.id}>
                {h.taskTitle} — {h.action} — {new Date(h.firedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}