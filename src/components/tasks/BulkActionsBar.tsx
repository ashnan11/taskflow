import { Archive, Check, Trash2 } from 'lucide-react';
import type { Priority } from '../../types';
import { useApp } from '../../context/AppContext';

export function BulkActionsBar({ taskIds }: { taskIds: string[] }) {
  const {
    selectedTaskIds,
    clearSelection,
    selectAll,
    bulkComplete,
    bulkSetPriority,
    archiveTasks,
    openDeleteConfirm,
  } = useApp();

  if (selectedTaskIds.size === 0) return null;

  return (
    <div className="sticky top-20 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-800 dark:bg-brand-900/30">
      <span className="text-sm font-medium text-brand-800 dark:text-brand-200">
        {selectedTaskIds.size} selected
      </span>
      <button
        type="button"
        onClick={() => selectAll(taskIds)}
        className="text-xs text-brand-600 hover:underline"
      >
        Select all
      </button>
      <button type="button" onClick={clearSelection} className="text-xs text-slate-500 hover:underline">
        Clear
      </button>
      <div className="ml-auto flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => bulkComplete([...selectedTaskIds])}
          className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium shadow-sm dark:bg-slate-800"
        >
          <Check className="h-3.5 w-3.5" /> Complete
        </button>
        <select
          className="rounded-lg border-0 bg-white px-2 py-1.5 text-xs shadow-sm dark:bg-slate-800"
          onChange={(e) => {
            if (e.target.value) bulkSetPriority([...selectedTaskIds], e.target.value as Priority);
            e.target.value = '';
          }}
          defaultValue=""
          aria-label="Change priority"
        >
          <option value="" disabled>
            Priority
          </option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          type="button"
          onClick={() => archiveTasks([...selectedTaskIds])}
          className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium shadow-sm dark:bg-slate-800"
        >
          <Archive className="h-3.5 w-3.5" /> Archive
        </button>
        <button
          type="button"
          onClick={() => openDeleteConfirm([...selectedTaskIds], `${selectedTaskIds.size} tasks`)}
          className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}
