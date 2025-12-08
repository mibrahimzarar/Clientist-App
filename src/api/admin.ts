import { supabase } from '../lib/supabase'
import {
    AdminUser,
    AdminDashboardSummary,
    AdminSearchFilters,
    AdminApiResponse,
    AdminPaginatedResponse
} from '../types/admin'

export async function getAdminDashboardSummary(): Promise<AdminApiResponse<AdminDashboardSummary>> {
    try {
        const { data, error } = await supabase
            .rpc('get_admin_dashboard_summary')
            .single()

        if (error) throw error

        return {
            data: data as AdminDashboardSummary,
            success: true
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch dashboard summary',
            success: false
        }
    }
}

export async function getUsers(
    page: number = 1,
    pageSize: number = 20,
    filters?: AdminSearchFilters
): Promise<AdminApiResponse<AdminPaginatedResponse<AdminUser>>> {
    try {
        let query = supabase
            .from('profiles')
            .select('*', { count: 'exact' })

        if (filters?.search_term) {
            query = query.or(`full_name.ilike.%${filters.search_term}%,email.ilike.%${filters.search_term}%`)
        }
        if (filters?.status_filter) {
            query = query.eq('status', filters.status_filter)
        }
        if (filters?.role_filter) {
            query = query.eq('role', filters.role_filter)
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1)

        if (error) throw error

        return {
            data: {
                data: data as AdminUser[] || [],
                total: count || 0,
                page,
                page_size: pageSize,
                total_pages: Math.ceil((count || 0) / pageSize)
            },
            success: true
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to fetch users',
            success: false
        }
    }
}

export async function updateUserStatus(userId: string, status: 'active' | 'banned'): Promise<AdminApiResponse<AdminUser>> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ status })
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error

        return {
            data: data as AdminUser,
            success: true
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Failed to update user status',
            success: false
        }
    }
}
