import { useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { extendedStorage } from '../../utils/extendedStorage';
import type { TaskTemplate } from '../../types/settings';
import type { Priority } from '../../types';
import { generateId } from '../../utils/taskHelpers';
import { useApp } from '../../context/AppContext';

const BUILT_IN: Omit<TaskTemplate, 'id'>[] = [
  {
    name: 'Daily standup',
    title: 'Team standup meeting',
    description: 'Prepare updates and blockers',
    priority: 'medium',
    category: 'Work',
    tags: ['meeting'],
    estimatedMinutes: 15,
    subtaskTitles: ['Review yesterday', 'Note blockers'],
  },
  {
    name: 'Weekly review',
    title: 'Weekly productivity review',
    description: 'Review goals and plan next week',
    priority: 'high',
    category: 'Personal',
    tags: ['review'],
    estimatedMinutes: 30,
    subtaskTitles: ['Review completed tasks', 'Set priorities'],
  },
];

export function TaskTemplatesPanel() {
  const { addTask, showToast } = useApp();
  const [templates, setTemplates] = useState<TaskTemplate[]>(() => {
    const saved = extendedStorage.getTemplates();
    if (saved.length) return saved;
    return BUILT_IN.map((t) => ({ ...t, id: generateId() }));
  });

  const useTemplate = (template: TaskTemplate) => {
    addTask({
      title: template.title,
      description: template.description,
      priority: template.priority,
      category: template.category,
      tags: template.tags,
      estimatedMinutes: template.estimatedMinutes,
      subtasks: template.subtaskTitles.map((title) => ({
        id: generateId(),
        title,
        isCompleted: false,
      })),
    });
    showToast(`Created from "${template.name}"`);
  };

  const removeTemplate = (id: string) => {
    const next = templates.filter((t) => t.id !== id);
    setTemplates(next);
    extendedStorage.setTemplates(next);
  };

  const saveCurrentAsTemplate = () => {
    const name = prompt('Template name');
    if (!name?.trim()) return;
    const template: TaskTemplate = {
      id: generateId(),
      name: name.trim(),
      title: name.trim(),
      description: '',
      priority: 'medium' as Priority,
      category: 'Personal',
      tags: [],
      estimatedMinutes: null,
      subtaskTitles: [],
    };
    const next = [...templates, template];
    setTemplates(next);
    extendedStorage.setTemplates(next);
    showToast('Template saved');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Task templates</h3>
        <button
          type="button"
          onClick={saveCurrentAsTemplate}
          className="text-xs text-brand-600 hover:underline"
        >
          Save new
        </button>
      </div>
      <ul className="space-y-2">
        {templates.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <span className="text-sm">{t.name}</span>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => useTemplate(t)}
                className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30"
                aria-label={`Use template ${t.name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeTemplate(t.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Delete template ${t.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
