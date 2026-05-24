import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Clock, ExternalLink, X } from 'lucide-react';
import { useReminders } from '../../hooks/useReminders';

const SNOOZE_OPTIONS = [5, 10, 15, 30];

export function ReminderAlert() {
  const { activePopup, dismissPopup, snoozePopup, openFromPopup } = useReminders();

  return (
    <AnimatePresence>
      {activePopup && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-above-mobile-chrome left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-brand-200 bg-white p-4 shadow-2xl dark:border-brand-800 dark:bg-slate-900 lg:bottom-8 lg:left-auto lg:right-8"
          role="alertdialog"
          aria-labelledby="reminder-title"
          aria-describedby="reminder-desc"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/50">
              <Bell className="h-5 w-5 text-brand-600" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 id="reminder-title" className="font-semibold">
                Reminder
              </h3>
              <p id="reminder-desc" className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {activePopup.taskTitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openFromPopup}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                >
                  <ExternalLink className="h-3 w-3" /> Open task
                </button>
                {SNOOZE_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => snoozePopup(m)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <Clock className="h-3 w-3" /> {m}m
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={dismissPopup}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Dismiss reminder"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
