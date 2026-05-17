import { Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useApp();

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        id="global-search"
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search tasks, tags, categories... (/)"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-brand-400"
        aria-label="Search tasks"
      />
    </div>
  );
}
