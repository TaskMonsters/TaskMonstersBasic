/**
 * Firebase Configuration and Initialization
 * Handles Firebase Cloud Messaging for push notifications
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA_Y5V35a0PPpj1dbFM6-FSWUPgWdGXhiA",
    authDomain: "taskmonsters-d2b42.firebaseapp.com",
    projectId: "taskmonsters-d2b42",
    storageBucket: "taskmonsters-d2b42.firebasestorage.app",
    messagingSenderId: "608700693426",
    appId: "1:608700693426:web:62eee03afb7d16a5ca82ab",
    measurementId: "G-40NHKEG48H"
};

// VAPID key for push notifications
const vapidKey = "BG88qdZIOq9bJ1hh6z4eQpaOdKatlPhv2pklxSlKygJQAcbS1icFdTgBDg6bnHad3GA2oSR2Furf0g0BTxPZWmg";

// Initialize Firebase (using modular SDK approach)
let app, messaging;

async function initializeFirebase() {
    try {
        // Check if Firebase is already loaded
        if (typeof firebase === 'undefined') {
            console.error('[Firebase] Firebase SDK not loaded');
            return false;
        }

        // Initialize Firebase app
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);

        } else {
            app = firebase.app();
        }

        // Initialize Firebase Cloud Messaging
        if (firebase.messaging.isSupported()) {
            messaging = firebase.messaging();

            return true;
        } else {
            console.warn('[Firebase] Messaging not supported in this browser');
            return false;
        }
    } catch (error) {
        console.error('[Firebase] Initialization error:', error);
        return false;
    }
}

/**
 * Request notification permission and get FCM token
 */
async function requestNotificationPermission() {
    try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('[Notifications] Not supported in this browser');
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {

            // Get FCM token
            if (messaging) {
                const token = await messaging.getToken({ vapidKey });

                // Save token to gameState
                if (window.gameState) {
                    window.gameState.fcmToken = token;
                    window.saveGameState();
                }
                
                return token;
            }
        } else {
            console.warn('[Notifications] Permission denied');
            return null;
        }
    } catch (error) {
        console.error('[Notifications] Permission error:', error);
        return null;
    }
}

/**
 * Send a local notification (fallback when FCM is not available)
 */
function sendLocalNotification(title, body, icon = 'assets/Pink_Monster_idle.gif') {
    try {
        // Check if notifications are supported and permitted
        if (!('Notification' in window)) {
            console.warn('[Notifications] Not supported');
            return false;
        }

        if (Notification.permission !== 'granted') {
            console.warn('[Notifications] Permission not granted');
            return false;
        }

        // Create notification
        const notification = new Notification(title, {
            body: body,
            icon: icon,
            badge: icon,
            tag: 'task-reminder',
            requireInteraction: false,
            silent: false
        });

        // Auto-close after 10 seconds
        setTimeout(() => {
            notification.close();
        }, 10000);

        // Handle notification click
        notification.onclick = function() {
            window.focus();
            notification.close();
        };

        return true;
    } catch (error) {
        console.error('[Notifications] Error sending local notification:', error);
        return false;
    }
}

/**
 * Handle incoming FCM messages when app is in foreground
 */
function setupForegroundMessageHandler() {
    if (!messaging) return;

    messaging.onMessage((payload) => {

        const notificationTitle = payload.notification?.title || 'Task Reminder';
        const notificationBody = payload.notification?.body || 'A task is due soon!';
        
        // Show local notification
        sendLocalNotification(notificationTitle, notificationBody);
    });
}

// Export functions
window.initializeFirebase = initializeFirebase;
window.requestNotificationPermission = requestNotificationPermission;
window.sendLocalNotification = sendLocalNotification;
window.setupForegroundMessageHandler = setupForegroundMessageHandler;
