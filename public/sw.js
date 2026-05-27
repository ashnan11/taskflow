self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_error) {
    data = { title: 'TaskFlow Reminder', body: event.data ? event.data.text() : 'You have a task reminder.' };
  }

  const title = data.title || 'TaskFlow Reminder';
  const options = {
    body: data.body || data.taskTitle || 'You have a task reminder.',
    icon: data.icon || '/web-app-manifest-192x192.png',
    badge: data.badge || '/web-app-manifest-192x192.png',
    tag: data.tag || `taskflow-${Date.now()}`,
    requireInteraction: true,
    data: {
      url: data.url || '/',
      taskId: data.taskId || null,
    },
    actions: [
      { action: 'open', title: 'Open task' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({ type: 'TASKFLOW_OPEN_TASK', taskId: event.notification.data?.taskId ?? null });
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
      return undefined;
    })
  );
});
