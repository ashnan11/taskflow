import { useMemo } from 'react';
import type { Task } from '../types';
import { useApp } from '../context/AppContext';
import {
  filterTasks,
  isTaskDueToday,
  isTaskOverdue,
  isTaskUpcoming,
  searchTasks,
  sortTasks,
} from '../utils/taskHelpers';

export function useTaskList(): Task[] {
  const { state, currentView, selectedProject, searchQuery, sortBy, filters } = useApp();

  return useMemo(() => {
    let tasks = state.tasks;

    switch (currentView) {
      case 'today':
        tasks = tasks.filter((t) => !t.isArchived && (isTaskDueToday(t) || (!t.dueDate && !t.isCompleted)));
        break;
      case 'upcoming':
        tasks = tasks.filter((t) => !t.isArchived && isTaskUpcoming(t));
        break;
      case 'important':
        tasks = tasks.filter(
          (t) =>
            !t.isArchived &&
            !t.isCompleted &&
            (t.isImportant || t.priority === 'high' || t.priority === 'urgent')
        );
        break;
      case 'completed':
        tasks = tasks.filter((t) => t.isCompleted && !t.isArchived);
        break;
      case 'archived':
        tasks = tasks.filter((t) => t.isArchived);
        break;
      case 'project':
        if (selectedProject) {
          tasks = tasks.filter((t) => t.category === selectedProject && !t.isArchived);
        }
        break;
      case 'tags':
        break;
      case 'calendar':
      case 'dashboard':
      case 'settings':
      default:
        tasks = tasks.filter((t) => !t.isArchived);
        if (currentView === 'dashboard') {
          tasks = tasks.filter((t) => !t.isCompleted || isTaskDueToday(t));
        }
    }

    if (searchQuery) {
      tasks = searchTasks(tasks, searchQuery);
    }

    tasks = filterTasks(tasks, filters);
    return sortTasks(tasks, sortBy);
  }, [state.tasks, currentView, selectedProject, searchQuery, sortBy, filters]);
}

export function useTaskStats() {
  const { state } = useApp();

  return useMemo(() => {
    const active = state.tasks.filter((t) => !t.isArchived);
    const completed = active.filter((t) => t.isCompleted);
    const pending = active.filter((t) => !t.isCompleted);
    const overdue = pending.filter((t) => isTaskOverdue(t));
    const priority = pending.filter((t) => t.priority === 'high' || t.priority === 'urgent');
    const today = pending.filter((t) => isTaskDueToday(t));
    const total = active.length;
    const percent = total === 0 ? 0 : Math.round((completed.length / total) * 100);

    return {
      total,
      completed: completed.length,
      pending: pending.length,
      overdue: overdue.length,
      priority: priority.length,
      today: today.length,
      percent,
    };
  }, [state.tasks]);
}
