import { useEffect, useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdatePrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return (
    <>
      {needRefresh && (
        <div
          className="fixed bottom-above-mobile-chrome left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-white p-4 shadow-xl dark:border-brand-800 dark:bg-slate-900 lg:bottom-4"
          role="alert"
        >
          <p className="text-sm font-medium">Update available</p>
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white"
          >
            <RefreshCw className="h-3 w-3" /> Reload
          </button>
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            className="text-xs text-slate-500"
          >
            Later
          </button>
        </div>
      )}
      {installPrompt && (
        <div className="fixed bottom-above-mobile-chrome left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:bottom-4">
          <p className="text-sm">Install TaskFlow for offline access</p>
          <button
            type="button"
            onClick={async () => {
              await installPrompt.prompt();
              setInstallPrompt(null);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white"
          >
            <Download className="h-3 w-3" /> Install
          </button>
        </div>
      )}
    </>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}
