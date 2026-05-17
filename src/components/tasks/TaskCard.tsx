import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  Clock,
  Copy,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  formatDueLabel,
  getSubtaskProgress,
  isTaskOverdue,
} from '../../utils/taskHelpers';
import { PriorityBadge } from '../ui/PriorityBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { TagBadge } from '../ui/TagBadge';
import { ProgressBar } from '../ui/ProgressBar';

interface TaskCardProps {
  task: Task;
  dragEnabled?: boolean;
}

export function TaskCard({ task, dragEnabled = true }: TaskCardProps) {
  const {
    toggleComplete,
    openEditTask,
    openDetails,
    openDeleteConfirm,
    duplicateTaskById,
    updateTask,
    archiveTasks,
    selectedTaskIds,
    toggleSelectTask,
    focusTaskId,
    setFocusTaskId,
  } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const overdue = isTaskOverdue(task);
  const subProgress = getSubtaskProgress(task);
  const isSelected = selectedTaskIds.has(task.id);
  const isFocused = focusTaskId === task.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !dragEnabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`group relative rounded-2xl border bg-white p-4 shadow-card transition hover:shadow-card-hover dark:bg-slate-900 ${
        overdue
          ? 'border-rose-200 dark:border-rose-900/50'
          : 'border-slate-200 dark:border-slate-800'
      } ${isFocused ? 'ring-2 ring-brand-500' : ''} ${task.isCompleted ? 'opacity-75' : ''}`}
    >
      <div className="flex gap-3">
        {dragEnabled && (
          <button
            type="button"
            className="mt-1 cursor-grab text-slate-300 opacity-0 transition group-hover:opacity-100 dark:text-slate-600"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={() => toggleComplete(task.id)}
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded-md border-slate-300 text-brand-600 focus:ring-brand-500"
          aria-label={`Mark "${task.title}" as ${task.isCompleted ? 'pending' : 'complete'}`}
        />

        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelectTask(task.id)}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 opacity-0 group-hover:opacity-100"
          aria-label="Select task"
        />

        <div className="min-w-0 flex-1" onClick={() => openDetails(task)}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3
              className={`cursor-pointer font-semibold text-slate-800 dark:text-slate-100 ${
                task.isCompleted ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
              {task.isImportant && (
                <Star className="ml-1 inline h-4 w-4 fill-amber-400 text-amber-400" aria-label="Important" />
              )}
            </h3>
            <PriorityBadge priority={task.priority} />
          </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 cursor-pointer text-sm text-slate-500 dark:text-slate-400">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CategoryBadge category={task.category} />
            {task.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  overdue ? 'font-medium text-rose-600' : 'text-slate-500'
                }`}
              >
                <Calendar className="h-3 w-3" />
                {formatDueLabel(task)}
                {task.dueTime && (
                  <>
                    <Clock className="ml-1 h-3 w-3" />
                    {task.dueTime}
                  </>
                )}
              </span>
            )}
            {task.estimatedMinutes && (
              <span className="text-xs text-slate-400">{task.estimatedMinutes}m est.</span>
            )}
          </div>

          {subProgress.total > 0 && (
            <div className="mt-3">
              <ProgressBar value={subProgress.percent} showLabel />
            </div>
          )}
        </div>

        <div className="relative flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => openEditTask(task)}
            className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-800"
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="More options"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <MenuItem icon={Copy} label="Duplicate" onClick={() => { duplicateTaskById(task.id); setMenuOpen(false); }} />
                <MenuItem
                  icon={Star}
                  label={task.isImportant ? 'Unmark important' : 'Mark important'}
                  onClick={() => {
                    updateTask({ ...task, isImportant: !task.isImportant });
                    setMenuOpen(false);
                  }}
                />
                <MenuItem icon={Trash2} label="Archive" onClick={() => { archiveTasks([task.id]); setMenuOpen(false); }} />
                <MenuItem
                  icon={Trash2}
                  label="Delete"
                  danger
                  onClick={() => {
                    openDeleteConfirm([task.id], task.title);
                    setMenuOpen(false);
                  }}
                />
                <MenuItem icon={Star} label="Focus mode" onClick={() => { setFocusTaskId(task.id); setMenuOpen(false); }} />
              </div>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${
        danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
