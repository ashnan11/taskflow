import { motion } from 'framer-motion';
import {
  Archive,
  ArchiveRestore,
  Calendar,
  Check,
  Flame,
  MoreVertical,
  Pencil,
  RotateCcw,
  Target,
  Trophy,
  Undo2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import type { Habit } from '../../types/settings';
import { getHabitStats } from '../../services/habitService';

interface HabitCardProps {
  habit: Habit;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onResetStreak: () => void;
  onArchive: () => void;
  onRestore: () => void;
}

export function HabitCard({
  habit,
  onToggleComplete,
  onEdit,
  onDelete,
  onResetStreak,
  onArchive,
  onRestore,
}: HabitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const stats = getHabitStats(habit);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const lastLabel = stats.lastCompletedDate
    ? format(parseISO(stats.lastCompletedDate), 'MMM d, yyyy')
    : 'Never';

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group rounded-2xl border bg-white p-4 shadow-card transition hover:border-brand-200 hover:shadow-md focus-within:ring-2 focus-within:ring-brand-500/20 dark:bg-slate-900 dark:hover:border-brand-800 ${
        habit.isArchived
          ? 'border-slate-200/60 opacity-80 dark:border-slate-800'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggleComplete}
          disabled={habit.isArchived}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition focus-visible:ring-2 focus-visible:ring-brand-500 ${
            stats.doneToday
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : 'bg-slate-100 text-slate-600 hover:bg-brand-100 hover:text-brand-700 dark:bg-slate-800 dark:hover:bg-brand-900/40'
          } ${habit.isArchived ? 'cursor-not-allowed opacity-50' : ''}`}
          aria-label={stats.doneToday ? 'Undo completion for today' : 'Mark done for today'}
        >
          {stats.doneToday ? <Check className="h-5 w-5" /> : <span className="h-2.5 w-2.5 rounded-full border-2 border-current" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">{habit.title}</h3>
              <span
                className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  stats.doneToday
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                }`}
              >
                {stats.doneToday ? 'Done today' : 'Pending today'}
              </span>
            </div>

            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="rounded-lg p-1.5 text-slate-500 opacity-100 transition hover:bg-slate-100 group-hover:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-500 sm:opacity-70 dark:hover:bg-slate-800"
                aria-label="Habit actions"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                  >
                    {!habit.isArchived && (
                      <>
                        <MenuItem icon={Pencil} label="Edit" onClick={() => { setMenuOpen(false); onEdit(); }} />
                        <MenuItem
                          icon={stats.doneToday ? Undo2 : Check}
                          label={stats.doneToday ? 'Undo today' : 'Mark done today'}
                          onClick={() => { setMenuOpen(false); onToggleComplete(); }}
                        />
                        <MenuItem icon={RotateCcw} label="Reset streak" onClick={() => { setMenuOpen(false); onResetStreak(); }} />
                        <MenuItem icon={Archive} label="Archive" onClick={() => { setMenuOpen(false); onArchive(); }} />
                      </>
                    )}
                    {habit.isArchived && (
                      <MenuItem icon={ArchiveRestore} label="Restore" onClick={() => { setMenuOpen(false); onRestore(); }} />
                    )}
                    <MenuItem icon={Target} label="Delete" danger onClick={() => { setMenuOpen(false); onDelete(); }} />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat icon={Flame} label="Current" value={`${stats.currentStreak}d`} accent />
            <Stat icon={Trophy} label="Best" value={`${stats.bestStreak}d`} />
            <Stat icon={Check} label="Total" value={String(stats.totalCompletions)} />
            <Stat icon={Calendar} label="Last done" value={lastLabel} small />
          </div>
        </div>
      </div>
    </motion.li>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
  small,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-2.5 py-2 dark:bg-slate-800/60">
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
        <Icon className={`h-3 w-3 ${accent ? 'text-amber-500' : ''}`} aria-hidden />
        {label}
      </div>
      <p className={`mt-0.5 font-semibold tabular-nums text-slate-800 dark:text-slate-200 ${small ? 'text-xs' : 'text-sm'}`}>
        {value}
      </p>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
        danger ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </button>
  );
}
