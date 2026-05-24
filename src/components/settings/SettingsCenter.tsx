import { useState } from 'react';
import {
  Bell,
  Database,
  Eye,
  Palette,
  User,
  Volume2,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SettingsPanel } from './SettingsPanel';
import { BackupRestorePanel } from './BackupRestorePanel';
import { VoiceSettingsPanel } from './VoiceSettingsPanel';
import { ReminderSettingsPanel } from './ReminderSettingsPanel';
import { extendedStorage } from '../../utils/extendedStorage';
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  DEFAULT_REMINDER_SETTINGS,
  DEFAULT_VOICE_SETTINGS,
} from '../../types/settings';
import { Link } from 'react-router-dom';
import type { AccessibilitySettings } from '../../types/settings';

type Section = 'general' | 'reminders' | 'voice' | 'data' | 'accessibility' | 'account';

const tabs: { id: Section; label: string; icon: typeof Palette }[] = [
  { id: 'general', label: 'General', icon: Palette },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'voice', label: 'Voice', icon: Volume2 },
  { id: 'data', label: 'Backup', icon: Database },
  { id: 'accessibility', label: 'Accessibility', icon: Eye },
  { id: 'account', label: 'Account', icon: User },
];

export function SettingsCenter() {
  const { showToast } = useApp();
  const [section, setSection] = useState<Section>('general');
  const [a11y, setA11y] = useState<AccessibilitySettings>(() =>
    extendedStorage.getAccessibilitySettings()
  );

  const persistA11y = (next: AccessibilitySettings) => {
    setA11y(next);
    extendedStorage.setAccessibilitySettings(next);
    document.documentElement.classList.toggle('reduce-motion', next.reduceMotion);
    document.documentElement.classList.toggle('high-contrast', next.highContrast);
    document.documentElement.classList.toggle('large-text', next.largeText);
  };

  const resetAll = () => {
    if (!confirm('Reset all app settings? Tasks will remain.')) return;
    extendedStorage.setVoiceSettings(DEFAULT_VOICE_SETTINGS);
    extendedStorage.setReminderSettings(DEFAULT_REMINDER_SETTINGS);
    extendedStorage.setAccessibilitySettings(DEFAULT_ACCESSIBILITY_SETTINGS);
    showToast('Settings reset', 'info');
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-6 text-2xl font-bold">Settings</h2>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Settings sections">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                section === id
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
              aria-current={section === id ? 'true' : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 space-y-6">
          {section === 'general' && <SettingsPanel embedded />}
          {section === 'reminders' && <ReminderSettingsPanel />}
          {section === 'voice' && <VoiceSettingsPanel />}
          {section === 'data' && <BackupRestorePanel />}
          {section === 'accessibility' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 font-semibold">Accessibility</h3>
              <div className="space-y-3">
                {(
                  [
                    ['reduceMotion', 'Reduce motion'],
                    ['highContrast', 'High contrast'],
                    ['largeText', 'Larger text'],
                    ['keyboardHints', 'Keyboard shortcut hints'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={a11y[key]}
                      onChange={(e) => persistA11y({ ...a11y, [key]: e.target.checked })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </section>
          )}
          {section === 'account' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 font-semibold">Account</h3>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                Sign in to sync tasks across devices with Supabase.
              </p>
              <Link
                to="/profile"
                className="inline-block rounded-xl bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
              >
                Open profile
              </Link>
              <Link
                to="/auth"
                className="ml-3 inline-block rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Sign in
              </Link>
            </section>
          )}

          <section className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900 dark:bg-rose-900/10">
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-2 text-sm text-rose-600 hover:underline"
            >
              <RotateCcw className="h-4 w-4" /> Reset app settings
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
