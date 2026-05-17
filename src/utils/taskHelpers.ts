import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
} from 'date-fns';
import type {
  FilterState,
  RecurrenceType,
  SortOption,
  Subtask,
  Task,
} from '../types';
import { PRIORITY_ORDER } from '../types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyTask(overrides: Partial<Task> = {}): Task {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: 'Personal',
    tags: [],
    dueDate: null,
    dueTime: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    isCompleted: false,
    isArchived: false,
    isImportant: false,
    isRecurring: false,
    recurrenceType: 'none',
    customRecurrenceDays: 7,
    reminder: null,
    subtasks: [],
    notes: '',
    estimatedMinutes: null,
    actualMinutes: null,
    order: Date.now(),
    ...overrides,
  };
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.isCompleted || task.isArchived) return false;
  const due = startOfDay(parseISO(task.dueDate));
  return isBefore(due, startOfDay(new Date()));
}

export function isTaskDueToday(task: Task): boolean {
  if (!task.dueDate) return false;
  return isToday(parseISO(task.dueDate));
}

export function isTaskUpcoming(task: Task): boolean {
  if (!task.dueDate || task.isCompleted || task.isArchived) return false;
  const due = parseISO(task.dueDate);
  return isAfter(due, startOfDay(new Date())) && !isToday(due);
}

export function getSubtaskProgress(task: Task): { completed: number; total: number; percent: number } {
  const total = task.subtasks.length;
  if (total === 0) return { completed: 0, total: 0, percent: 0 };
  const completed = task.subtasks.filter((s) => s.isCompleted).length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

export function getNextRecurrenceDate(task: Task): string | null {
  if (!task.isRecurring || !task.dueDate || task.recurrenceType === 'none') return null;
  const base = parseISO(task.dueDate);
  let next: Date;
  switch (task.recurrenceType) {
    case 'daily':
      next = addDays(base, 1);
      break;
    case 'weekly':
      next = addWeeks(base, 1);
      break;
    case 'monthly':
      next = addMonths(base, 1);
      break;
    case 'custom':
      next = addDays(base, task.customRecurrenceDays || 7);
      break;
    default:
      return null;
  }
  return format(next, 'yyyy-MM-dd');
}

export function duplicateTask(task: Task): Task {
  const now = new Date().toISOString();
  return {
    ...task,
    id: generateId(),
    title: `${task.title} (copy)`,
    isCompleted: false,
    isArchived: false,
    status: 'pending',
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    order: Date.now(),
    subtasks: task.subtasks.map((s) => ({ ...s, id: generateId(), isCompleted: false })),
  };
}

export function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
  const sorted = [...tasks];
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'dueDate':
      return sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    case 'priority':
      return sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category));
    case 'status':
      return sorted.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
    default:
      return sorted.sort((a, b) => a.order - b.order);
  }
}

export function filterTasks(tasks: Task[], filters: FilterState): Task[] {
  return tasks.filter((task) => {
    if (filters.status === 'pending' && task.isCompleted) return false;
    if (filters.status === 'completed' && !task.isCompleted) return false;
    if (filters.status === 'overdue' && !isTaskOverdue(task)) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.category !== 'all' && task.category !== filters.category) return false;
    if (filters.tag !== 'all' && !task.tags.includes(filters.tag)) return false;
    if (filters.dueDate === 'today' && !isTaskDueToday(task)) return false;
    if (filters.dueDate === 'overdue' && !isTaskOverdue(task)) return false;
    if (filters.dueDate === 'none' && task.dueDate) return false;
    if (filters.dueDate === 'week') {
      if (!task.dueDate) return false;
      const due = parseISO(task.dueDate);
      const weekEnd = addDays(startOfDay(new Date()), 7);
      if (isBefore(due, startOfDay(new Date())) || isAfter(due, weekEnd)) return false;
    }
    return true;
  });
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.notes.toLowerCase().includes(q)
  );
}

export function getSmartSuggestions(tasks: Task[]): Task[] {
  return [...tasks]
    .filter((t) => !t.isCompleted && !t.isArchived)
    .sort((a, b) => {
      const score = (task: Task) => {
        let s = PRIORITY_ORDER[task.priority] * 10;
        if (isTaskOverdue(task)) s -= 50;
        if (isTaskDueToday(task)) s -= 30;
        if (task.isImportant) s -= 20;
        return s;
      };
      return score(a) - score(b);
    })
    .slice(0, 5);
}

export function formatDueLabel(task: Task): string {
  if (!task.dueDate) return '';
  const date = parseISO(task.dueDate);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d, yyyy');
}

export function groupTasksByDate(tasks: Task[]): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {};
  for (const task of tasks) {
    const key = task.dueDate ?? 'No date';
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  }
  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) => {
      if (a === 'No date') return 1;
      if (b === 'No date') return -1;
      return a.localeCompare(b);
    })
  );
}

export function getMotivationalMessage(): string {
  const messages = [
    'Outstanding! You crushed it.',
    'Another one done. Keep the momentum!',
    'Great focus. Your future self thanks you.',
    'Task complete. You are on fire today!',
    'Well done! Small wins add up.',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function validateTaskTitle(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed) return 'Task title is required';
  if (trimmed.length > 200) return 'Title must be under 200 characters';
  return null;
}

export function createSubtask(title: string): Subtask {
  return { id: generateId(), title: title.trim(), isCompleted: false };
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getRecurrenceLabel(type: RecurrenceType): string {
  const labels: Record<RecurrenceType, string> = {
    none: 'Does not repeat',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    custom: 'Custom',
  };
  return labels[type];
}
