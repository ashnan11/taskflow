import { format, parseISO } from 'date-fns';
import {
  Archive,
  Calendar,
  CheckCircle2,
  Inbox,
  Search,
  Star,
  Sun,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTaskList } from '../hooks/useTaskList';
import { getSmartSuggestions, groupTasksByDate } from '../utils/taskHelpers';
import { DashboardCards } from '../components/dashboard/DashboardCards';
import { WeeklyChart } from '../components/productivity/WeeklyChart';
import { TaskList } from '../components/tasks/TaskList';
import { EmptyState } from '../components/ui/EmptyState';
import { CalendarView } from '../components/calendar/CalendarView';
import { SettingsCenter } from '../components/settings/SettingsCenter';
import { AdvancedAnalytics } from '../components/analytics/AdvancedAnalytics';
import { HabitsView } from '../components/habits/HabitsView';
import { TaskTemplatesPanel } from '../components/tasks/TaskTemplates';
import { QuickAdd } from '../components/tasks/QuickAdd';
import { FocusMode } from '../components/productivity/FocusMode';

const viewTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  today: 'Today',
  upcoming: 'Upcoming',
  important: 'Important',
  completed: 'Completed',
  archived: 'Archived',
  calendar: 'Calendar',
  project: 'Project',
  tags: 'Tags',
  settings: 'Settings',
  analytics: 'Analytics',
  habits: 'Habits',
};

export function MainContent() {
  const { currentView, selectedProject, searchQuery, state, openAddTask } = useApp();
  const tasks = useTaskList();
  const suggestions = getSmartSuggestions(state.tasks.filter((t) => !t.isArchived && !t.isCompleted));

  if (currentView === 'settings') {
    return (
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" id="main-content">
        <SettingsCenter />
      </main>
    );
  }

  if (currentView === 'analytics') {
    return (
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" id="main-content">
        <AdvancedAnalytics />
      </main>
    );
  }

  if (currentView === 'habits') {
    return (
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" id="main-content">
        <HabitsView />
      </main>
    );
  }

  if (currentView === 'calendar') {
    return (
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <CalendarView />
      </main>
    );
  }

  const title =
    currentView === 'project' && selectedProject
      ? selectedProject
      : viewTitles[currentView] ?? 'Tasks';

  const emptyConfig = getEmptyConfig(currentView, searchQuery);

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <FocusMode />

      {currentView === 'dashboard' && (
        <>
          <DashboardCards />
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <QuickAdd />
              <section className="mt-6">
                <h3 className="mb-4 text-lg font-semibold">Active Tasks</h3>
                {tasks.length === 0 ? (
                  <EmptyState {...emptyConfig} onAction={openAddTask} />
                ) : (
                  <TaskList tasks={tasks.filter((t) => !t.isCompleted)} />
                )}
              </section>
            </div>
            <div className="space-y-6">
              <WeeklyChart />
              <TaskTemplatesPanel />
              {suggestions.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="mb-3 font-semibold">Smart Suggestions</h3>
                  <ul className="space-y-2">
                    {suggestions.map((t) => (
                      <li key={t.id} className="text-sm text-slate-600 dark:text-slate-400">
                        • {t.title}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </>
      )}

      {currentView !== 'dashboard' && (
        <>
          <h2 className="mb-6 text-2xl font-bold">{title}</h2>
          {currentView !== 'tags' && <QuickAdd />}
          {currentView === 'upcoming' ? (
            <UpcomingGrouped tasks={tasks} emptyConfig={emptyConfig} onAdd={openAddTask} />
          ) : currentView === 'tags' ? (
            <TagsView />
          ) : tasks.length === 0 ? (
            <EmptyState {...emptyConfig} onAction={openAddTask} />
          ) : (
            <div className="mt-6">
              <TaskList tasks={tasks} dragEnabled={!['completed', 'archived'].includes(currentView)} />
            </div>
          )}
        </>
      )}
    </main>
  );
}

function UpcomingGrouped({
  tasks,
  emptyConfig,
  onAdd,
}: {
  tasks: ReturnType<typeof useTaskList>;
  emptyConfig: ReturnType<typeof getEmptyConfig>;
  onAdd: () => void;
}) {
  if (tasks.length === 0) return <EmptyState {...emptyConfig} onAction={onAdd} />;
  const groups = groupTasksByDate(tasks);
  return (
    <div className="mt-6 space-y-8">
      {Object.entries(groups).map(([date, groupTasks]) => (
        <section key={date}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            {date === 'No date' ? 'No date' : format(parseISO(date), 'EEEE, MMM d')}
          </h3>
          <TaskList tasks={groupTasks} />
        </section>
      ))}
    </div>
  );
}

function TagsView() {
  const { state } = useApp();
  const tasks = useTaskList();

  return (
    <div className="mt-6 space-y-6">
      {state.allTags.map((tag) => {
        const tagged = tasks.filter((t) => t.tags.includes(tag));
        if (tagged.length === 0) return null;
        return (
          <section key={tag}>
            <h3 className="mb-3 font-semibold">#{tag}</h3>
            <TaskList tasks={tagged} />
          </section>
        );
      })}
      {state.allTags.every((tag) => tasks.filter((t) => t.tags.includes(tag)).length === 0) && (
        <EmptyState
          icon={Search}
          title="No tagged tasks"
          description="Add tags to your tasks to organize them here."
        />
      )}
    </div>
  );
}

function getEmptyConfig(view: string, search: string) {
  if (search) {
    return {
      icon: Search,
      title: 'No results found',
      description: 'Try adjusting your search or filters.',
      actionLabel: undefined as string | undefined,
    };
  }
  const configs: Record<string, { icon: typeof Inbox; title: string; description: string; actionLabel?: string }> = {
    today: {
      icon: Sun,
      title: 'No tasks for today',
      description: 'Enjoy your free time or add a new task.',
      actionLabel: 'Add task',
    },
    upcoming: {
      icon: Calendar,
      title: 'No upcoming tasks',
      description: 'Schedule tasks with due dates to see them here.',
      actionLabel: 'Add task',
    },
    important: {
      icon: Star,
      title: 'No important tasks',
      description: 'Mark tasks as important or set high priority.',
      actionLabel: 'Add task',
    },
    completed: {
      icon: CheckCircle2,
      title: 'No completed tasks yet',
      description: 'Complete tasks to see your progress here.',
    },
    archived: {
      icon: Archive,
      title: 'No archived tasks',
      description: 'Archive completed tasks to keep your lists clean.',
    },
    dashboard: {
      icon: Inbox,
      title: 'No tasks yet',
      description: 'Create your first task to get started.',
      actionLabel: 'Add your first task',
    },
  };
  return configs[view] ?? configs.dashboard;
}
