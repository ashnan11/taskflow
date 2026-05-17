import { Filter } from 'lucide-react';
import { useState } from 'react';
import type { FilterState, Priority } from '../../types';
import { useApp } from '../../context/AppContext';

export function FilterMenu() {
  const { filters, setFilters, state } = useApp();
  const [open, setOpen] = useState(false);

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => v !== 'all' && k !== 'status'
  ).length + (filters.status !== 'all' ? 1 : 0);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
          activeCount > 0
            ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
            : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Filter className="h-4 w-4" />
        Filter
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
            {activeCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <FilterSelect
              label="Status"
              value={filters.status}
              options={[
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
                { value: 'overdue', label: 'Overdue' },
              ]}
              onChange={(v) => setFilters({ status: v as FilterState['status'] })}
            />
            <FilterSelect
              label="Priority"
              value={filters.priority}
              options={[
                { value: 'all', label: 'All' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              onChange={(v) => setFilters({ priority: v as Priority | 'all' })}
            />
            <FilterSelect
              label="Category"
              value={filters.category}
              options={[
                { value: 'all', label: 'All' },
                ...state.categories.map((c) => ({ value: c, label: c })),
              ]}
              onChange={(v) => setFilters({ category: v })}
            />
            <FilterSelect
              label="Due"
              value={filters.dueDate}
              options={[
                { value: 'all', label: 'All' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This week' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'none', label: 'No date' },
              ]}
              onChange={(v) => setFilters({ dueDate: v as FilterState['dueDate'] })}
            />
            <button
              type="button"
              onClick={() => {
                setFilters({
                  status: 'all',
                  priority: 'all',
                  category: 'all',
                  tag: 'all',
                  dueDate: 'all',
                });
                setOpen(false);
              }}
              className="mt-3 w-full text-center text-xs text-brand-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
