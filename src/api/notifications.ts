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

export async function createAnnouncement(data: AnnouncementFormData) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data: announcement, error } = await supabase
            .from('app_announcements')
            .insert([{
                ...data,
                created_by: user.id
            }])
            .select()
            .single()

        if (error) throw error

        return { data: announcement, success: true }
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
