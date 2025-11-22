import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTrips, getTripById, createTrip, updateTrip, deleteTrip } from '../api/trips'
import { TripFormData, TripFilters } from '../types/trips'

export function useTrips(userId: string, filters?: TripFilters) {
    return useQuery({
        queryKey: ['trips', userId, filters],
        queryFn: () => getTrips(userId, filters),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useTrip(id: string) {
    return useQuery({
        queryKey: ['trip', id],
        queryFn: () => getTripById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })
}

export function useCreateTrip(userId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: TripFormData) => createTrip(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips', userId] })
        },
    })
}

export function useUpdateTrip() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TripFormData> }) => updateTrip(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['trips'] })
            queryClient.invalidateQueries({ queryKey: ['trip', id] })
        },
    })
}

export function useDeleteTrip() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteTrip(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] })
        },
    })
}
