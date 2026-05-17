import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { MainContent } from '../../views/MainContent';
import { TaskFormModal } from '../modals/TaskFormModal';
import { TaskDetailsDrawer } from '../modals/TaskDetailsDrawer';
import { KeyboardShortcutsModal } from '../modals/KeyboardShortcutsModal';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { PomodoroTimer } from '../productivity/PomodoroTimer';
import { Toast } from '../ui/Toast';
import { useApp } from '../../context/AppContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { Plus } from 'lucide-react';

export function AppLayout() {
  const {
    modals,
    closeAddTask,
    closeEditTask,
    openAddTask,
    closeDeleteConfirm,
    deleteTasks,
  } = useApp();

  useKeyboardShortcuts();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <Sidebar mobile />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <MainContent />
        <Footer />
      </div>

      <TaskFormModal open={modals.addTask} onClose={closeAddTask} />
      <TaskFormModal open={!!modals.editTask} task={modals.editTask} onClose={closeEditTask} />
      <TaskDetailsDrawer />
      <KeyboardShortcutsModal />
      <PomodoroTimer />
      <Toast />

      <ConfirmationDialog
        open={!!modals.deleteConfirm}
        title="Delete task?"
        message={`Are you sure you want to delete "${modals.deleteConfirm?.title}"? This action can be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (modals.deleteConfirm) deleteTasks(modals.deleteConfirm.ids);
          closeDeleteConfirm();
        }}
        onCancel={closeDeleteConfirm}
      />

      <button
        type="button"
        onClick={openAddTask}
        className="fixed bottom-24 left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-brand-600 text-white shadow-2xl shadow-brand-500/40 transition hover:scale-105 hover:bg-brand-700 lg:hidden"
        aria-label="Add task"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
