import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type NotificationCategory = 'trips' | 'tasks' | 'leads';

export interface NotificationPreferences {
    trips: boolean;
    tasks: boolean;
    leads: boolean;
}

const PREFERENCES_KEY = 'clientist_notification_preferences';

export const NotificationService = {
    async requestPermissions() {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus === 'granted';
    },

    async getPreferences(): Promise<NotificationPreferences> {
        try {
            const jsonValue = await AsyncStorage.getItem(PREFERENCES_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : { trips: true, tasks: true, leads: true };
        } catch (e) {
            console.error('Error reading notification preferences', e);
            return { trips: true, tasks: true, leads: true };
        }
    },

    async savePreferences(preferences: NotificationPreferences) {
        try {
            await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
        } catch (e) {
            console.error('Error saving notification preferences', e);
        }
    },

    async scheduleNotification(
        id: string,
        title: string,
        body: string,
        date: Date,
        category: NotificationCategory,
        data: any = {}
    ) {
        const preferences = await this.getPreferences();
        if (!preferences[category]) return;

        // Don't schedule if date is in the past
        if (date.getTime() <= Date.now()) return;

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: { ...data, category, id },
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date,
                },
            });
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    },

    async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    },

    async cancelNotificationsByCategory(category: NotificationCategory) {
        // Expo doesn't support querying by category easily without storing IDs.
        // For robustness, we'll rely on rescheduling everything when data/prefs change.
        // This is a simplified approach: Cancel ALL and let the manager reschedule enabled ones.
        // In a more complex app, we'd track IDs.
        // For now, we will just provide a method to cancel all, and the manager will re-schedule what's needed.
    }
};
