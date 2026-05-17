import { addDays, format } from 'date-fns';
import type { Task } from '../types';
import { createEmptyTask, createSubtask, generateId } from './taskHelpers';

export function getDemoTasks(): Task[] {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const nextWeek = format(addDays(new Date(), 5), 'yyyy-MM-dd');
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');

  return [
    createEmptyTask({
      id: generateId(),
      title: 'Review quarterly goals',
      description: 'Prepare notes for the team sync and align on Q priorities.',
      priority: 'high',
      category: 'Work',
      tags: ['focus', 'meeting'],
      dueDate: today,
      dueTime: '10:00',
      isImportant: true,
      estimatedMinutes: 45,
      subtasks: [
        createSubtask('Gather metrics'),
        createSubtask('Draft talking points'),
        { ...createSubtask('Send agenda'), isCompleted: true },
      ],
      order: 1,
    }),
    createEmptyTask({
      id: generateId(),
      title: 'Complete TypeScript course module',
      description: 'Finish module 4 on generics and utility types.',
      priority: 'medium',
      category: 'Learning',
      tags: ['learning'],
      dueDate: tomorrow,
      estimatedMinutes: 90,
      order: 2,
    }),
    createEmptyTask({
      id: generateId(),
      title: 'Grocery shopping',
      priority: 'low',
      category: 'Personal',
      tags: ['errands'],
      dueDate: today,
      isRecurring: true,
      recurrenceType: 'weekly',
      order: 3,
    }),
    createEmptyTask({
      id: generateId(),
      title: 'Submit expense report',
      priority: 'urgent',
      category: 'Work',
      tags: ['urgent'],
      dueDate: yesterday,
      isImportant: true,
      order: 4,
    }),
    createEmptyTask({
      id: generateId(),
      title: 'Plan weekend trip',
      priority: 'medium',
      category: 'Personal',
      dueDate: nextWeek,
      order: 5,
    }),
    createEmptyTask({
      id: generateId(),
      title: 'Weekly team standup',
      priority: 'medium',
      category: 'Work',
      dueDate: today,
      dueTime: '09:00',
      isCompleted: true,
      status: 'completed',
      completedAt: new Date().toISOString(),
      order: 6,
    }),
  ];
}
