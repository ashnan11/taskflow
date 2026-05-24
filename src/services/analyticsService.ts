import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  getDay,
} from 'date-fns';
import type { Task } from '../types';
import type { AppState } from '../types';

export interface AnalyticsSnapshot {
  productivityScore: number;
  dailyStreak: number;
  weeklyTrend: { day: string; count: number }[];
  completionRate: number;
  focusHours: number;
  mostProductiveDay: string;
  categoryStats: { name: string; total: number; completed: number }[];
  priorityStats: { priority: string; total: number; completed: number }[];
  heatmap: { date: string; count: number }[];
  totalTasks: number;
  completedTasks: number;
  overdueCount: number;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function computeAnalytics(state: AppState): AnalyticsSnapshot {
  const tasks = state.tasks.filter((t) => !t.isArchived);
  const completed = tasks.filter((t) => t.isCompleted);
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyTrend = days.map((day, i) => {
    const count = completed.filter(
      (t) => t.completedAt && isSameDay(parseISO(t.completedAt), day)
    ).length;
    return { day: DAY_NAMES[i], count };
  });

  const heatmapDays = eachDayOfInterval({
    start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
    end: now,
  });
  const heatmap = heatmapDays.map((day) => ({
    date: format(day, 'yyyy-MM-dd'),
    count: completed.filter(
      (t) => t.completedAt && isSameDay(parseISO(t.completedAt), day)
    ).length,
  }));

  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  completed.forEach((t) => {
    if (t.completedAt) {
      const d = getDay(parseISO(t.completedAt));
      const idx = d === 0 ? 6 : d - 1;
      dayCounts[idx]++;
    }
  });
  const maxIdx = dayCounts.indexOf(Math.max(...dayCounts));
  const mostProductiveDay = DAY_NAMES[maxIdx] ?? '—';

  const categoryMap = new Map<string, { total: number; completed: number }>();
  tasks.forEach((t) => {
    const cur = categoryMap.get(t.category) ?? { total: 0, completed: 0 };
    cur.total++;
    if (t.isCompleted) cur.completed++;
    categoryMap.set(t.category, cur);
  });

  const priorityMap = new Map<string, { total: number; completed: number }>();
  tasks.forEach((t) => {
    const cur = priorityMap.get(t.priority) ?? { total: 0, completed: 0 };
    cur.total++;
    if (t.isCompleted) cur.completed++;
    priorityMap.set(t.priority, cur);
  });

  let focusMinutes = 0;
  completed.forEach((t) => {
    if (t.actualMinutes) focusMinutes += t.actualMinutes;
    else if (t.estimatedMinutes) focusMinutes += t.estimatedMinutes;
  });
  const focusHours = Math.round((focusMinutes / 60) * 10) / 10;

  const overdueCount = tasks.filter(
    (t) => !t.isCompleted && t.dueDate && parseISO(t.dueDate) < now
  ).length;

  const streakBonus = Math.min(state.completionStreak * 5, 25);
  const rateBonus = completionRate * 0.5;
  const weeklyBonus = Math.min(
    weeklyTrend.reduce((s, d) => s + d.count, 0) * 2,
    20
  );
  const productivityScore = Math.min(100, Math.round(streakBonus + rateBonus + weeklyBonus));

  return {
    productivityScore,
    dailyStreak: state.completionStreak,
    weeklyTrend,
    completionRate,
    focusHours,
    mostProductiveDay,
    categoryStats: [...categoryMap.entries()].map(([name, v]) => ({ name, ...v })),
    priorityStats: [...priorityMap.entries()].map(([priority, v]) => ({ priority, ...v })),
    heatmap,
    totalTasks: total,
    completedTasks: completed.length,
    overdueCount,
  };
}

export function exportAnalyticsCsv(snapshot: AnalyticsSnapshot): void {
  const rows = [
    ['Metric', 'Value'],
    ['Productivity Score', String(snapshot.productivityScore)],
    ['Daily Streak', String(snapshot.dailyStreak)],
    ['Completion Rate %', String(snapshot.completionRate)],
    ['Focus Hours', String(snapshot.focusHours)],
    ['Most Productive Day', snapshot.mostProductiveDay],
    ['Total Tasks', String(snapshot.totalTasks)],
    ['Completed Tasks', String(snapshot.completedTasks)],
    ['Overdue', String(snapshot.overdueCount)],
    [],
    ['Day', 'Completions'],
    ...snapshot.weeklyTrend.map((w) => [w.day, String(w.count)]),
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getTasksForHeatmapDay(tasks: Task[], dateStr: string): Task[] {
  return tasks.filter(
    (t) => t.completedAt && format(parseISO(t.completedAt), 'yyyy-MM-dd') === dateStr
  );
}
