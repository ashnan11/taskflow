import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, ListTodo, Star } from 'lucide-react';
import { useTaskStats } from '../../hooks/useTaskList';
import { ProgressBar } from '../ui/ProgressBar';

const cards = [
  { key: 'total', label: 'Total Tasks', icon: ListTodo, color: 'from-brand-500 to-brand-600' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
  { key: 'pending', label: 'Pending', icon: Clock, color: 'from-amber-500 to-orange-600' },
  { key: 'overdue', label: 'Overdue', icon: AlertCircle, color: 'from-rose-500 to-pink-600' },
  { key: 'priority', label: 'Priority', icon: Star, color: 'from-violet-500 to-purple-600' },
] as const;

export function DashboardCards() {
  const stats = useTaskStats();

  const values: Record<string, number> = {
    total: stats.total,
    completed: stats.completed,
    pending: stats.pending,
    overdue: stats.overdue,
    priority: stats.priority,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900"
          >
            <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${card.color} p-2.5`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{values[card.key]}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">Daily Progress</h3>
          <span className="text-sm font-medium text-brand-600">{stats.percent}%</span>
        </div>
        <ProgressBar value={stats.percent} />
        <p className="mt-2 text-xs text-slate-500">
          {stats.completed} of {stats.total} tasks completed
        </p>
      </div>
    </div>
  );
}
