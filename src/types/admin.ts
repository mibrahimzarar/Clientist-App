export type AdminUser = {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
    company_name?: string
    company_logo?: string
    role: string
    created_at: string
    last_sign_in_at?: string
    status: 'active' | 'banned'
}

export type AdminDashboardSummary = {
    total_users: number
    active_users: number
    total_revenue: number
    new_users_today: number
}

export type AdminSearchFilters = {
    search_term?: string
    status_filter?: string
    role_filter?: string
}

export type AdminApiResponse<T> = {
    data?: T
    error?: string
    success: boolean
}

export type AdminPaginatedResponse<T> = {
    data: T[]
    total: number
    page: number
    page_size: number
    total_pages: number
}
