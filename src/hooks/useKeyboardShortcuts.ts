import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function useKeyboardShortcuts() {
  const {
    openAddTask,
    setSearchQuery,
    setCurrentView,
    closeAddTask,
    closeEditTask,
    closeDetails,
    closeShortcuts,
    modals,
    openShortcuts,
  } = useApp();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (e.key === 'Escape') {
        closeAddTask();
        closeEditTask();
        closeDetails();
        closeShortcuts();
        return;
      }

      if (isInput && e.key !== '/') return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openAddTask();
      }
      if (e.key === '/') {
        e.preventDefault();
        const el = document.getElementById('global-search');
        el?.focus();
      }
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setCurrentView('today');
      }
      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        setCurrentView('upcoming');
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCurrentView('completed');
      }
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        openShortcuts();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    openAddTask,
    setSearchQuery,
    setCurrentView,
    closeAddTask,
    closeEditTask,
    closeDetails,
    closeShortcuts,
    openShortcuts,
    modals,
  ]);
}
