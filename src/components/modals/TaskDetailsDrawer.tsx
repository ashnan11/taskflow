import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDueLabel, getSubtaskProgress } from '../../utils/taskHelpers';
import { PriorityBadge } from '../ui/PriorityBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { TagBadge } from '../ui/TagBadge';
import { ProgressBar } from '../ui/ProgressBar';

export function TaskDetailsDrawer() {
  const { modals, closeDetails, updateTask, openEditTask } = useApp();
  const task = modals.detailsTask;
  if (!task) return null;

  const subProgress = getSubtaskProgress(task);

  const toggleSubtask = (subId: string) => {
    const subtasks = task.subtasks.map((s) =>
      s.id === subId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    updateTask({ ...task, subtasks });
  };

  return (
    <AnimatePresence>
      {task && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40" onClick={closeDetails} />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            role="dialog"
            aria-label="Task details"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
              <h2 className="text-lg font-semibold">{task.title}</h2>
              <button type="button" onClick={closeDetails} aria-label="Close" className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2">
                <PriorityBadge priority={task.priority} />
                <CategoryBadge category={task.category} />
                {task.tags.map((t) => <TagBadge key={t} tag={t} />)}
              </div>
              {task.description && <p className="text-sm text-slate-600 dark:text-slate-400">{task.description}</p>}
              {task.dueDate && (
                <p className="text-sm">
                  <span className="font-medium">Due:</span> {formatDueLabel(task)} {task.dueTime && `at ${task.dueTime}`}
                </p>
              )}
              {task.notes && (
                <div>
                  <h3 className="mb-1 text-sm font-medium">Notes</h3>
                  <p className="text-sm text-slate-500">{task.notes}</p>
                </div>
              )}
              {subProgress.total > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium">Subtasks</h3>
                  <ProgressBar value={subProgress.percent} showLabel />
                  <ul className="mt-3 space-y-2">
                    {task.subtasks.map((s) => (
                      <li key={s.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={s.isCompleted} onChange={() => toggleSubtask(s.id)} />
                        <span className={s.isCompleted ? 'line-through text-slate-400' : ''}>{s.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => { openEditTask(task); closeDetails(); }} className="flex-1 rounded-xl bg-brand-600 py-2 text-sm font-medium text-white">
                  Edit
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
