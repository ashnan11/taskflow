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

function getVapidPublicKey(): string | null {
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

  if (!vapidPublicKey) {
    console.warn('[TaskFlow] Missing VITE_VAPID_PUBLIC_KEY.');
    return null;
  }

  return vapidPublicKey;
}

async function saveSubscription(subscription: PushSubscription, userId?: string): Promise<boolean> {
  if (!userId) {
    console.warn('[TaskFlow] No userId provided for push subscription.');
    return false;
  }

  const subscriptionJson = subscription.toJSON();

  const payload = {
    userId,
    subscription: subscriptionJson,
    endpoint: subscription.endpoint,
    userAgent: navigator.userAgent,
  };

  try {
    const response = await fetch('/api/push-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('[TaskFlow] Push subscription API response:', result);

    if (!response.ok) {
      throw new Error(result?.error || 'Failed to save push subscription');
    }
  } catch (error) {
    console.warn('[TaskFlow] API subscription save failed. Trying Supabase fallback.', error);
  }

  const supabase = getSupabase();

  if (!supabase) {
    console.warn('[TaskFlow] Supabase client not available for push subscription fallback.');
    return false;
  }

  const { error } = await supabase.from('taskflow_push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      subscription: subscriptionJson,
      user_agent: navigator.userAgent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' }
  );

  if (error) {
    console.warn('[TaskFlow] Supabase subscription save failed.', error);
    return false;
  }

  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscriptionJson));
  console.log('[TaskFlow] Push subscription saved for user:', userId);

  return true;
}

export async function subscribeToPushNotifications(
  userId?: string,
  options: { forceRefresh?: boolean } = {}
): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('[TaskFlow] Push notifications are not supported on this device/browser.');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('[TaskFlow] Notification permission is not granted.');
    return null;
  }

  const vapidPublicKey = getVapidPublicKey();
  if (!vapidPublicKey) return null;

  const registration = await registerServiceWorkerForPush();
  if (!registration) return null;

  try {
    let subscription = await registration.pushManager.getSubscription();

    if (subscription && options.forceRefresh) {
      await subscription.unsubscribe();
      subscription = null;
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
    }

    await saveSubscription(subscription, userId);
    return subscription;
  } catch (error) {
    console.warn('[TaskFlow] Push subscription failed.', error);
    return null;
  }
}