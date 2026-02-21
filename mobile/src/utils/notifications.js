import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Set how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Requests permission for push notifications and configures channels for Android.
 * Needs to be called early in the app lifecycle (e.g. _layout.jsx).
 */
export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#10b981',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }
        // Note: To get an actual Expo Push Token for sending from a backend,
        // you would call Notifications.getExpoPushTokenAsync({ projectId: '...' })
        // For local notifications, we don't strictly need the token, but getting permissions is required.
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Notification permissions granted. Expo Push Token:', token);
    } else {
        // Notifications don't work well on standard emulators without explicit setup
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

/**
 * Schedules a simple local notification immediately.
 */
export async function sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "OrganiSort 🌿",
            body: "Notifications are working! Keep scanning that waste.",
            data: { url: '/scan' },
        },
        trigger: null, // trigger immediately
    });
}

/**
 * Schedules a daily reminder to log waste.
 */
export async function scheduleDailyReminder(hour = 18, minute = 0) {
    // Clear existing reminders first so we don't stack them
    await cancelAllReminders();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Time to tidy up! ♻️",
            body: "Have you logged any waste today? Scan an item to keep your streak going!",
        },
        trigger: {
            hour,
            minute,
            repeats: true,
        },
    });
    console.log(`Scheduled daily reminder for ${hour}:${minute === 0 ? '00' : minute}`);
}

export async function cancelAllReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all scheduled notifications');
}
