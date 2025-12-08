import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createAnnouncement, getAnnouncements, AnnouncementFormData } from '../api/notifications'

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
