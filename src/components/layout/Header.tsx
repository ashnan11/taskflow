import { format } from 'date-fns';
import { Menu, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getGreeting } from '../../utils/taskHelpers';
import { ThemeToggle } from '../ui/ThemeToggle';
import { SearchBar } from '../tasks/SearchBar';
import { FilterMenu } from '../tasks/FilterMenu';
import { SortDropdown } from '../tasks/SortDropdown';

export function Header() {
  const { setSidebarOpen, openAddTask, planMyDay, currentView } = useApp();
  const showSearch = !['settings', 'calendar'].includes(currentView);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                {getGreeting()}{' '}
                <span className="gradient-text">there</span>
              </h2>
              <p className="text-sm text-slate-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={planMyDay}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:flex dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Sparkles className="h-4 w-4 text-brand-500" />
              Plan My Day
            </button>
            <button
              type="button"
              onClick={openAddTask}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/25 transition hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar />
            <div className="flex gap-2">
              <FilterMenu />
              <SortDropdown />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
