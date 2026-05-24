import { useMemo } from 'react';
import { Download, TrendingUp, Flame, Target, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { computeAnalytics, exportAnalyticsCsv } from '../../services/analyticsService';

export function AdvancedAnalytics() {
  const { state } = useApp();
  const analytics = useMemo(() => computeAnalytics(state), [state]);

  const maxWeekly = Math.max(...analytics.weeklyTrend.map((d) => d.count), 1);
  const maxHeat = Math.max(...analytics.heatmap.map((h) => h.count), 1);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Productivity insights from your task history
          </p>
        </div>
        <button
          type="button"
          onClick={() => exportAnalyticsCsv(analytics)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Target} label="Productivity score" value={`${analytics.productivityScore}%`} />
        <StatCard icon={Flame} label="Daily streak" value={String(analytics.dailyStreak)} />
        <StatCard icon={TrendingUp} label="Completion rate" value={`${analytics.completionRate}%`} />
        <StatCard icon={Clock} label="Focus hours" value={String(analytics.focusHours)} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold">Weekly trends</h3>
        <div className="flex h-40 items-end gap-2" role="img" aria-label="Weekly completion chart">
          {analytics.weeklyTrend.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.count / maxWeekly) * 100}%` }}
                className="w-full min-h-[4px] rounded-t-lg bg-brand-500"
                title={`${d.count} tasks`}
              />
              <span className="text-xs text-slate-500">{d.day}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Most productive day: <strong>{analytics.mostProductiveDay}</strong>
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold">Completion heatmap (90 days)</h3>
        <div className="flex flex-wrap gap-1" role="img" aria-label="Completion heatmap">
          {analytics.heatmap.slice(-90).map((h) => (
            <div
              key={h.date}
              title={`${h.date}: ${h.count} completed`}
              className="h-3 w-3 rounded-sm"
              style={{
                backgroundColor:
                  h.count === 0
                    ? 'rgb(226 232 240)'
                    : `rgba(99, 102, 241, ${0.2 + (h.count / maxHeat) * 0.8})`,
              }}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatsTable title="By category" rows={analytics.categoryStats.map((c) => ({
          label: c.name,
          total: c.total,
          completed: c.completed,
        }))} />
        <StatsTable title="By priority" rows={analytics.priorityStats.map((p) => ({
          label: p.priority,
          total: p.total,
          completed: p.completed,
        }))} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <Icon className="mb-2 h-5 w-5 text-brand-500" aria-hidden="true" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function StatsTable({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; total: number; completed: number }[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 font-semibold">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500">
            <th className="pb-2">Name</th>
            <th className="pb-2">Done</th>
            <th className="pb-2">Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-slate-100 dark:border-slate-800">
              <td className="py-2 capitalize">{r.label}</td>
              <td className="py-2">
                {r.completed}/{r.total}
              </td>
              <td className="py-2">
                {r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
