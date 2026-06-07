import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { subscribeToPushNotifications } from '../services/pushSubscriptionService';

const PROMPT_SEEN_KEY = 'taskflow-notification-onboarding-seen';

function getOrCreatePushUserId(authUserId?: string): string {
    if (authUserId) return authUserId;

    let guestId = localStorage.getItem('taskflow-guest-cloud-id');

    if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem('taskflow-guest-cloud-id', guestId);
    }

    return guestId;
}

export function useAutoEnablePushOnReminderTask() {
    const { user } = useAuth();
    const { showToast } = useApp();

    useEffect(() => {
        const handleReminderTaskSaved = async () => {
            if (!('Notification' in window)) {
                showToast('Notifications are not supported on this browser', 'error');
                return;
            }

            const pushUserId = getOrCreatePushUserId(user?.id);

            if (Notification.permission === 'granted') {
                await subscribeToPushNotifications(pushUserId);
                return;
            }

            if (Notification.permission === 'denied') {
                showToast(
                    'Notifications are blocked. Please allow notifications from browser settings.',
                    'error'
                );
                return;
            }

            const alreadySeen = localStorage.getItem(PROMPT_SEEN_KEY);

            if (alreadySeen) {
                showToast(
                    'Reminder saved. Enable notifications from Reminder settings to get alerts.',
                    'info'
                );
                return;
            }

            localStorage.setItem(PROMPT_SEEN_KEY, 'true');

            const wantsReminder = window.confirm(
                'Enable reminders?\n\nTaskFlow can notify you even when the app is closed.\n\nPress OK to enable notifications.'
            );

            if (!wantsReminder) {
                showToast('Reminder saved. Notifications can be enabled later from Settings.', 'info');
                return;
            }

            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                const subscription = await subscribeToPushNotifications(pushUserId, {
                    forceRefresh: true,
                });

                if (subscription) {
                    showToast('Notifications enabled for reminders', 'success');
                } else {
                    showToast('Notification permission granted, but push setup failed.', 'error');
                }

                return;
            }

            showToast('Notifications were not enabled.', 'error');
        };

        window.addEventListener('taskflow:reminder-task-saved', handleReminderTaskSaved);

        return () => {
            window.removeEventListener('taskflow:reminder-task-saved', handleReminderTaskSaved);
        };
    }, [user?.id, showToast]);
}