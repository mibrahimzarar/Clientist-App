import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    createAnnouncement,
    getAnnouncements,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    AnnouncementFormData
} from '../api/notifications'

export function useAnnouncements() {
    return useQuery({
        queryKey: ['announcements'],
        queryFn: getAnnouncements,
        staleTime: 5 * 60 * 1000,
    })
}

export function useCreateAnnouncement() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: AnnouncementFormData) => createAnnouncement(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] })
        },
    })
}

export function useUserNotifications() {
    return useQuery({
        queryKey: ['user-notifications'],
        queryFn: getUserNotifications,
        // Poll every 30 seconds for new notifications
        refetchInterval: 30000,
    })
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
        },
    })
}

export function useMarkAllAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
        },
    })
}
