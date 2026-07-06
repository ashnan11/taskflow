import { useEffect, useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const INSTALL_LATER_KEY = 'taskflow-install-later-until';
const INSTALL_LATER_DAYS = 7;

function getInstallHiddenUntil(): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(INSTALL_LATER_KEY) || '0');
}

function shouldHideInstallPrompt(): boolean {
  return getInstallHiddenUntil() > Date.now();
}

export function PwaUpdatePrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hideInstallPrompt, setHideInstallPrompt] = useState(() =>
    shouldHideInstallPrompt()
  );

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

      if (shouldHideInstallPrompt()) {
        setHideInstallPrompt(true);
        return;
      }

      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallLater = () => {
    const hiddenUntil =
      Date.now() + INSTALL_LATER_DAYS * 24 * 60 * 60 * 1000;

    localStorage.setItem(INSTALL_LATER_KEY, String(hiddenUntil));
    setHideInstallPrompt(true);
    setInstallPrompt(null);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    setInstallPrompt(null);
  };

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

      {installPrompt && !hideInstallPrompt && (
        <div className="fixed bottom-above-mobile-chrome left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:bottom-4">
          <p className="text-sm">Install TaskFlow for offline access</p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallLater}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Later
            </button>

            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs text-white"
            >
              <Download className="h-3 w-3" /> Install
            </button>
          </div>
        </div>
      )}
    </>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}