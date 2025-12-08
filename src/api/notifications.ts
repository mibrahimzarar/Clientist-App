
import { supabase } from '../lib/supabase'

export type AppAnnouncement = {
    id: string
    title: string
    message: string
    target_audience: string
    created_at: string
    created_by: string
}

export type AnnouncementFormData = {
    title: string
    message: string
    target_audience: string
}

export type UserNotification = {
    id: string
    user_id: string
    title: string
    message: string
    type: string
    is_read: boolean
    created_at: string
    announcement_id?: string
}

export async function createAnnouncement(data: AnnouncementFormData) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Use RPC function to broadcast announcement and create notifications atomically
        const { data: result, error } = await supabase
            .rpc('broadcast_announcement', {
                p_title: data.title,
                p_message: data.message,
                p_target_audience: data.target_audience
            })

        if (error) throw error

        return { data: result, success: true }
    } catch (error) {
        return { error: (error as Error).message, success: false }
    }
}

export async function getAnnouncements() {
    try {
        const { data, error } = await supabase
            .from('app_announcements')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return { data: data as AppAnnouncement[], success: true }
    } catch (error) {
        return { error: (error as Error).message, success: false }
    }
}

export async function getUserNotifications() {
    try {
        const { data, error } = await supabase
            .from('user_notifications')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return { data: data as UserNotification[], success: true }
    } catch (error) {
        return { error: (error as Error).message, success: false }
    }
}

export async function markNotificationAsRead(id: string) {
    try {
        const { error } = await supabase
            .from('user_notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (error) throw error

        return { success: true }
    } catch (error) {
        return { error: (error as Error).message, success: false }
    }
}

export async function markAllNotificationsAsRead() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase
            .from('user_notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        if (error) throw error

        return { success: true }
    } catch (error) {
        return { error: (error as Error).message, success: false }
    }
}
