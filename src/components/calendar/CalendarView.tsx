import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Task } from '../../types';
import { useApp } from '../../context/AppContext';
export function CalendarView() {
  const { state, openDetails } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    state.tasks
      .filter((t) => !t.isArchived && t.dueDate)
      .forEach((t) => {
        const key = t.dueDate!;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(t);
      });
    return map;
  }, [state.tasks]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Previous month">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => setCurrentMonth(new Date())} className="rounded-lg px-3 py-1 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
            Today
          </button>
          <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Next month">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDate.get(key) ?? [];
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={key}
              className={`min-h-[80px] rounded-lg border p-1 sm:min-h-[100px] sm:p-2 ${
                isSameMonth(day, currentMonth)
                  ? 'border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50'
                  : 'border-transparent opacity-40'
              } ${isToday ? 'ring-2 ring-brand-500' : ''}`}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-brand-600' : ''}`}>{format(day, 'd')}</span>
              <div className="mt-1 space-y-0.5">
                {dayTasks.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => openDetails(t)}
                    className="block w-full truncate rounded px-1 py-0.5 text-left text-[10px] hover:bg-white dark:hover:bg-slate-800"
                  >
                    {t.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{dayTasks.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
