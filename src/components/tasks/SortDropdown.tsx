import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import type { SortOption } from '../../types';
import { useApp } from '../../context/AppContext';

const options: { value: SortOption; label: string }[] = [
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'category', label: 'Category' },
  { value: 'status', label: 'Status' },
];

export function SortDropdown() {
  const { sortBy, setSortBy } = useApp();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === sortBy)?.label ?? 'Sort';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-expanded={open}
      >
        <ArrowUpDown className="h-4 w-4" />
        {current}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  setSortBy(o.value);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left text-sm ${
                  sortBy === o.value
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
