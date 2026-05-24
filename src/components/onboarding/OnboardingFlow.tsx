import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { extendedStorage } from '../../utils/extendedStorage';
import { useApp } from '../../context/AppContext';
import { getDemoTasks } from '../../utils/seedData';

const STEPS = [
  {
    title: 'Welcome to TaskFlow',
    body: 'Your premium productivity workspace for tasks, focus, and insights.',
  },
  {
    title: 'Organize your day',
    body: 'Use Today, Upcoming, and Calendar views. Set reminders with voice and browser notifications.',
  },
  {
    title: 'Stay productive',
    body: 'Pomodoro timer, focus mode, analytics, and habits help you build momentum.',
  },
  {
    title: 'Choose your theme',
    body: 'Pick light, dark, or system — you can change this anytime in Settings.',
  },
];

export function OnboardingFlow() {
  const { updatePreferences, addTask, showToast } = useApp();
  const [onboarding, setOnboarding] = useState(() => extendedStorage.getOnboarding());
  const [step, setStep] = useState(onboarding.currentStep);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  if (onboarding.completed || onboarding.skipped) return null;

  const finish = (withDemo: boolean) => {
    if (withDemo) getDemoTasks().forEach((t) => addTask(t));
    updatePreferences({ theme });
    const done = { completed: true, currentStep: STEPS.length, skipped: false };
    extendedStorage.setOnboarding(done);
    setOnboarding(done);
    showToast('Welcome to TaskFlow!', 'success');
  };

  const skip = () => {
    const s = { completed: true, currentStep: step, skipped: true };
    extendedStorage.setOnboarding(s);
    setOnboarding(s);
  };

  const isThemeStep = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900"
        >
          <button
            type="button"
            onClick={skip}
            className="absolute right-6 top-6 rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Skip onboarding"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>

          <h2 id="onboarding-title" className="text-xl font-bold">
            {STEPS[step]?.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{STEPS[step]?.body}</p>

          {isThemeStep && (
            <div className="mt-6 flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`flex-1 rounded-xl border py-2 text-sm capitalize ${
                    theme === t
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}
              />
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <button type="button" onClick={skip} className="flex-1 rounded-xl py-2.5 text-sm text-slate-500">
              Skip
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm text-white hover:bg-brand-700"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => finish(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm text-white hover:bg-brand-700"
              >
                <Check className="h-4 w-4" /> Get started
              </button>
            )}
          </div>

          {isThemeStep && (
            <button
              type="button"
              onClick={() => finish(false)}
              className="mt-3 w-full text-center text-xs text-slate-500"
            >
              Start without demo tasks
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
