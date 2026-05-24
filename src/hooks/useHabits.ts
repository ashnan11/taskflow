import { useCallback, useState } from 'react';
import { extendedStorage } from '../utils/extendedStorage';
import type { Habit } from '../types/settings';
import { generateId } from '../utils/taskHelpers';
import {
  archiveHabit,
  completeHabitForToday,
  createHabit,
  resetHabitStreak,
  todayKey,
  undoHabitForToday,
  updateHabitTitle,
  validateHabitTitle,
} from '../services/habitService';
import { useApp } from '../context/AppContext';

export function useHabits() {
  const { showToast } = useApp();
  const [habits, setHabits] = useState<Habit[]>(() => extendedStorage.getHabits());
  const [showArchived, setShowArchived] = useState(false);

  const persist = useCallback((next: Habit[]) => {
    setHabits(next);
    extendedStorage.setHabits(next);
  }, []);

  const activeHabits = habits.filter((h) => !h.isArchived);
  const archivedHabits = habits.filter((h) => h.isArchived);
  const visibleHabits = showArchived ? archivedHabits : activeHabits;

  const addHabit = useCallback(
    (title: string): string | null => {
      const error = validateHabitTitle(title, habits);
      if (error) return error;
      const habit = createHabit(title, generateId());
      persist([...habits, habit]);
      showToast('Habit created', 'success');
      return null;
    },
    [habits, persist, showToast]
  );

  const editHabit = useCallback(
    (id: string, title: string): string | null => {
      const error = validateHabitTitle(title, habits, id);
      if (error) return error;
      persist(habits.map((h) => (h.id === id ? updateHabitTitle(h, title) : h)));
      showToast('Habit updated', 'success');
      return null;
    },
    [habits, persist, showToast]
  );

  const removeHabit = useCallback(
    (id: string) => {
      persist(habits.filter((h) => h.id !== id));
      showToast('Habit deleted', 'info');
    },
    [habits, persist, showToast]
  );

  const toggleArchive = useCallback(
    (id: string, archived: boolean) => {
      persist(habits.map((h) => (h.id === id ? archiveHabit(h, archived) : h)));
      showToast(archived ? 'Habit archived' : 'Habit restored', 'success');
    },
    [habits, persist, showToast]
  );

  const toggleCompleteToday = useCallback(
    (id: string) => {
      const today = todayKey();
      persist(
        habits.map((h) => {
          if (h.id !== id) return h;
          if (h.completions.includes(today)) {
            showToast('Completion undone for today', 'info');
            return undoHabitForToday(h, today);
          }
          const updated = completeHabitForToday(h, today);
          showToast(`Done! ${updated.streak} day streak`, 'success');
          return updated;
        })
      );
    },
    [habits, persist, showToast]
  );

  const resetStreak = useCallback(
    (id: string) => {
      persist(habits.map((h) => (h.id === id ? resetHabitStreak(h) : h)));
      showToast('Streak reset', 'info');
    },
    [habits, persist, showToast]
  );

  return {
    habits,
    activeHabits,
    archivedHabits,
    visibleHabits,
    showArchived,
    setShowArchived,
    addHabit,
    editHabit,
    removeHabit,
    toggleArchive,
    toggleCompleteToday,
    resetStreak,
  };
}
