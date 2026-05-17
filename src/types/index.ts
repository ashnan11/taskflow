export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'completed';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
export type AppView =
  | 'dashboard'
  | 'today'
  | 'upcoming'
  | 'important'
  | 'completed'
  | 'archived'
  | 'calendar'
  | 'project'
  | 'tags'
  | 'settings';

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'dueDate'
  | 'priority'
  | 'category'
  | 'status';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  category: string;
  tags: string[];
  dueDate: string | null;
  dueTime: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  isCompleted: boolean;
  isArchived: boolean;
  isImportant: boolean;
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  customRecurrenceDays: number;
  reminder: string | null;
  subtasks: Subtask[];
  notes: string;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  order: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultPriority: Priority;
  defaultView: AppView;
  notificationsEnabled: boolean;
  showMotivationalMessages: boolean;
  pomodoroMinutes: number;
}

export interface AppState {
  tasks: Task[];
  categories: string[];
  allTags: string[];
  preferences: UserPreferences;
  completionStreak: number;
  lastActiveDate: string | null;
  weeklyCompletions: number[];
}

export interface FilterState {
  status: 'all' | 'pending' | 'completed' | 'overdue';
  priority: Priority | 'all';
  category: string | 'all';
  tag: string | 'all';
  dueDate: 'all' | 'today' | 'week' | 'overdue' | 'none';
}

export interface UndoAction {
  type: 'delete' | 'archive' | 'bulk-delete' | 'bulk-archive';
  tasks: Task[];
  message: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  defaultPriority: 'medium',
  defaultView: 'dashboard',
  notificationsEnabled: true,
  showMotivationalMessages: true,
  pomodoroMinutes: 25,
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};
