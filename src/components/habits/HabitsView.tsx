import { useRef, useState } from 'react';
import { Archive, Plus } from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';
import { HabitCard } from './HabitCard';
import { HabitFormModal } from './HabitFormModal';
import { HabitsEmptyState } from './HabitsEmptyState';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import type { Habit } from '../../types/settings';

type ConfirmAction =
  | { type: 'delete'; habit: Habit }
  | { type: 'reset'; habit: Habit };

export function HabitsView() {
  const {
    visibleHabits,
    activeHabits,
    archivedHabits,
    showArchived,
    setShowArchived,
    addHabit,
    editHabit,
    removeHabit,
    toggleArchive,
    toggleCompleteToday,
    resetStreak,
  } = useHabits();

  const [quickTitle, setQuickTitle] = useState('');
  const [quickError, setQuickError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const quickInputRef = useRef<HTMLInputElement>(null);

  const openAddForm = () => {
    setEditingHabit(null);
    setFormOpen(true);
  };

  const openEditForm = (habit: Habit) => {
    setEditingHabit(habit);
    setFormOpen(true);
  };

  const handleQuickAdd = () => {
    const err = addHabit(quickTitle);
    if (err) {
      setQuickError(err);
      return;
    }
    setQuickTitle('');
    setQuickError(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Habit tracking</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Build daily habits, track streaks, and stay consistent.
          </p>
        </div>
        <div className="flex gap-2">
          {archivedHabits.length > 0 && (
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition ${
                showArchived
                  ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              <Archive className="h-4 w-4" />
              {showArchived ? 'Active' : `Archived (${archivedHabits.length})`}
            </button>
          )}
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> New habit
          </button>
        </div>
      </div>

      {!showArchived && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <label htmlFor="quick-habit" className="mb-2 block text-xs font-medium text-slate-500">
            Quick add
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              ref={quickInputRef}
              id="quick-habit"
              type="text"
              value={quickTitle}
              onChange={(e) => {
                setQuickTitle(e.target.value);
                setQuickError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleQuickAdd();
                }
              }}
              placeholder="New habit name…"
              className="input flex-1"
              maxLength={80}
              aria-invalid={!!quickError}
              aria-describedby={quickError ? 'quick-habit-error' : undefined}
            />
            <button
              type="button"
              onClick={handleQuickAdd}
              className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {quickError && (
            <p id="quick-habit-error" className="mt-2 text-sm text-rose-600" role="alert">
              {quickError}
            </p>
          )}
        </div>
      )}

      {visibleHabits.length === 0 ? (
        <HabitsEmptyState archived={showArchived} onAdd={showArchived ? undefined : openAddForm} />
      ) : (
        <ul className="space-y-3" aria-label={showArchived ? 'Archived habits' : 'Active habits'}>
          {visibleHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleComplete={() => toggleCompleteToday(habit.id)}
              onEdit={() => openEditForm(habit)}
              onDelete={() => setConfirm({ type: 'delete', habit })}
              onResetStreak={() => setConfirm({ type: 'reset', habit })}
              onArchive={() => toggleArchive(habit.id, true)}
              onRestore={() => toggleArchive(habit.id, false)}
            />
          ))}
        </ul>
      )}

      {!showArchived && activeHabits.length > 0 && (
        <p className="text-center text-xs text-slate-500">
          {activeHabits.length} active habit{activeHabits.length !== 1 ? 's' : ''}
        </p>
      )}

      <HabitFormModal
        open={formOpen}
        habit={editingHabit}
        onClose={() => {
          setFormOpen(false);
          setEditingHabit(null);
        }}
        onSave={(title) => {
          if (editingHabit) return editHabit(editingHabit.id, title);
          return addHabit(title);
        }}
      />

      <ConfirmationDialog
        open={confirm?.type === 'delete'}
        title="Delete habit?"
        message={`Permanently delete "${confirm?.habit.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (confirm?.type === 'delete') removeHabit(confirm.habit.id);
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />

      <ConfirmationDialog
        open={confirm?.type === 'reset'}
        title="Reset streak?"
        message={`Clear completion history and reset the current streak for "${confirm?.habit.title}"? Your best streak record will be preserved.`}
        confirmLabel="Reset streak"
        variant="danger"
        onConfirm={() => {
          if (confirm?.type === 'reset') resetStreak(confirm.habit.id);
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
