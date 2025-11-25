import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks'
import { CreateTaskDTO, UpdateTaskDTO } from '../types/tasks'

export function useTasks(filters?: { clientId?: string, status?: string }) {
    return useQuery({
        queryKey: ['tasks', filters],
        queryFn: () => getTasks(filters),
    })
}

export function useCreateTask() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (task: CreateTaskDTO) => createTask(task),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}

export function useUpdateTask() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTaskDTO }) => updateTask(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}

export function useDeleteTask() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}
