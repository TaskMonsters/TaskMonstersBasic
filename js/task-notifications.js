/**
 * Task Notifications Manager v2.0
 * Secondary polling layer - checks tasks every 30 seconds and fires
 * notifications via the primary NotificationManager (which uses the SW).
 *
 * This file acts as a safety net for the SW-based system:
 *  - If the SW is alive, it handles delivery; this file deduplicates.
 *  - If the SW is dead (e.g. iOS Safari), this file fires basic notifications.
 *
 * Notifications sent at: 20, 15, 10, 5, and 2 minutes before due time.
 */
class TaskNotificationsManager {
    constructor() {
        this.checkInterval = null;
        this.notificationThresholds = [20, 15, 10, 5, 2]; // minutes before due
        this.sentNotifications = new Map(); // key -> timestamp, deduplication guard
        this.isInitialized = false;
    }

    /**
     * Initialize the notification system
     */
    async init() {
        if (this.isInitialized) return;

        this.loadSentNotifications();
        this.startBackgroundCheck();
        this.isInitialized = true;

    }

    /**
     * Start background timer to check tasks every 30 seconds
     */
    startBackgroundCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        // Check immediately on start
        this.checkTasksAndNotify();
        // Then every 30 seconds
        this.checkInterval = setInterval(() => {
            this.checkTasksAndNotify();
        }, 30000);

    }

    /**
     * Stop background checking
     */
    stopBackgroundCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * Check all tasks and send notifications for those approaching due time.
     * Uses a 90-second window around each threshold to account for polling jitter.
     */
    checkTasksAndNotify() {
        if (!window.gameState || !window.gameState.notifications) return;

        const tasks = window.gameState.tasks || [];
        const now = new Date();

        tasks.forEach((task, index) => {
            if (task.completed || !task.dueDate) return;

            const dueDate = new Date(task.dueDate);
            const timeDiff = dueDate.getTime() - now.getTime();
            const minutesDiff = timeDiff / (1000 * 60);

            // Clean up stale records for tasks that are already overdue
            if (minutesDiff < -1) {
                this.cleanupTaskNotifications(task.id || index);
                return;
            }

            this.notificationThresholds.forEach(threshold => {
                // Fire if we are within a 90-second window of the threshold
                if (minutesDiff <= threshold && minutesDiff > (threshold - 1.5)) {
                    const notificationKey = (task.id || index) + '_' + threshold;
                    if (!this.sentNotifications.has(notificationKey)) {
                        // Mark as sent BEFORE firing to prevent race conditions
                        this.sentNotifications.set(notificationKey, Date.now());
                        this.saveSentNotifications();
                        this.sendTaskNotification(task, threshold);
                    }
                }
            });
        });
    }

    /**
     * Send notification for a specific task via the primary NotificationManager.
     * Falls back to basic Notification API if NotificationManager is unavailable.
     */
    sendTaskNotification(task, minutesRemaining) {
        const title = '\u23F0 Task Due in ' + minutesRemaining + ' Minute' + (minutesRemaining === 1 ? '' : 's') + '!';
        const body = '"' + task.title + '" is due in ' + minutesRemaining + ' minute' + (minutesRemaining === 1 ? '' : 's');

        // Prefer the primary NotificationManager (uses SW)
        if (window.notificationManager && window.notificationManager.permissionGranted) {
            window.notificationManager.sendNotification(title, body);
            return;
        }

        // Fallback: sendLocalNotification from firebase-config.js
        if (window.sendLocalNotification) {
            window.sendLocalNotification(title, body);
            return;
        }

        // Last resort: raw Notification API
        this.sendBasicNotification(title, body);
    }

    /**
     * Raw Notification API fallback
     */
    sendBasicNotification(title, body) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        try {
            const notification = new Notification(title, {
                body: body,
                icon: 'assets/logo/icon-192.png',
                badge: 'assets/logo/icon-192.png',
                tag: 'task-reminder-basic'
            });
            setTimeout(() => notification.close(), 12000);
            notification.onclick = function() {
                window.focus();
                notification.close();
            };
        } catch (error) {
            console.error('[TaskNotifications] Error sending basic notification:', error);
        }
    }

    /**
     * Clean up notification records for a specific task
     */
    cleanupTaskNotifications(taskId) {
        this.notificationThresholds.forEach(threshold => {
            this.sentNotifications.delete(taskId + '_' + threshold);
        });
        this.saveSentNotifications();
    }

    /**
     * Load sent notifications from localStorage
     */
    loadSentNotifications() {
        try {
            const saved = localStorage.getItem('sentTaskNotifications');
            if (saved) {
                const data = JSON.parse(saved);
                this.sentNotifications = new Map(Object.entries(data));
                // Prune entries older than 24 hours
                const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
                for (const [key, timestamp] of this.sentNotifications.entries()) {
                    if (timestamp < oneDayAgo) {
                        this.sentNotifications.delete(key);
                    }
                }
            }
        } catch (error) {
            console.error('[TaskNotifications] Error loading sent notifications:', error);
            this.sentNotifications = new Map();
        }
    }

    /**
     * Save sent notifications to localStorage
     */
    saveSentNotifications() {
        try {
            const data = Object.fromEntries(this.sentNotifications);
            localStorage.setItem('sentTaskNotifications', JSON.stringify(data));
        } catch (error) {
            console.error('[TaskNotifications] Error saving sent notifications:', error);
        }
    }

    /**
     * Clear all sent notification records
     */
    clearAllNotifications() {
        this.sentNotifications.clear();
        localStorage.removeItem('sentTaskNotifications');

    }

    /**
     * Request notification permission (delegates to NotificationManager)
     */
    async requestPermission() {
        if (window.notificationManager) {
            return window.notificationManager.requestPermission();
        }
        if (!('Notification' in window)) return false;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
}

// Create global instance
window.taskNotificationsManager = new TaskNotificationsManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.taskNotificationsManager.init();
    });
} else {
    window.taskNotificationsManager.init();
}
