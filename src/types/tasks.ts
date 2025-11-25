export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface ClientTask {
    id: string
    client_id: string
    title: string
    description?: string
    priority: TaskPriority
    due_date?: string
    status: TaskStatus
    is_reminder_enabled: boolean
    created_at: string
    created_by: string
}

export interface CreateTaskDTO {
    client_id: string
    title: string
    description?: string
    priority?: TaskPriority
    due_date?: string
    status?: TaskStatus
    is_reminder_enabled?: boolean
}

export interface UpdateTaskDTO {
    title?: string
    description?: string
    priority?: TaskPriority
    due_date?: string
    status?: TaskStatus
    is_reminder_enabled?: boolean
}
