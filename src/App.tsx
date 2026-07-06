import { useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';
import { extendedStorage } from './utils/extendedStorage';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { useCloudSync } from './hooks/useCloudSync';
import { useAutoEnablePushOnReminderTask } from './hooks/useAutoEnablePushOnReminderTask';

function AppInitializer({ children }: { children: React.ReactNode }) {
  useCloudSync();
  useAutoEnablePushOnReminderTask();

  useEffect(() => {
    const a11y = extendedStorage.getAccessibilitySettings();

    document.documentElement.classList.toggle('reduce-motion', a11y.reduceMotion);
    document.documentElement.classList.toggle('high-contrast', a11y.highContrast);
    document.documentElement.classList.toggle('large-text', a11y.largeText);
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <AppInitializer>
            <AppRouter />
          </AppInitializer>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}