import { AnimatePresence, motion } from 'framer-motion';
import { Undo2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Toast() {
  const { toast, undoAction, performUndo } = useApp();

  return (
    <AnimatePresence>
      {(toast || undoAction) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          role="status"
        >
          <span className="text-sm">{toast?.message ?? undoAction?.message}</span>
          {undoAction && (
            <button
              type="button"
              onClick={performUndo}
              className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
            >
              <Undo2 className="h-4 w-4" /> Undo
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
