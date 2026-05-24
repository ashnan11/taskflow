import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Habit } from '../../types/settings';
import { LoadingButton } from '../ui/LoadingButton';

interface HabitFormModalProps {
  open: boolean;
  habit?: Habit | null;
  onClose: () => void;
  onSave: (title: string) => string | null;
}

export function HabitFormModal({ open, habit, onClose, onSave }: HabitFormModalProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!habit;

  useEffect(() => {
    if (!open) return;
    setTitle(habit?.title ?? '');
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, habit]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const err = onSave(title);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="habit-form-title"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 id="habit-form-title" className="text-lg font-semibold">
                  {isEdit ? 'Edit habit' : 'New habit'}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="habit-title" className="mb-1 block text-xs text-slate-500">
                    Habit name
                  </label>
                  <input
                    ref={inputRef}
                    id="habit-title"
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g. Morning run"
                    className="input"
                    maxLength={80}
                    autoComplete="off"
                  />
                  {error && (
                    <p className="mt-2 text-sm text-rose-600" role="alert">
                      {error}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <LoadingButton type="submit" loading={saving}>
                    {isEdit ? 'Save changes' : 'Add habit'}
                  </LoadingButton>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
