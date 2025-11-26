import React, { useEffect } from 'react';
import { useUpcomingTravels, usePendingTasks } from '../../hooks/useTravelAgent';
import { useUpcomingFollowUps } from '../../hooks/useLeads';
import { NotificationService } from '../../services/NotificationService';
import * as Notifications from 'expo-notifications';

export function NotificationManager() {
    const { data: upcomingTravels } = useUpcomingTravels(100);
    const { data: pendingTasks } = usePendingTasks(100);
    const { data: upcomingLeads } = useUpcomingFollowUps(100);

    useEffect(() => {
        scheduleNotifications();
    }, [upcomingTravels, pendingTasks, upcomingLeads]);

    const scheduleNotifications = async () => {
        // First, cancel all existing notifications to avoid duplicates
        // In a production app, we might want to be smarter about this (diffing),
        // but for robustness and simplicity, we'll reschedule.
        await NotificationService.cancelAllNotifications();

        const prefs = await NotificationService.getPreferences();

        // Schedule Trips
        if (prefs.trips && upcomingTravels?.data) {
            for (const trip of upcomingTravels.data) {
                if (!trip.departure_date) continue;
                const departureDate = new Date(trip.departure_date);

                // 1 Day Before
                const dayBefore = new Date(departureDate);
                dayBefore.setDate(departureDate.getDate() - 1);
                dayBefore.setHours(9, 0, 0, 0); // 9 AM

                await NotificationService.scheduleNotification(
                    `trip_${trip.client_id}_before`,
                    'Upcoming Trip Tomorrow',
                    `${trip.full_name} is traveling to ${trip.destination_city || 'Destination'} tomorrow.`,
                    dayBefore,
                    'trips',
                    { tripId: trip.client_id }
                );

                // Day Of
                const dayOf = new Date(departureDate);
                dayOf.setHours(8, 0, 0, 0); // 8 AM

                await NotificationService.scheduleNotification(
                    `trip_${trip.client_id}_day`,
                    'Trip Today',
                    `${trip.full_name} is traveling to ${trip.destination_city || 'Destination'} today.`,
                    dayOf,
                    'trips',
                    { tripId: trip.client_id }
                );
            }
        }

        // Schedule Tasks
        if (prefs.tasks && pendingTasks?.data) {
            for (const task of pendingTasks.data) {
                if (!task.due_date) continue;
                const dueDate = new Date(task.due_date);

                // 1 Day Before
                const dayBefore = new Date(dueDate);
                dayBefore.setDate(dueDate.getDate() - 1);
                dayBefore.setHours(10, 0, 0, 0); // 10 AM

                await NotificationService.scheduleNotification(
                    `task_${task.id}_before`,
                    'Task Due Tomorrow',
                    `Task "${task.title}" for ${task.full_name} is due tomorrow.`,
                    dayBefore,
                    'tasks',
                    { taskId: task.id }
                );

                // Day Of
                const dayOf = new Date(dueDate);
                dayOf.setHours(9, 0, 0, 0); // 9 AM

                await NotificationService.scheduleNotification(
                    `task_${task.id}_day`,
                    'Task Due Today',
                    `Task "${task.title}" for ${task.full_name} is due today.`,
                    dayOf,
                    'tasks',
                    { taskId: task.id }
                );
            }
        }

        // Schedule Leads
        if (prefs.leads && upcomingLeads?.data) {
            for (const lead of upcomingLeads.data) {
                if (!lead.follow_up_date) continue;
                const followUpDate = new Date(lead.follow_up_date);

                // 1 Day Before
                const dayBefore = new Date(followUpDate);
                dayBefore.setDate(followUpDate.getDate() - 1);
                dayBefore.setHours(11, 0, 0, 0); // 11 AM

                await NotificationService.scheduleNotification(
                    `lead_${lead.id}_before`,
                    'Lead Follow-up Tomorrow',
                    `Follow up with ${lead.full_name} tomorrow.`,
                    dayBefore,
                    'leads',
                    { leadId: lead.id }
                );

                // Day Of
                const dayOf = new Date(followUpDate);
                dayOf.setHours(10, 0, 0, 0); // 10 AM

                await NotificationService.scheduleNotification(
                    `lead_${lead.id}_day`,
                    'Lead Follow-up Today',
                    `Time to follow up with ${lead.full_name}.`,
                    dayOf,
                    'leads',
                    { leadId: lead.id }
                );
            }
        }
    };

    return null; // This component doesn't render anything
}
