import { getSupabase } from '../config/supabase';

const SUBSCRIPTION_KEY = 'taskflow-web-push-subscription';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function registerServiceWorkerForPush(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.warn('[TaskFlow] Service worker not ready for push notifications.', error);
    return null;
  }
}

export async function subscribeToPushNotifications(userId?: string): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  if (!vapidPublicKey) {
    console.warn('[TaskFlow] Missing VITE_VAPID_PUBLIC_KEY. Closed-app push notifications are not enabled yet.');
    return null;
  }

  const registration = await registerServiceWorkerForPush();
  if (!registration) return null;

  try {
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      }));

    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription.toJSON()));
    await saveSubscription(subscription, userId);
    return subscription;
  } catch (error) {
    console.warn('[TaskFlow] Push subscription failed.', error);
    return null;
  }
}

async function saveSubscription(subscription: PushSubscription, userId?: string): Promise<void> {
  const payload = {
    userId: userId ?? null,
    subscription: subscription.toJSON(),
    endpoint: subscription.endpoint,
    userAgent: navigator.userAgent,
  };

  try {
    await fetch('/api/push-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return;
  } catch (error) {
    console.warn('[TaskFlow] API subscription save failed. Trying Supabase fallback.', error);
  }

  const supabase = getSupabase();
  if (!supabase || !userId) return;

  try {
    await supabase.from('taskflow_push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        subscription: subscription.toJSON(),
        user_agent: navigator.userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' }
    );
  } catch (error) {
    console.warn('[TaskFlow] Supabase subscription save failed.', error);
  }
}
