// Service Worker for Web Push Notifications
// This file must be in the public directory

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', function (event) {
    console.log('[SW] Push Received!', event);
    if (!event.data) {
        console.log('[SW] No data in push event');
        return;
    }

    try {
        const data = event.data.json();
        console.log('[SW] Push Data:', data);

        const options = {
            body: data.body || 'New notification from StreakDSA',
            icon: '/icon.png',
            badge: '/icon.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/',
            },
            actions: data.actions || [],
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'StreakDSA', options)
                .then(() => console.log('[SW] Notification shown!'))
                .catch(err => console.error('[SW] Notification Error:', err))
        );
    } catch (err) {
        console.error('[SW] Error parsing push data:', err);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
            // Check if there's already a window open
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // If no window open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
