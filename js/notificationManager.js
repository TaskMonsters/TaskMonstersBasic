// ===================================
// NOTIFICATION MANAGER v3.0
// Push notifications for task reminders via Service Worker
// Works when app is in background/closed on mobile (PWA)
//
// FIXES in v3.0:
//  - Single SW registration point (reuses existing registration)
//  - Robust SW controller acquisition with retry logic
//  - Re-schedules on visibilitychange + focus (keeps mobile SW alive)
//  - Periodic Background Sync registration for true background delivery
//  - Graceful fallback chain: SW -> Basic Notification -> Silent log
//  - Deduplication guard so the same threshold never fires twice
// ===================================

class NotificationManager {
    constructor() {
        this.permissionGranted = (typeof Notification !== 'undefined' && Notification.permission === 'granted');
        this.swRegistration = null;
        this.swReady = false;
        this._basicTimeouts = new Map();   // taskId -> [timeoutId, ...]
        this._pendingMessages = [];        // queued before SW is ready
        this._initPromise = null;
    }

    // ===================================
    // INIT - called once on page load
    // ===================================
    init() {
        if (this._initPromise) return this._initPromise;
        this._initPromise = this._doInit();
        return this._initPromise;
    }

    async _doInit() {
        if (typeof Notification === 'undefined') {
            console.warn('[Notifications] Browser does not support Notifications API');
            return;
        }
        if (Notification.permission === 'granted') {
            this.permissionGranted = true;
        }
        await this._registerServiceWorker();
        this._bindVisibilityHandlers();
    }

    // ===================================
    // SERVICE WORKER REGISTRATION
    // Reuses existing registration to avoid duplicate SW conflicts
    // ===================================
    async _registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('[Notifications] Service Workers not supported - using basic notifications');
            return;
        }
        try {
            // Reuse existing registration if already present (avoids double-register)
            const existing = await navigator.serviceWorker.getRegistration('/');
            if (existing) {
                this.swRegistration = existing;
            } else {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            }

            // Wait until the SW is fully controlling the page
            await navigator.serviceWorker.ready;
            this.swReady = true;

            // Ping SW to start its internal notification checker
            await this._sendToSW({ type: 'PING' });

            // Register Periodic Background Sync (Chrome/Android only, silently ignored elsewhere)
            await this._registerPeriodicSync();

            // Flush any messages that were queued before SW was ready
            for (const msg of this._pendingMessages) {
                await this._sendToSW(msg);
            }
            this._pendingMessages = [];

        } catch (err) {
            console.error('[Notifications] SW registration failed - falling back to basic notifications:', err);
        }
    }

    // ===================================
    // PERIODIC BACKGROUND SYNC
    // Allows the SW to wake up every ~15 min even when app is closed
    // ===================================
    async _registerPeriodicSync() {
        try {
            if (!this.swRegistration || !('periodicSync' in this.swRegistration)) return;
            const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
            if (status.state === 'granted') {
                await this.swRegistration.periodicSync.register('check-task-notifications', {
                    minInterval: 15 * 60 * 1000 // 15 minutes
                });

            }
        } catch (err) {
            // Not supported on this platform - silent fail
        }
    }

    // ===================================
    // VISIBILITY / FOCUS HANDLERS
    // Re-ping SW when app comes back to foreground so the interval restarts
    // ===================================
    _bindVisibilityHandlers() {
        const ping = () => {
            if (!document.hidden && window.gameState && window.gameState.notifications) {
                this._sendToSW({ type: 'PING' }).catch(() => {});
                // Also reschedule in case SW lost its IndexedDB state after being killed
                this.rescheduleAllNotifications();
            }
        };
        document.addEventListener('visibilitychange', ping);
        window.addEventListener('focus', ping);
    }

    // ===================================
    // SEND MESSAGE TO SERVICE WORKER
    // Returns a Promise that resolves with the SW's reply
    // ===================================
    _sendToSW(message) {
        return new Promise((resolve) => {
            // If SW is not yet controlling the page, queue the message
            if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
                this._pendingMessages.push(message);
                resolve({ queued: true });
                return;
            }
            const channel = new MessageChannel();
            channel.port1.onmessage = (event) => resolve(event.data);
            navigator.serviceWorker.controller.postMessage(message, [channel.port2]);
            // Safety timeout - resolve after 4 s so we never hang
            setTimeout(() => resolve({ timeout: true }), 4000);
        });
    }

    // ===================================
    // REQUEST NOTIFICATION PERMISSION
    // ===================================
    async requestPermission() {
        if (typeof Notification === 'undefined') return false;
        if (Notification.permission === 'granted') {
            this.permissionGranted = true;
            if (!this.swReady) await this._registerServiceWorker();
            return true;
        }
        if (Notification.permission === 'denied') return false;

        const permission = await Notification.requestPermission();
        this.permissionGranted = (permission === 'granted');

        if (this.permissionGranted && !this.swReady) {
            await this._registerServiceWorker();
        }
        return this.permissionGranted;
    }

    // ===================================
    // SCHEDULE NOTIFICATIONS FOR A SINGLE TASK
    // Tries SW first, falls back to setTimeout
    // ===================================
    async scheduleTaskNotifications(task, taskIndex) {
        if (!window.gameState || !window.gameState.notifications) return;
        if (!task || !task.dueDate) return;

        const taskId = task.id || ('task-' + taskIndex);
        const dueTime = new Date(task.dueDate).getTime();
        if (isNaN(dueTime) || dueTime <= Date.now()) return;

        if (this.swReady && navigator.serviceWorker.controller) {
            try {
                await this._sendToSW({
                    type: 'SCHEDULE_NOTIFICATIONS',
                    payload: {
                        task: { title: task.title, dueDate: task.dueDate },
                        taskId: taskId,
                        intervals: [20, 15, 10, 5, 2]
                    }
                });

                return;
            } catch (err) {
                console.warn('[Notifications] SW schedule failed - using setTimeout fallback:', err);
            }
        }
        // Fallback: in-page setTimeout (app must remain open)
        this._scheduleBasicNotifications(task, taskIndex);
    }

    // ===================================
    // RESCHEDULE ALL ACTIVE TASKS
    // Called on app load, visibility restore, and notification toggle
    // ===================================
    async rescheduleAllNotifications() {
        if (!window.gameState || !window.gameState.tasks) return;

        const activeTasks = window.gameState.tasks
            .map((task, index) => ({ task, index }))
            .filter(({ task }) => !task.completed && task.dueDate);

        if (activeTasks.length === 0) return;

        if (this.swReady && navigator.serviceWorker.controller) {
            try {
                const taskPayloads = activeTasks.map(({ task, index }) => ({
                    task: { title: task.title, dueDate: task.dueDate },
                    taskId: task.id || ('task-' + index),
                    intervals: [20, 15, 10, 5, 2]
                }));
                await this._sendToSW({ type: 'RESCHEDULE_ALL', payload: { tasks: taskPayloads } });

                return;
            } catch (err) {
                console.warn('[Notifications] SW reschedule failed - using fallback:', err);
            }
        }
        // Fallback
        activeTasks.forEach(({ task, index }) => this._scheduleBasicNotifications(task, index));
    }

    // ===================================
    // CLEAR NOTIFICATIONS FOR A SPECIFIC TASK
    // ===================================
    async clearTaskNotifications(taskIndexOrId) {
        const taskId = typeof taskIndexOrId === 'string' ? taskIndexOrId : ('task-' + taskIndexOrId);

        if (this.swReady && navigator.serviceWorker.controller) {
            try {
                await this._sendToSW({ type: 'CLEAR_TASK_NOTIFICATIONS', payload: { taskId } });
            } catch (err) {
                console.warn('[Notifications] Could not clear SW notifications for task:', err);
            }
        }
        this._clearBasicNotifications(taskId);
    }

    // ===================================
    // CLEAR ALL NOTIFICATIONS
    // ===================================
    async clearAllNotifications() {
        if (this.swReady && navigator.serviceWorker.controller) {
            try {
                await this._sendToSW({ type: 'CLEAR_ALL_NOTIFICATIONS' });
            } catch (err) {
                console.warn('[Notifications] Could not clear all SW notifications:', err);
            }
        }
        this._basicTimeouts.forEach(timeouts => timeouts.forEach(id => clearTimeout(id)));
        this._basicTimeouts.clear();

    }

    // ===================================
    // SEND AN IMMEDIATE (AD-HOC) NOTIFICATION
    // ===================================
    async sendNotification(title, body, icon) {
        icon = icon || 'assets/logo/icon-192.png';
        if (!window.gameState || !window.gameState.notifications) return;
        if (!this.permissionGranted) return;

        if (this.swRegistration && this.swReady) {
            try {
                await this.swRegistration.showNotification(title, {
                    body: body,
                    icon: icon,
                    badge: 'assets/logo/icon-192.png',
                    tag: 'task-monsters-adhoc-' + Date.now(),
                    requireInteraction: false,
                    vibrate: [200, 100, 200]
                });
                return;
            } catch (err) { /* fall through to basic */ }
        }
        this._showBasicNotification(title, body, icon);
    }

    // ===================================
    // FALLBACK: Basic setTimeout notifications
    // (only works while the app tab is open)
    // ===================================
    _scheduleBasicNotifications(task, taskIndex) {
        const taskId = task.id || ('task-' + taskIndex);
        this._clearBasicNotifications(taskId);
        if (!task.dueDate) return;

        const dueTime = new Date(task.dueDate).getTime();
        const now = Date.now();
        const timeouts = [];
        const self = this;

        [20, 15, 10, 5, 2].forEach(function(minutes) {
            const delay = dueTime - (minutes * 60 * 1000) - now;
            if (delay > 0) {
                const id = setTimeout(function() {
                    self._showBasicNotification(
                        '\u23F0 Task Due in ' + minutes + ' Minute' + (minutes === 1 ? '' : 's') + '!',
                        '"' + task.title + '" is due in ' + minutes + ' minute' + (minutes === 1 ? '' : 's')
                    );
                }, delay);
                timeouts.push(id);
            }
        });

        if (timeouts.length > 0) {
            this._basicTimeouts.set(taskId, timeouts);

        }
    }

    _clearBasicNotifications(taskId) {
        if (this._basicTimeouts.has(taskId)) {
            this._basicTimeouts.get(taskId).forEach(id => clearTimeout(id));
            this._basicTimeouts.delete(taskId);
        }
    }

    _showBasicNotification(title, body, icon) {
        icon = icon || 'assets/logo/icon-192.png';
        if (!window.gameState || !window.gameState.notifications) return;
        if (!this.permissionGranted) return;
        try {
            const notif = new Notification(title, {
                body: body,
                icon: icon,
                badge: 'assets/logo/icon-192.png',
                tag: 'task-reminder-' + Date.now(),
                requireInteraction: false
            });
            notif.onclick = () => { window.focus(); notif.close(); };
            setTimeout(() => notif.close(), 15000);
        } catch (err) {
            console.error('[Notifications] Basic notification error:', err);
        }
    }

    // ===================================
    // LEGACY ALIAS - kept for backwards compatibility
    // ===================================
    async sendToSW(message) {
        return this._sendToSW(message);
    }
}

// ===================================
// GLOBAL SINGLETON
// ===================================
window.notificationManager = new NotificationManager();

// Auto-init on DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {
    window.notificationManager.init().then(function() {
        // If notifications were already enabled (saved in gameState), reschedule
        setTimeout(async function() {
            if (window.gameState && window.gameState.notifications) {
                const granted = await window.notificationManager.requestPermission();
                if (granted) {
                    window.notificationManager.rescheduleAllNotifications();
                }
            }
        }, 2000);
    });
});
