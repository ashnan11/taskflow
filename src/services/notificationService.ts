export type AppNotificationType =
  | 'task-reminder'
  | 'task-overdue'
  | 'task-deadline'
  | 'recurring-task'
  | 'pomodoro'
  | 'daily-summary'
  | 'general';

export interface AppNotificationPayload {
  title: string;
  body?: string;
  tag?: string;
  type?: AppNotificationType;
  url?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
  onFallback?: () => void;
}

const DEFAULT_ICON = '/web-app-manifest-192x192.png';
const DEFAULT_BADGE = '/web-app-manifest-192x192.png';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  try {
    if (!isNotificationSupported()) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return await Notification.requestPermission();
  } catch (error) {
    console.warn('[TaskFlow] Notification permission request failed:', error);
    return 'denied';
  }
}

async function getReadyServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.warn('[TaskFlow] Service worker is not ready for notifications:', error);
    return null;
  }
}

export async function showAppNotification(payload: AppNotificationPayload): Promise<boolean> {
  try {
    if (!isNotificationSupported()) {
      payload.onFallback?.();
      return false;
    }

    if (Notification.permission !== 'granted') {
      payload.onFallback?.();
      return false;
    }

    const registration = await getReadyServiceWorker();

    if (registration?.showNotification) {
      await registration.showNotification(payload.title, {
        body: payload.body,
        icon: DEFAULT_ICON,
        badge: DEFAULT_BADGE,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction ?? false,
        data: {
          url: payload.url ?? '/',
          type: payload.type ?? 'general',
          ...payload.data,
        },
      });
      return true;
    }

    payload.onFallback?.();
    return false;

  } catch (error) {
    console.warn('[TaskFlow] Browser notification failed safely:', error);
    payload.onFallback?.();
    return false;
  }
}

export async function showTaskNotification(options: {
  taskId: string;
  taskTitle: string;
  dueAt?: Date;
  type?: AppNotificationType;
  onFallback?: () => void;
}): Promise<boolean> {
  const tagDate = options.dueAt ? options.dueAt.toISOString() : new Date().toISOString();
  return showAppNotification({
    title: 'TaskFlow Reminder',
    body: options.taskTitle,
    tag: `taskflow-${options.type ?? 'task-reminder'}-${options.taskId}-${tagDate}`,
    type: options.type ?? 'task-reminder',
    url: '/',
    requireInteraction: true,
    data: {
      taskId: options.taskId,
      dueAt: options.dueAt?.toISOString(),
    },
    onFallback: options.onFallback,
  });
}
