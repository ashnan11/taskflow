import {
  BarChart3,
  Calendar,
  LayoutDashboard,
  Plus,
  Settings,
  Sun,
} from 'lucide-react';
import type { AppView } from '../../types';
import { useApp } from '../../context/AppContext';

const items: { id: AppView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Stats', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function MobileBottomNav() {
  const { currentView, setCurrentView, setSelectedProject, openAddTask } = useApp();

  return (
    <>
      {/* FAB: fixed above nav, centered — separate layer from nav items */}
      <button
        type="button"
        onClick={openAddTask}
        className="bottom-mobile-fab fixed left-1/2 z-[35] flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-500/40 transition hover:scale-105 active:scale-95 lg:hidden"
        aria-label="Add task"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </button>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95 lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="bottom-nav-safe mx-auto grid h-[var(--mobile-nav-height)] max-w-lg grid-cols-5 items-center px-1">
          {items.map(({ id, label, icon: Icon }) => {
            const active = currentView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setCurrentView(id);
                  setSelectedProject(null);
                }}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-medium leading-tight transition sm:text-xs ${
                  active
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? 'scale-110' : ''}`} aria-hidden="true" />
                <span className="max-w-[4.5rem] truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
