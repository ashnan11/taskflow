import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { extendedStorage } from '../../utils/extendedStorage';
import type { ReminderSettings } from '../../types/settings';
import { useReminders } from '../../hooks/useReminders';
import { subscribeToPushNotifications } from '../../services/pushSubscriptionService';

export function ReminderSettingsPanel() {
  const { permission, requestPermission } = useReminders();
  const { user } = useAuth();

  const [settings, setSettings] = useState<ReminderSettings>(() =>
    extendedStorage.getReminderSettings()
  );

  const history = extendedStorage.getReminderHistory().slice(0, 10);

  useEffect(() => {
    const autoRepairPush = async () => {
      if (!('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      let pushUserId = user?.id ?? localStorage.getItem('taskflow-guest-cloud-id');

      if (!pushUserId) {
        pushUserId = crypto.randomUUID();
        localStorage.setItem('taskflow-guest-cloud-id', pushUserId);
      }

      await subscribeToPushNotifications(pushUserId);
    };

    autoRepairPush();
  }, [user]);

  const persist = (next: ReminderSettings) => {
    setSettings(next);
    extendedStorage.setReminderSettings(next);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 font-semibold">Reminders & notifications</h3>

      <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
        <span className="text-sm">Browser permission: {permission}</span>

        <button
          type="button"
          onClick={async () => {
            console.log('ENABLE BUTTON CLICKED');

            const result = await requestPermission();

            if (result === 'granted' || Notification.permission === 'granted') {
              let pushUserId = user?.id ?? localStorage.getItem('taskflow-guest-cloud-id');

              if (!pushUserId) {
                pushUserId = crypto.randomUUID();
                localStorage.setItem('taskflow-guest-cloud-id', pushUserId);
              }

              await subscribeToPushNotifications(pushUserId, { forceRefresh: true });
            }
          }}
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