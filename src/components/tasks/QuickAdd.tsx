import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { validateTaskTitle } from '../../utils/taskHelpers';

export function QuickAdd() {
  const { addTask, state } = useApp();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateTaskTitle(title);
    if (err) {
      setError(err);
      return;
    }
    addTask({
      title: title.trim(),
      category: state.categories[0] ?? 'Personal',
      priority: state.preferences.defaultPriority,
    });
    setTitle('');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Plus className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setError(null);
        }}
        placeholder="Quick add a task..."
        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-24 text-sm shadow-card outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-900"
        aria-label="Quick add task"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Add
      </button>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </form>
  );
}
