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
import { useEffect } from 'react';
import { MobileBottomNav } from './MobileBottomNav';
import { OfflineBanner } from './OfflineBanner';
import { ReminderAlert } from '../reminders/ReminderAlert';
import { OnboardingFlow } from '../onboarding/OnboardingFlow';
import { PwaUpdatePrompt } from '../pwa/PwaUpdatePrompt';

export function AppLayout() {
  const {
    modals,
    closeAddTask,
    closeEditTask,
    closeDeleteConfirm,
    deleteTasks,
    state,
    openDetails,
  } = useApp();

  useKeyboardShortcuts();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('task');
    if (taskId) {
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) openDetails(task);
    }
  }, [state.tasks, openDetails]);

  return (
    <div className="flex min-h-screen bg-slate-50 pb-mobile-content dark:bg-slate-950 lg:pb-0">
      <Sidebar />
      <Sidebar mobile />
      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <Header />
        <MainContent />
        <Footer />
      </div>

      <TaskFormModal open={modals.addTask} onClose={closeAddTask} />
      <TaskFormModal open={!!modals.editTask} task={modals.editTask} onClose={closeEditTask} />
      <TaskDetailsDrawer />
      <KeyboardShortcutsModal />
      <MobileBottomNav />
      <PomodoroTimer />
      <Toast />
      <ReminderAlert />
      <OnboardingFlow />
      <PwaUpdatePrompt />

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

    </div>
  );
}
