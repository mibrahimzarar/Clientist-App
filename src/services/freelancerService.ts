import { supabase } from '../lib/supabase'
import {
    FreelancerClient,
    FreelancerProject,
    FreelancerTask,
    FreelancerDocument,
    FreelancerLead,
    FreelancerMeeting,
    FreelancerReminder,
    DashboardStats,
    FreelancerInvoice,
    FreelancerInvoiceItem
} from '../types/freelancer'

export const freelancerService = {
    // Clients
    getClients: async () => {
        const { data, error } = await supabase
            .from('freelancer_clients')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as FreelancerClient[]
    },

    getClient: async (id: string) => {
        const { data, error } = await supabase
            .from('freelancer_clients')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as FreelancerClient
    },

    createClient: async (client: Partial<FreelancerClient>) => {
        const { data, error } = await supabase
            .from('freelancer_clients')
            .insert(client)
            .select()
            .single()

        if (error) throw error
        return data as FreelancerClient
    },

    updateClient: async (id: string, updates: Partial<FreelancerClient>) => {
        const { data, error } = await supabase
            .from('freelancer_clients')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as FreelancerClient
    },

    deleteClient: async (id: string) => {
        const { error } = await supabase
            .from('freelancer_clients')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    // Projects
    getProjects: async () => {
        const { data, error } = await supabase
            .from('freelancer_projects')
            .select('*, client:freelancer_clients(*)')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as FreelancerProject[]
    },

    getProject: async (id: string) => {
        const { data, error } = await supabase
            .from('freelancer_projects')
            .select('*, client:freelancer_clients(*)')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as FreelancerProject
    },

    createProject: async (project: Partial<FreelancerProject>) => {
        const { data, error } = await supabase
            .from('freelancer_projects')
            .insert(project)
            .select()
            .single()

        if (error) throw error
        return data as FreelancerProject
    },

    updateProject: async (id: string, updates: Partial<FreelancerProject>) => {
        const { data, error } = await supabase
            .from('freelancer_projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as FreelancerProject
    },

    deleteProject: async (id: string) => {
        const { error } = await supabase
            .from('freelancer_projects')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    // Tasks
    getTasks: async () => {
        const { data, error } = await supabase
            .from('freelancer_tasks')
            .select('*')
            .order('due_date', { ascending: true })

        if (error) throw error
        return data as FreelancerTask[]
    },

    createTask: async (task: Partial<FreelancerTask>) => {
        const { data, error } = await supabase
            .from('freelancer_tasks')
            .insert(task)
            .select()
            .single()

        if (error) throw error
        return data as FreelancerTask
    },

    updateTask: async (id: string, updates: Partial<FreelancerTask>) => {
        const { data, error } = await supabase
            .from('freelancer_tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as FreelancerTask
    },

    getTask: async (id: string) => {
        const { data, error } = await supabase
            .from('freelancer_tasks')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as FreelancerTask
    },

    deleteTask: async (id: string) => {
        const { error } = await supabase
            .from('freelancer_tasks')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    // Documents
    getProjectDocuments: async (projectId: string) => {
        const { data, error } = await supabase
            .from('freelancer_documents')
            .select('*')
            .eq('project_id', projectId)
            .order('uploaded_at', { ascending: false })

        if (error) throw error
        return data as FreelancerDocument[]
    },

    createDocument: async (doc: Partial<FreelancerDocument>) => {
        const { data, error } = await supabase
            .from('freelancer_documents')
            .insert(doc)
            .select()
            .single()

        if (error) throw error
        return data as FreelancerDocument
    },

    // Leads
    getLeads: async () => {
        const { data, error } = await supabase
            .from('freelancer_leads')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as FreelancerLead[]
    },

    getLead: async (id: string) => {
        const { data, error } = await supabase
            .from('freelancer_leads')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as FreelancerLead
    },

    createLead: async (lead: Partial<FreelancerLead>) => {
        const { data, error } = await supabase
            .from('freelancer_leads')
            .insert(lead)
            .select()
            .single()

        if (error) throw error
        return data as FreelancerLead
    },

    updateLead: async (id: string, updates: Partial<FreelancerLead>) => {
        const { data, error } = await supabase
            .from('freelancer_leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as FreelancerLead
    },

    deleteLead: async (id: string) => {
        const { error } = await supabase
            .from('freelancer_leads')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    // Meetings
    getMeetings: async () => {
        const { data, error } = await supabase
            .from('freelancer_meetings')
            .select('*')
            .order('start_time', { ascending: true })

        if (error) throw error
        return data as FreelancerMeeting[]
    },

    // Reminders
    getReminders: async () => {
        const { data, error } = await supabase
            .from('freelancer_reminders')
            .select('*')
            .order('due_date', { ascending: true })

        if (error) throw error
        return data as FreelancerReminder[]
    },

    // Dashboard Stats
    getStats: async (): Promise<DashboardStats> => {
        const [
            { count: totalClients },
            { count: activeProjects },
            { count: completedProjects },
            { count: leadsFollowup },
            { count: overdueTasks }
        ] = await Promise.all([
            supabase.from('freelancer_clients').select('*', { count: 'exact', head: true }),
            supabase.from('freelancer_projects').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
            supabase.from('freelancer_projects').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
            supabase.from('freelancer_leads').select('*', { count: 'exact', head: true }).not('next_follow_up', 'is', null),
            supabase.from('freelancer_tasks').select('*', { count: 'exact', head: true }).lt('due_date', new Date().toISOString()).neq('status', 'done')
        ])

        return {
            total_clients: totalClients || 0,
            active_projects: activeProjects || 0,
            completed_projects: completedProjects || 0,
            monthly_earnings: 0,
            overdue_payments_count: 0,
            leads_requiring_followup: leadsFollowup || 0,
            projects_awaiting_feedback: 0,
            overdue_tasks_count: overdueTasks || 0
        }
    },

    // Invoices
    getInvoices: async () => {
        const { data, error } = await supabase
            .from('freelancer_invoices')
            .select('*, client:freelancer_clients(*), project:freelancer_projects(*)')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as FreelancerInvoice[]
    },

    getInvoice: async (id: string) => {
        const { data, error } = await supabase
            .from('freelancer_invoices')
            .select('*, client:freelancer_clients(*), project:freelancer_projects(*), items:freelancer_invoice_items(*)')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as FreelancerInvoice
    },

    createInvoice: async (invoice: Partial<FreelancerInvoice>, items: Partial<FreelancerInvoiceItem>[]) => {
        console.log('=== CREATING INVOICE ===')
        console.log('Invoice object:', invoice)
        console.log('Project ID:', invoice.project_id)
        
        const { data: invoiceData, error: invoiceError } = await supabase
            .from('freelancer_invoices')
            .insert(invoice)
            .select()
            .single()

        if (invoiceError) throw invoiceError

        if (items.length > 0) {
            const itemsWithInvoiceId = items.map(item => ({
                ...item,
                invoice_id: invoiceData.id
            }))

            const { error: itemsError } = await supabase
                .from('freelancer_invoice_items')
                .insert(itemsWithInvoiceId)

            if (itemsError) throw itemsError
        }

        return invoiceData as FreelancerInvoice
    },

    updateInvoice: async (id: string, updates: Partial<FreelancerInvoice>, items?: Partial<FreelancerInvoiceItem>[]) => {
        const { data: invoiceData, error: invoiceError } = await supabase
            .from('freelancer_invoices')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (invoiceError) throw invoiceError

        if (items) {
            // Delete existing items
            const { error: deleteError } = await supabase
                .from('freelancer_invoice_items')
                .delete()
                .eq('invoice_id', id)

            if (deleteError) throw deleteError

            // Insert new items
            if (items.length > 0) {
                const itemsWithInvoiceId = items.map(item => ({
                    ...item,
                    invoice_id: id
                }))

                const { error: itemsError } = await supabase
                    .from('freelancer_invoice_items')
                    .insert(itemsWithInvoiceId)

                if (itemsError) throw itemsError
            }
        }

        return invoiceData as FreelancerInvoice
    },

    deleteInvoice: async (id: string) => {
        const { error } = await supabase
            .from('freelancer_invoices')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    uploadImage: async (uri: string, bucket: string = 'avatars') => {
        try {
            // Use decode to convert base64
            const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`

            // Read as base64
            const response = await fetch(uri)
            const arrayBuffer = await response.arrayBuffer()
            const uint8Array = new Uint8Array(arrayBuffer)

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filename, uint8Array, {
                    contentType: 'image/jpeg',
                    upsert: false
                })

            if (error) throw error

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filename)

            return publicUrl
        } catch (error) {
            console.error('Error uploading image:', error)
            throw error
        }
    }
}
