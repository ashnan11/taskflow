import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { Habit } from '../types/settings';

export function todayKey(date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

export function normalizeHabit(raw: Partial<Habit> & { id: string; title: string }): Habit {
  const completions = Array.isArray(raw.completions)
    ? [...new Set(raw.completions.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort()
    : [];

  const habit: Habit = {
    id: raw.id,
    title: (raw.title ?? '').trim(),
    category: raw.category ?? 'Habits',
    completions,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
    isArchived: raw.isArchived ?? false,
    lastCompletedDate: raw.lastCompletedDate ?? null,
    streak: 0,
    bestStreak: 0,
  };

  const streak = computeCurrentStreak(completions, todayKey());
  const best = Math.max(raw.bestStreak ?? 0, computeBestStreak(completions), streak);
  const last =
    completions.length > 0 ? completions[completions.length - 1]! : raw.lastCompletedDate ?? null;

  return {
    ...habit,
    streak,
    bestStreak: best,
    lastCompletedDate: last,
  };
}

export function migrateHabits(raw: unknown[]): Habit[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((h): h is Partial<Habit> & { id: string; title: string } => isObject(h) && typeof h.id === 'string')
    .map((h) => normalizeHabit(h));
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export function computeCurrentStreak(completions: string[], today: string): number {
  if (!completions.length) return 0;
  const set = new Set(completions);
  let cursor = parseISO(today);
  if (!set.has(today)) {
    cursor = addDays(cursor, -1);
  }
  let streak = 0;
  while (set.has(format(cursor, 'yyyy-MM-dd'))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function computeBestStreak(completions: string[]): number {
  if (!completions.length) return 0;
  const sorted = [...new Set(completions)].sort();
  let best = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const gap = differenceInCalendarDays(parseISO(sorted[i]!), parseISO(sorted[i - 1]!));
    if (gap === 1) {
      current++;
      best = Math.max(best, current);
    } else if (gap > 0) {
      current = 1;
    }
  }
  return best;
}

export function isCompletedOnDate(habit: Habit, date: string): boolean {
  return habit.completions.includes(date);
}

export function validateHabitTitle(
  title: string,
  habits: Habit[],
  excludeId?: string
): string | null {
  const trimmed = title.trim();
  if (!trimmed) return 'Habit name cannot be empty.';
  if (trimmed.length > 80) return 'Habit name must be 80 characters or fewer.';
  const duplicate = habits.some(
    (h) =>
      h.id !== excludeId &&
      !h.isArchived &&
      h.title.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) return 'A habit with this name already exists.';
  return null;
}

export function createHabit(title: string, id: string): Habit {
  return normalizeHabit({
    id,
    title: title.trim(),
    category: 'Habits',
    completions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
  });
}

export function updateHabitTitle(habit: Habit, title: string): Habit {
  return {
    ...habit,
    title: title.trim(),
    updatedAt: new Date().toISOString(),
  };
}

export function completeHabitForToday(habit: Habit, today: string): Habit {
  if (habit.completions.includes(today)) return habit;
  const completions = [...habit.completions, today].sort();
  const streak = computeCurrentStreak(completions, today);
  const bestStreak = Math.max(habit.bestStreak, computeBestStreak(completions), streak);
  return {
    ...habit,
    completions,
    streak,
    bestStreak,
    lastCompletedDate: today,
    updatedAt: new Date().toISOString(),
  };
}

export function undoHabitForToday(habit: Habit, today: string): Habit {
  if (!habit.completions.includes(today)) return habit;
  const completions = habit.completions.filter((d) => d !== today);
  const streak = computeCurrentStreak(completions, today);
  const last = completions.length > 0 ? completions[completions.length - 1]! : null;
  return {
    ...habit,
    completions,
    streak,
    lastCompletedDate: last,
    updatedAt: new Date().toISOString(),
  };
}

export function resetHabitStreak(habit: Habit): Habit {
  const preservedBest = Math.max(habit.bestStreak, habit.streak, computeBestStreak(habit.completions));
  return {
    ...habit,
    completions: [],
    streak: 0,
    bestStreak: preservedBest,
    lastCompletedDate: null,
    updatedAt: new Date().toISOString(),
  };
}

export function archiveHabit(habit: Habit, archived: boolean): Habit {
  return {
    ...habit,
    isArchived: archived,
    updatedAt: new Date().toISOString(),
  };
}

export function getHabitStats(habit: Habit) {
  const today = todayKey();
  return {
    currentStreak: habit.streak,
    bestStreak: habit.bestStreak,
    totalCompletions: habit.completions.length,
    lastCompletedDate: habit.lastCompletedDate,
    doneToday: isCompletedOnDate(habit, today),
  };
}
