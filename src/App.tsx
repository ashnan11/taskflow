import { useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';
import { loadState } from './utils/storage';
import { getDemoTasks } from './utils/seedData';
import { extendedStorage } from './utils/extendedStorage';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { useCloudSync } from './hooks/useCloudSync';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { state, addTask } = useApp();
  const seeded = useRef(false);
  useCloudSync();

  useEffect(() => {
    if (seeded.current) return;
    const onboarding = extendedStorage.getOnboarding();
    if (onboarding.completed || onboarding.skipped) return;
    const saved = loadState();
    if (!saved?.tasks?.length && state.tasks.length === 0) {
      seeded.current = true;
      getDemoTasks().forEach((t) => addTask(t));
    }
  }, [state.tasks.length, addTask]);

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
