import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const shortcuts = [
  { keys: 'N', desc: 'New task' },
  { keys: '/', desc: 'Focus search' },
  { keys: 'T', desc: 'Today view' },
  { keys: 'U', desc: 'Upcoming view' },
  { keys: 'C', desc: 'Completed view' },
  { keys: 'Esc', desc: 'Close modal' },
  { keys: '?', desc: 'Show shortcuts' },
];

export function KeyboardShortcutsModal() {
  const { modals, closeShortcuts } = useApp();

  return (
    <AnimatePresence>
      {modals.shortcuts && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={closeShortcuts} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
              role="dialog"
              aria-label="Keyboard shortcuts"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                <button type="button" onClick={closeShortcuts} aria-label="Close"><X className="h-5 w-5" /></button>
              </div>
              <ul className="space-y-3">
                {shortcuts.map((s) => (
                  <li key={s.keys} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{s.desc}</span>
                    <kbd className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs dark:bg-slate-800">{s.keys}</kbd>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
