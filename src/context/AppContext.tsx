import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import { format, isToday, parseISO } from 'date-fns';
import type {
  AppState,
  AppView,
  FilterState,
  Priority,
  SortOption,
  Task,
  UndoAction,
  UserPreferences,
} from '../types';
import { getInitialState, saveState } from '../utils/storage';
import { createBackup, downloadBackup } from '../services/backupService';
import { getAllExtendedForBackup } from '../utils/extendedStorage';
import {
  createEmptyTask,
  duplicateTask,
  generateId,
  getMotivationalMessage,
  getNextRecurrenceDate,
} from '../utils/taskHelpers';

type Action =
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASKS'; payload: string[] }
  | { type: 'RESTORE_TASKS'; payload: Task[] }
  | { type: 'REORDER_TASKS'; payload: Task[] }
  | { type: 'SET_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'ADD_CATEGORY'; payload: string }
  | { type: 'ADD_TAG'; payload: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_TASK': {
      const tags = [...new Set([...state.allTags, ...action.payload.tags])];
      const cats = state.categories.includes(action.payload.category)
        ? state.categories
        : [...state.categories, action.payload.category];
      return { ...state, tasks: [...state.tasks, action.payload], allTags: tags, categories: cats };
    }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)),
        allTags: [...new Set([...state.allTags, ...action.payload.tags])],
      };
    case 'DELETE_TASKS':
      return { ...state, tasks: state.tasks.filter((t) => !action.payload.includes(t.id)) };
    case 'RESTORE_TASKS':
      return { ...state, tasks: [...state.tasks, ...action.payload] };
    case 'REORDER_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'ADD_CATEGORY':
      return state.categories.includes(action.payload)
        ? state
        : { ...state, categories: [...state.categories, action.payload] };
    case 'ADD_TAG':
      return state.allTags.includes(action.payload)
        ? state
        : { ...state, allTags: [...state.allTags, action.payload] };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedProject: string | null;
  setSelectedProject: (p: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  filters: FilterState;
  setFilters: (f: Partial<FilterState>) => void;
  selectedTaskIds: Set<string>;
  toggleSelectTask: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
  focusTaskId: string | null;
  setFocusTaskId: (id: string | null) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  undoAction: UndoAction | null;
  performUndo: () => void;
  addTask: (task: Partial<Task>) => Task;
  updateTask: (task: Task) => void;
  deleteTasks: (ids: string[], withUndo?: boolean) => void;
  toggleComplete: (id: string) => void;
  archiveTasks: (ids: string[], withUndo?: boolean) => void;
  restoreArchived: (ids: string[]) => void;
  duplicateTaskById: (id: string) => void;
  bulkSetPriority: (ids: string[], priority: Priority) => void;
  bulkComplete: (ids: string[]) => void;
  reorderTasks: (tasks: Task[]) => void;
  clearCompleted: () => void;
  exportData: () => void;
  planMyDay: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  modals: {
    addTask: boolean;
    editTask: Task | null;
    detailsTask: Task | null;
    shortcuts: boolean;
    deleteConfirm: { ids: string[]; title: string } | null;
  };
  openAddTask: () => void;
  closeAddTask: () => void;
  openEditTask: (task: Task) => void;
  closeEditTask: () => void;
  openDetails: (task: Task) => void;
  closeDetails: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
  openDeleteConfirm: (ids: string[], title: string) => void;
  closeDeleteConfirm: () => void;
  pomodoroActive: boolean;
  setPomodoroActive: (active: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const defaultFilters: FilterState = {
  status: 'all',
  priority: 'all',
  category: 'all',
  tag: 'all',
  dueDate: 'all',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [toast, setToast] = useState<AppContextValue['toast']>(null);
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [modals, setModals] = useState<AppContextValue['modals']>({
    addTask: false,
    editTask: null,
    detailsTask: null,
    shortcuts: false,
    deleteConfirm: null,
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const onImport = (e: Event) => {
      const { app } = (e as CustomEvent<{ app: AppState }>).detail;
      dispatch({ type: 'SET_STATE', payload: app });
    };
    const onSync = (e: Event) => {
      const merged = (e as CustomEvent<AppState>).detail;
      dispatch({ type: 'SET_STATE', payload: merged });
    };
    window.addEventListener('taskflow:import-state', onImport);
    window.addEventListener('taskflow:sync-merge', onSync);
    return () => {
      window.removeEventListener('taskflow:import-state', onImport);
      window.removeEventListener('taskflow:sync-merge', onSync);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const theme = state.preferences.theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    root.classList.toggle('dark', isDark);
  }, [state.preferences.theme]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!undoAction) return;
    const t = setTimeout(() => setUndoAction(null), 8000);
    return () => clearTimeout(t);
  }, [undoAction]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  const setFilters = useCallback((f: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...f }));
  }, []);

  const toggleSelectTask = useCallback((id: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedTaskIds(new Set()), []);
  const selectAll = useCallback((ids: string[]) => setSelectedTaskIds(new Set(ids)), []);

  const updateStreak = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (state.lastActiveDate === today) return;
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    const streak =
      state.lastActiveDate === yesterday ? state.completionStreak + 1 : state.lastActiveDate ? 1 : 1;
    const weekly = [...state.weeklyCompletions];
    const dayIdx = (new Date().getDay() + 6) % 7;
    weekly[dayIdx] = (weekly[dayIdx] ?? 0) + 1;
    dispatch({
      type: 'SET_STATE',
      payload: { completionStreak: streak, lastActiveDate: today, weeklyCompletions: weekly },
    });
  }, [state.lastActiveDate, state.completionStreak, state.weeklyCompletions]);

  const addTask = useCallback(
    (partial: Partial<Task>) => {
      const task = createEmptyTask({
        priority: state.preferences.defaultPriority,
        order: Date.now(),
        ...partial,
        id: partial.id ?? generateId(),
        title: partial.title?.trim() ?? '',
        updatedAt: new Date().toISOString(),
        createdAt: partial.createdAt ?? new Date().toISOString(),
      });
      dispatch({ type: 'ADD_TASK', payload: task });
      if (partial.category) dispatch({ type: 'ADD_CATEGORY', payload: partial.category });
      partial.tags?.forEach((tag) => dispatch({ type: 'ADD_TAG', payload: tag }));
      showToast('Task created successfully');

      const hasReminder = Boolean(task.reminder || (task.dueDate && task.dueTime));

      if (hasReminder) {
        console.log('REMINDER TASK SAVED EVENT FIRED:', task);
        window.dispatchEvent(
          new CustomEvent('taskflow:reminder-task-saved', { detail: task })
        );
      }

      setTimeout(() => window.dispatchEvent(new Event('taskflow:manual-sync')), 500);

      return task;
    },
    [state.preferences.defaultPriority, showToast]
  );

  const updateTask = useCallback(
    (task: Task) => {
      dispatch({
        type: 'UPDATE_TASK',
        payload: { ...task, updatedAt: new Date().toISOString() },
      });
      showToast('Task updated');

      const hasReminder = Boolean(task.reminder || (task.dueDate && task.dueTime));

      if (hasReminder) {
        console.log('REMINDER TASK UPDATED EVENT FIRED:', task);
        window.dispatchEvent(
          new CustomEvent('taskflow:reminder-task-saved', { detail: task })
        );
      }

      setTimeout(() => window.dispatchEvent(new Event('taskflow:manual-sync')), 500);
    },
    [showToast]
  );

  const deleteTasks = useCallback(
    (ids: string[], withUndo = true) => {
      const toDelete = state.tasks.filter((t) => ids.includes(t.id));
      dispatch({ type: 'DELETE_TASKS', payload: ids });
      clearSelection();
      if (withUndo && toDelete.length > 0) {
        setUndoAction({
          type: ids.length > 1 ? 'bulk-delete' : 'delete',
          tasks: toDelete,
          message: `${toDelete.length} task(s) deleted`,
        });
      }
      showToast(`${ids.length} task(s) deleted`, 'info');
      setTimeout(() => window.dispatchEvent(new Event('taskflow:manual-sync')), 500);
    },
    [state.tasks, clearSelection, showToast]
  );

  const performUndo = useCallback(() => {
    if (!undoAction) return;
    if (undoAction.type === 'archive' || undoAction.type === 'bulk-archive') {
      undoAction.tasks.forEach((t) => {
        dispatch({ type: 'UPDATE_TASK', payload: { ...t, isArchived: false } });
      });
    } else {
      dispatch({ type: 'RESTORE_TASKS', payload: undoAction.tasks });
    }
    setUndoAction(null);
    showToast('Action undone');
  }, [undoAction, showToast]);

  const toggleComplete = useCallback(
    (id: string) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;
      const now = new Date().toISOString();
      const completing = !task.isCompleted;

      if (completing && task.isRecurring && task.dueDate) {
        const nextDate = getNextRecurrenceDate(task);
        if (nextDate) {
          addTask({
            ...duplicateTask(task),
            dueDate: nextDate,
            isCompleted: false,
            completedAt: null,
          });
        }
      }

      updateTask({
        ...task,
        isCompleted: completing,
        status: completing ? 'completed' : 'pending',
        completedAt: completing ? now : null,
      });

      if (completing) {
        updateStreak();
        if (state.preferences.showMotivationalMessages) {
          showToast(getMotivationalMessage());
        }
      }
    },
    [state.tasks, state.preferences.showMotivationalMessages, addTask, updateTask, updateStreak, showToast]
  );

  const archiveTasks = useCallback(
    (ids: string[], withUndo = true) => {
      const archived = state.tasks
        .filter((t) => ids.includes(t.id))
        .map((t) => ({ ...t, isArchived: true, updatedAt: new Date().toISOString() }));
      archived.forEach((t) => dispatch({ type: 'UPDATE_TASK', payload: t }));
      clearSelection();
      if (withUndo) {
        setUndoAction({
          type: ids.length > 1 ? 'bulk-archive' : 'archive',
          tasks: state.tasks.filter((t) => ids.includes(t.id)),
          message: `${ids.length} task(s) archived`,
        });
      }
      showToast(`${ids.length} task(s) archived`);
    },
    [state.tasks, clearSelection, showToast]
  );

  const restoreArchived = useCallback(
    (ids: string[]) => {
      ids.forEach((id) => {
        const task = state.tasks.find((t) => t.id === id);
        if (task) updateTask({ ...task, isArchived: false });
      });
      showToast('Tasks restored');
    },
    [state.tasks, updateTask, showToast]
  );

  const duplicateTaskById = useCallback(
    (id: string) => {
      const task = state.tasks.find((t) => t.id === id);
      if (task) {
        addTask(duplicateTask(task));
        showToast('Task duplicated');
      }
    },
    [state.tasks, addTask, showToast]
  );

  const bulkSetPriority = useCallback(
    (ids: string[], priority: Priority) => {
      ids.forEach((id) => {
        const task = state.tasks.find((t) => t.id === id);
        if (task) updateTask({ ...task, priority });
      });
      clearSelection();
      showToast('Priority updated');
    },
    [state.tasks, updateTask, clearSelection, showToast]
  );

  const bulkComplete = useCallback(
    (ids: string[]) => {
      ids.forEach((id) => toggleComplete(id));
      clearSelection();
    },
    [toggleComplete, clearSelection]
  );

  const reorderTasks = useCallback((tasks: Task[]) => {
    const withOrder = tasks.map((t, i) => ({ ...t, order: i }));
    dispatch({ type: 'REORDER_TASKS', payload: withOrder });
  }, []);

  const clearCompleted = useCallback(() => {
    const ids = state.tasks.filter((t) => t.isCompleted && !t.isArchived).map((t) => t.id);
    deleteTasks(ids, false);
    showToast('Completed tasks cleared');
  }, [state.tasks, deleteTasks, showToast]);

  const exportData = useCallback(() => {
    const backup = createBackup({ app: state, ...getAllExtendedForBackup() });
    downloadBackup(backup);
    showToast('Full backup exported');
  }, [state, showToast]);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    dispatch({ type: 'SET_PREFERENCES', payload: prefs });
  }, []);

  const planMyDay = useCallback(() => {
    const todayTasks = state.tasks.filter(
      (t) => t.dueDate && isToday(parseISO(t.dueDate)) && !t.isCompleted && !t.isArchived
    );
    if (todayTasks.length === 0) {
      showToast('No tasks due today. Add some to plan your day!', 'info');
    } else {
      setCurrentView('today');
      showToast(`You have ${todayTasks.length} tasks for today. Let's go!`);
    }
  }, [state.tasks, showToast]);

  const openAddTask = () => setModals((m) => ({ ...m, addTask: true }));
  const closeAddTask = () => setModals((m) => ({ ...m, addTask: false }));
  const openEditTask = (task: Task) => setModals((m) => ({ ...m, editTask: task }));
  const closeEditTask = () => setModals((m) => ({ ...m, editTask: null }));
  const openDetails = (task: Task) => setModals((m) => ({ ...m, detailsTask: task }));
  const closeDetails = () => setModals((m) => ({ ...m, detailsTask: null }));
  const openShortcuts = () => setModals((m) => ({ ...m, shortcuts: true }));
  const closeShortcuts = () => setModals((m) => ({ ...m, shortcuts: false }));
  const openDeleteConfirm = (ids: string[], title: string) =>
    setModals((m) => ({ ...m, deleteConfirm: { ids, title } }));
  const closeDeleteConfirm = () => setModals((m) => ({ ...m, deleteConfirm: null }));

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      currentView,
      setCurrentView,
      selectedProject,
      setSelectedProject,
      searchQuery,
      setSearchQuery,
      sortBy,
      setSortBy,
      filters,
      setFilters,
      selectedTaskIds,
      toggleSelectTask,
      clearSelection,
      selectAll,
      focusTaskId,
      setFocusTaskId,
      toast,
      showToast,
      undoAction,
      performUndo,
      addTask,
      updateTask,
      deleteTasks,
      toggleComplete,
      archiveTasks,
      restoreArchived,
      duplicateTaskById,
      bulkSetPriority,
      bulkComplete,
      reorderTasks,
      clearCompleted,
      exportData,
      planMyDay,
      updatePreferences,
      sidebarOpen,
      setSidebarOpen,
      modals,
      openAddTask,
      closeAddTask,
      openEditTask,
      closeEditTask,
      openDetails,
      closeDetails,
      openShortcuts,
      closeShortcuts,
      openDeleteConfirm,
      closeDeleteConfirm,
      pomodoroActive,
      setPomodoroActive,
    }),
    [
      state,
      currentView,
      selectedProject,
      searchQuery,
      sortBy,
      filters,
      selectedTaskIds,
      focusTaskId,
      toast,
      undoAction,
      sidebarOpen,
      modals,
      pomodoroActive,
      toggleSelectTask,
      clearSelection,
      selectAll,
      showToast,
      performUndo,
      addTask,
      updateTask,
      deleteTasks,
      toggleComplete,
      archiveTasks,
      restoreArchived,
      duplicateTaskById,
      bulkSetPriority,
      bulkComplete,
      reorderTasks,
      clearCompleted,
      exportData,
      planMyDay,
      updatePreferences,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
