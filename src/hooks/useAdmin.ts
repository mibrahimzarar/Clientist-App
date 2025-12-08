import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getAdminDashboardSummary,
    getUsers,
    updateUserStatus
} from '../api/admin'
import { AdminSearchFilters } from '../types/admin'

export function useAdminDashboardSummary() {
    return useQuery({
        queryKey: ['admin-dashboard-summary'],
        queryFn: getAdminDashboardSummary,
        staleTime: 60 * 1000,
    })
}

export function useUsers(page: number = 1, pageSize: number = 20, filters?: AdminSearchFilters) {
    return useQuery({
        queryKey: ['admin-users', page, pageSize, filters],
        queryFn: () => getUsers(page, pageSize, filters),
        staleTime: 5 * 60 * 1000,
    })
}

export function useUpdateUserStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'banned' }) =>
            updateUserStatus(userId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] })
        },
    })
}
