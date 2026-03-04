// ===================================
// TASK MONSTERS - SERVICE WORKER v3.0
// Handles background push notifications and scheduled task reminders
//
// CHANGES in v3.0:
//  - Version bump forces all clients to pick up the new SW immediately
//  - Notification checker uses setInterval + immediate check on every wake
//  - periodicSync event handler added for true background delivery
//  - notificationclick opens app and passes taskId via URL query param
//  - Deduplication: fired notifications are deleted from IndexedDB immediately
//  - Graceful error handling throughout
// ===================================

const SW_VERSION = '3.0.0';
const CACHE_NAME = 'task-monsters-v3';

// ===================================
// INSTALL & ACTIVATE
// ===================================
self.addEventListener('install', (event) => {
    console.log('[SW] Service Worker installed v' + SW_VERSION);
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker activated v' + SW_VERSION);
    event.waitUntil(clients.claim());
});

// ===================================
// INDEXED DB HELPERS
// ===================================
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TaskMonstersNotifications', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('scheduled')) {
                const store = db.createObjectStore('scheduled', { keyPath: 'id' });
                store.createIndex('fireAt', 'fireAt', { unique: false });
                store.createIndex('taskId', 'taskId', { unique: false });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveScheduledNotification(notification) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('scheduled', 'readwrite');
        tx.objectStore('scheduled').put(notification);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function getAllScheduledNotifications() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('scheduled', 'readonly');
        const request = tx.objectStore('scheduled').getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function deleteScheduledNotification(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('scheduled', 'readwrite');
        tx.objectStore('scheduled').delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function clearAllScheduledNotifications() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('scheduled', 'readwrite');
        tx.objectStore('scheduled').clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function clearNotificationsForTask(taskId) {
    const db = await openDB();
    const all = await getAllScheduledNotifications();
    const toDelete = all.filter(n => n.taskId === taskId);
    if (toDelete.length === 0) return 0;

    const tx = db.transaction('scheduled', 'readwrite');
    const store = tx.objectStore('scheduled');
    for (const n of toDelete) {
        store.delete(n.id);
    }
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(toDelete.length);
        tx.onerror = () => reject(tx.error);
    });
}

// ===================================
// NOTIFICATION CHECKER
// Runs every 30 seconds while the SW is alive.
// On mobile, the OS may kill the SW - it restarts on the next PING,
// visibilitychange, or periodicSync event.
// ===================================
let checkInterval = null;

function startNotificationChecker() {
    // Always run an immediate check when we start/restart
    checkAndFireNotifications();
    // Only create one interval
    if (checkInterval) return;
    checkInterval = setInterval(checkAndFireNotifications, 30000);
    console.log('[SW] Notification checker started');
}

async function checkAndFireNotifications() {
    try {
        const now = Date.now();
        const notifications = await getAllScheduledNotifications();

        for (const notif of notifications) {
            if (notif.fireAt <= now) {
                try {
                    await self.registration.showNotification(notif.title, {
                        body: notif.body,
                        icon: notif.icon || 'assets/logo/icon-192.png',
                        badge: 'assets/logo/icon-192.png',
                        tag: notif.id,
                        data: {
                            taskId: notif.taskId,
                            url: '/?task=' + encodeURIComponent(notif.taskId)
                        },
                        requireInteraction: false,
                        vibrate: [200, 100, 200],
                        actions: [
                            { action: 'open', title: '\uD83D\uDCCB Open App' },
                            { action: 'dismiss', title: 'Dismiss' }
                        ]
                    });
                    console.log('[SW] Fired notification: ' + notif.title);
                } catch (showErr) {
                    console.error('[SW] showNotification failed:', showErr);
                }
                // Always remove from DB whether or not showNotification succeeded
                await deleteScheduledNotification(notif.id);
            }
        }
    } catch (err) {
        console.error('[SW] Error in checkAndFireNotifications:', err);
    }
}

// ===================================
// SCHEDULE A TASK'S NOTIFICATIONS
// ===================================
async function handleScheduleNotifications({ task, taskId, intervals }) {
    if (!task || !task.dueDate) return;

    await clearNotificationsForTask(taskId);

    const dueTime = new Date(task.dueDate).getTime();
    const now = Date.now();
    const taskTitle = task.title || 'Task';
    const minuteIntervals = intervals || [20, 15, 10, 5, 2];

    for (const minutes of minuteIntervals) {
        const fireAt = dueTime - (minutes * 60 * 1000);
        if (fireAt > now) {
            const notifId = taskId + '-' + minutes + 'min';
            await saveScheduledNotification({
                id: notifId,
                taskId: taskId,
                fireAt: fireAt,
                title: '\u23F0 Task Due in ' + minutes + ' Minute' + (minutes === 1 ? '' : 's') + '!',
                body: '"' + taskTitle + '" is due in ' + minutes + ' minute' + (minutes === 1 ? '' : 's'),
                icon: 'assets/logo/icon-192.png',
                minutes: minutes
            });
        }
    }
    console.log('[SW] Scheduled reminders for: "' + taskTitle + '" (' + taskId + ')');
}

// ===================================
// MESSAGE HANDLER
// ===================================
self.addEventListener('message', async (event) => {
    const { type, payload } = event.data || {};
    const port = event.ports[0];

    try {
        switch (type) {
            case 'SCHEDULE_NOTIFICATIONS':
                await handleScheduleNotifications(payload);
                startNotificationChecker();
                port && port.postMessage({ success: true });
                break;

            case 'CLEAR_TASK_NOTIFICATIONS':
                const cleared = await clearNotificationsForTask(payload.taskId);
                port && port.postMessage({ success: true, cleared });
                break;

            case 'CLEAR_ALL_NOTIFICATIONS':
                await clearAllScheduledNotifications();
                port && port.postMessage({ success: true });
                break;

            case 'GET_SCHEDULED':
                const all = await getAllScheduledNotifications();
                port && port.postMessage({ success: true, notifications: all });
                break;

            case 'RESCHEDULE_ALL':
                await clearAllScheduledNotifications();
                if (payload && payload.tasks) {
                    for (const item of payload.tasks) {
                        await handleScheduleNotifications(item);
                    }
                }
                startNotificationChecker();
                port && port.postMessage({ success: true });
                break;

            case 'PING':
                startNotificationChecker();
                port && port.postMessage({ success: true, version: SW_VERSION });
                break;

            default:
                port && port.postMessage({ success: false, error: 'Unknown message type: ' + type });
        }
    } catch (err) {
        console.error('[SW] Message handler error for type "' + type + '":', err);
        port && port.postMessage({ success: false, error: err.message });
    }
});

// ===================================
// PUSH EVENT (for server-sent push, future use)
// ===================================
self.addEventListener('push', (event) => {
    if (!event.data) return;
    try {
        const data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title || '\u23F0 Task Reminder', {
                body: data.body || 'You have a task due soon!',
                icon: data.icon || 'assets/logo/icon-192.png',
                badge: 'assets/logo/icon-192.png',
                tag: data.tag || 'task-reminder-push',
                data: { url: data.url || '/' },
                requireInteraction: false,
                vibrate: [200, 100, 200]
            })
        );
    } catch (err) {
        console.error('[SW] Push event error:', err);
    }
});

// ===================================
// NOTIFICATION CLICK HANDLER
// Opens the app and navigates to the relevant task
// ===================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const action = event.action;
    if (action === 'dismiss') return;

    const notifData = event.notification.data || {};
    const targetUrl = notifData.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.focus();
                    if ('navigate' in client) {
                        client.navigate(targetUrl);
                    }
                    return;
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// ===================================
// PERIODIC BACKGROUND SYNC
// Fires every ~15 minutes on Chrome/Android even when app is closed
// ===================================
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-task-notifications') {
        console.log('[SW] Periodic sync fired - checking notifications');
        event.waitUntil(checkAndFireNotifications());
    }
});

// ===================================
// BACKGROUND SYNC (one-shot)
// ===================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'check-notifications') {
        event.waitUntil(checkAndFireNotifications());
    }
});

// Start the checker immediately when SW loads
startNotificationChecker();
console.log('[SW] Task Monsters Service Worker v' + SW_VERSION + ' loaded');
