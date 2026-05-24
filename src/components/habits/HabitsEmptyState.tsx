import { motion } from 'framer-motion';
import { Flame, Plus } from 'lucide-react';

interface HabitsEmptyStateProps {
  archived?: boolean;
  onAdd?: () => void;
}

export function HabitsEmptyState({ archived, onAdd }: HabitsEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/30"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/40">
        <Flame className="h-7 w-7 text-brand-600 dark:text-brand-400" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold">
        {archived ? 'No archived habits' : 'No habits yet'}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
        {archived
          ? 'Archived habits will appear here. Archive habits you want to pause without deleting.'
          : 'Start building consistency. Add a habit and mark it done each day to grow your streak.'}
      </p>
      {!archived && onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Add your first habit
        </button>
      )}
    </motion.div>
  );
}
