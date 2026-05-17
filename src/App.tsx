import { useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { loadState } from './utils/storage';
import { getDemoTasks } from './utils/seedData';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { state, addTask } = useApp();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    const saved = loadState();
    if (!saved?.tasks?.length && state.tasks.length === 0) {
      seeded.current = true;
      getDemoTasks().forEach((t) => addTask(t));
    }
  }, [state.tasks.length, addTask]);

  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <AppInitializer>
        <AppLayout />
      </AppInitializer>
    </AppProvider>
  );
}
