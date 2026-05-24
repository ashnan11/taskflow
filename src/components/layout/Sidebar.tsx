import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Star,
  Sun,
  Tag,
  BarChart3,
  Repeat,
  X,
  Zap,
} from 'lucide-react';
import type { AppView } from '../../types';
import { useApp } from '../../context/AppContext';

const navItems: { id: AppView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'upcoming', label: 'Upcoming', icon: ChevronRight },
  { id: 'important', label: 'Important', icon: Star },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  { id: 'archived', label: 'Archived', icon: Archive },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
];

interface SidebarProps {
  mobile?: boolean;
}

export function Sidebar({ mobile }: SidebarProps) {
  const {
    currentView,
    setCurrentView,
    state,
    selectedProject,
    setSelectedProject,
    sidebarOpen,
    setSidebarOpen,
  } = useApp();

  const NavButton = ({ id, label, icon: Icon }: (typeof navItems)[0]) => (
    <button
      type="button"
      onClick={() => {
        setCurrentView(id);
        setSelectedProject(null);
        if (mobile) setSidebarOpen(false);
      }}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        currentView === id && !selectedProject
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-lg shadow-brand-500/30">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">TaskFlow</h1>
          <p className="text-xs text-slate-500">Productivity</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavButton key={item.id} {...item} />
        ))}

        <div className="pt-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Projects
          </p>
          {state.categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedProject(cat);
                setCurrentView('project');
                if (mobile) setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                selectedProject === cat && currentView === 'project'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <FolderKanban className="h-4 w-4 shrink-0" />
              {cat}
            </button>
          ))}
        </div>

        <div className="pt-2 space-y-1">
          <button
            type="button"
            onClick={() => {
              setCurrentView('analytics');
              if (mobile) setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              currentView === 'analytics'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentView('habits');
              if (mobile) setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              currentView === 'habits'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Repeat className="h-4 w-4" />
            Habits
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentView('tags');
              if (mobile) setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              currentView === 'tags'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Tag className="h-4 w-4" />
            Tags
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentView('settings');
              if (mobile) setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              currentView === 'settings'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </nav>
    </div>
  );

  if (mobile) {
    return (
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:hidden"
            >
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute right-3 top-4 rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
      {content}
    </aside>
  );
}
