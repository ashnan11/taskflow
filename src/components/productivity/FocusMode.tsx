import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PriorityBadge } from '../ui/PriorityBadge';

export function FocusMode() {
  const { focusTaskId, setFocusTaskId, state, toggleComplete, updateTask } = useApp();
  const task = state.tasks.find((t) => t.id === focusTaskId);

  if (!task) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-6"
      >
        <button
          type="button"
          onClick={() => setFocusTaskId(null)}
          className="absolute right-6 top-6 rounded-full p-2 text-white/70 hover:bg-white/10"
          aria-label="Exit focus mode"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="max-w-lg text-center text-white">
          <PriorityBadge priority={task.priority} />
          <h2 className="mt-4 text-3xl font-bold">{task.title}</h2>
          {task.description && <p className="mt-4 text-slate-400">{task.description}</p>}
          <div className="mt-8 flex justify-center gap-4">
            <button
              type="button"
              onClick={() => toggleComplete(task.id)}
              className="rounded-xl bg-brand-500 px-6 py-3 font-medium"
            >
              {task.isCompleted ? 'Mark pending' : 'Complete'}
            </button>
            <button
              type="button"
              onClick={() => {
                const mins = (task.actualMinutes ?? 0) + 5;
                updateTask({ ...task, actualMinutes: mins });
              }}
              className="rounded-xl border border-white/20 px-6 py-3 font-medium"
            >
              +5 min tracked
            </button>
          </div>
          {task.actualMinutes != null && (
            <p className="mt-4 text-sm text-slate-500">{task.actualMinutes} minutes tracked</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
