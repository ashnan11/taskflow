import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Priority, RecurrenceType, Subtask, Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { createSubtask, validateTaskTitle } from '../../utils/taskHelpers';

interface TaskFormModalProps {
  open: boolean;
  task?: Task | null;
  onClose: () => void;
}

export function TaskFormModal({ open, task, onClose }: TaskFormModalProps) {
  const { addTask, updateTask, state } = useApp();
  const isEdit = !!task;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Personal');
  const [tagsInput, setTagsInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [customRecurrenceDays, setCustomRecurrenceDays] = useState(7);
  const [reminder, setReminder] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setCategory(task.category);
      setTagsInput(task.tags.join(', '));
      setDueDate(task.dueDate ?? '');
      setDueTime(task.dueTime ?? '');
      setNotes(task.notes);
      setIsImportant(task.isImportant);
      setIsRecurring(task.isRecurring);
      setRecurrenceType(task.recurrenceType);
      setCustomRecurrenceDays(task.customRecurrenceDays);
      setReminder(task.reminder ?? '');
      setEstimatedMinutes(task.estimatedMinutes?.toString() ?? '');
      setSubtasks(task.subtasks);
    } else {
      setTitle('');
      setDescription('');
      setPriority(state.preferences.defaultPriority);
      setCategory(state.categories[0] ?? 'Personal');
      setTagsInput('');
      setDueDate('');
      setDueTime('');
      setNotes('');
      setIsImportant(false);
      setIsRecurring(false);
      setRecurrenceType('none');
      setCustomRecurrenceDays(7);
      setReminder('');
      setEstimatedMinutes('');
      setSubtasks([]);
    }
    setError(null);
  }, [open, task, state.preferences.defaultPriority, state.categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const titleError = validateTaskTitle(title);
    if (titleError) {
      setError(titleError);
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      tags,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      notes: notes.trim(),
      isImportant,
      isRecurring,
      recurrenceType: isRecurring ? recurrenceType : ('none' as RecurrenceType),
      customRecurrenceDays,
      reminder: reminder || null,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
      subtasks,
    };

    if (isEdit && task) {
      updateTask({ ...task, ...payload });
    } else {
      addTask(payload);
    }
    onClose();
  };

  const addSubtaskItem = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, createSubtask(newSubtask)]);
    setNewSubtask('');
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
          />
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-form-title"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                <h2 id="task-form-title" className="text-lg font-semibold">
                  {isEdit ? 'Edit Task' : 'New Task'}
                </h2>
                <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form id="task-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
                {error && (
                  <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" role="alert">
                    {error}
                  </p>
                )}

                <Field label="Title *">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input"
                    placeholder="What needs to be done?"
                    autoFocus
                    required
                  />
                </Field>

                <Field label="Description">
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[80px]" rows={2} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Priority">
                    <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="input">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </Field>
                  <Field label="Category">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                      {state.categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Due date">
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input" />
                  </Field>
                  <Field label="Due time">
                    <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="input" />
                  </Field>
                </div>

                <Field label="Tags (comma separated)">
                  <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="input" placeholder="focus, meeting" />
                </Field>

                <Field label="Estimated minutes">
                  <input type="number" min={1} value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} className="input" />
                </Field>

                <Field label="Notes">
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-[60px]" rows={2} />
                </Field>

                <div className="mb-4 flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
                    Important
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => {
                        setIsRecurring(e.target.checked);
                        if (e.target.checked) setRecurrenceType('daily');
                      }}
                    />
                    Recurring
                  </label>
                </div>

                {isRecurring && (
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <Field label="Repeat">
                      <select value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)} className="input">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </Field>
                    {recurrenceType === 'custom' && (
                      <Field label="Every N days">
                        <input type="number" min={1} value={customRecurrenceDays} onChange={(e) => setCustomRecurrenceDays(+e.target.value)} className="input" />
                      </Field>
                    )}
                  </div>
                )}

                <Field label="Reminder">
                  <input type="datetime-local" value={reminder} onChange={(e) => setReminder(e.target.value)} className="input" />
                </Field>

                <Field label="Subtasks">
                  <div className="flex gap-2">
                    <input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} className="input flex-1" placeholder="Add subtask" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtaskItem())} />
                    <button type="button" onClick={addSubtaskItem} className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {subtasks.map((s) => (
                      <li key={s.id} className="flex items-center gap-2 text-sm">
                        <span className="flex-1">{s.title}</span>
                        <button type="button" onClick={() => setSubtasks(subtasks.filter((x) => x.id !== s.id))} className="text-rose-500 text-xs">Remove</button>
                      </li>
                    ))}
                  </ul>
                </Field>
              </form>

              <div className="flex gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
                <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium dark:border-slate-700">
                  Cancel
                </button>
                <button type="submit" form="task-form" className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
                  {isEdit ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  );
}
