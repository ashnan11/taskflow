import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyChart() {
  const { state } = useApp();
  const data = state.weeklyCompletions;
  const max = Math.max(...data, 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 font-semibold">Weekly Productivity</h3>
      <div className="flex h-32 items-end justify-between gap-2">
        {data.map((value, i) => (
          <div key={days[i]} className="flex flex-1 flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(value / max) * 100}%` }}
              className="w-full min-h-[4px] rounded-t-lg bg-gradient-to-t from-brand-500 to-violet-500"
              style={{ maxHeight: '100%' }}
            />
            <span className="text-xs text-slate-500">{days[i]}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Streak: <span className="font-semibold text-brand-600">{state.completionStreak} days</span>
      </p>
    </div>
  );
}
