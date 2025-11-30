import { supabase } from '../lib/supabase'
import {
    SPClient,
    SPJob,
    SPJobCategory,
    SPInvoice,
    SPInvoiceItem,
    SPPayment,
    SPLead,
    SPRepeatService,
    SPDashboardStats,
    SPJobStatus,
    SPLeadStatus,
    SPInvoiceStatus,
} from '../types/serviceProvider'

// ============ CLIENTS ============

export async function getSPClients() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('sp_clients')
            .select('*')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data: data as SPClient[], error: null }
    } catch (error) {
        console.error('Error fetching SP clients:', error)
        return { data: null, error }
    }
}

export async function getSPClient(id: string) {
    try {
        const { data, error } = await supabase
            .from('sp_clients')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return { data: data as SPClient, error: null }
    } catch (error) {
        console.error('Error fetching SP client:', error)
        return { data: null, error }
    }
}

export async function createSPClient(client: Partial<SPClient>) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('sp_clients')
            .insert({ ...client, created_by: user.id })
            .select()
            .single()

        if (error) throw error
        return { data: data as SPClient, error: null }
    } catch (error) {
        console.error('Error creating SP client:', error)
        return { data: null, error }
    }
}

export async function updateSPClient(id: string, updates: Partial<SPClient>) {
    try {
        const { data, error } = await supabase
            .from('sp_clients')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return { data: data as SPClient, error: null }
    } catch (error) {
        console.error('Error updating SP client:', error)
        return { data: null, error }
    }
}

export async function deleteSPClient(id: string) {
    try {
        const { error } = await supabase
            .from('sp_clients')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Error deleting SP client:', error)
        return { error }
    }
}

// ============ JOB CATEGORIES ============

export async function getSPJobCategories() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('sp_job_categories')
            .select('*')
            .eq('created_by', user.id)
            .order('name')

        if (error) throw error
        return { data: data as SPJobCategory[], error: null }
    } catch (error) {
        console.error('Error fetching job categories:', error)
        return { data: null, error }
    }
}

export async function createSPJobCategory(category: Partial<SPJobCategory>) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('sp_job_categories')
            .insert({ ...category, created_by: user.id })
            .select()
            .single()

        if (error) throw error
        return { data: data as SPJobCategory, error: null }
    } catch (error) {
        console.error('Error creating job category:', error)
        return { data: null, error }
    }
}

// ============ JOBS ============

export async function getSPJobs(filters?: { status?: SPJobStatus; client_id?: string }) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        let query = supabase
            .from('sp_jobs')
            .select(`
                *,
                client:sp_clients(*),
                category:sp_job_categories(*)
            `)
            .eq('created_by', user.id)

        if (filters?.status) {
            query = query.eq('status', filters.status)
        }

        if (filters?.client_id) {
            query = query.eq('client_id', filters.client_id)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        return { data: data as SPJob[], error: null }
    } catch (error) {
        console.error('Error fetching SP jobs:', error)
        return { data: null, error }
    }
}

export async function getSPJob(id: string) {
    try {
        const { data, error } = await supabase
            .from('sp_jobs')
            .select(`
                *,
                client:sp_clients(*),
                category:sp_job_categories(*)
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        return { data: data as SPJob, error: null }
    } catch (error) {
        console.error('Error fetching SP job:', error)
        return { data: null, error }
    }
}

export async function createSPJob(job: Partial<SPJob>) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('sp_jobs')
            .insert({ ...job, created_by: user.id })
            .select(`
                *,
                client:sp_clients(*),
                category:sp_job_categories(*)
            `)
            .single()

        if (error) throw error
        return { data: data as SPJob, error: null }
    } catch (error) {
        console.error('Error creating SP job:', error)
        return { data: null, error }
    }
}

export async function updateSPJob(id: string, updates: Partial<SPJob>) {
    try {
        const { data, error } = await supabase
            .from('sp_jobs')
            .update(updates)
            .eq('id', id)
            .select(`
                *,
                client:sp_clients(*),
                category:sp_job_categories(*)
            `)
            .single()

        if (error) throw error
        return { data: data as SPJob, error: null }
    } catch (error) {
        console.error('Error updating SP job:', error)
        return { data: null, error }
    }
}

export async function deleteSPJob(id: string) {
    try {
        const { error } = await supabase
            .from('sp_jobs')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Error deleting SP job:', error)
        return { error }
    }
}

// ============ INVOICES ============

export async function getSPInvoices(filters?: { status?: SPInvoiceStatus; client_id?: string }) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        let query = supabase
            .from('sp_invoices')
            .select(`
                *,
                client:sp_clients(*),
                job:sp_jobs(*),
                items:sp_invoice_items(*)
            `)
            .eq('created_by', user.id)

        if (filters?.status) {
            query = query.eq('status', filters.status)
        }

        if (filters?.client_id) {
            query = query.eq('client_id', filters.client_id)
        }

        const { data, error } = await query.order('invoice_date', { ascending: false })

        if (error) throw error
        return { data: data as SPInvoice[], error: null }
    } catch (error) {
        console.error('Error fetching SP invoices:', error)
        return { data: null, error }
    }
}

export async function getSPInvoice(id: string) {
    try {
        const { data, error } = await supabase
            .from('sp_invoices')
            .select(`
                *,
                client:sp_clients(*),
                job:sp_jobs(*),
                items:sp_invoice_items(*)
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        return { data: data as SPInvoice, error: null }
    } catch (error) {
        console.error('Error fetching SP invoice:', error)
        return { data: null, error }
    }
}

export async function createSPInvoice(invoice: Partial<SPInvoice>, items: Partial<SPInvoiceItem>[]) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}`

        // Create invoice
        const { data: invoiceData, error: invoiceError } = await supabase
            .from('sp_invoices')
            .insert({ 
                ...invoice, 
                invoice_number: invoiceNumber,
                created_by: user.id 
            })
            .select()
            .single()

        if (invoiceError) throw invoiceError

        // Create invoice items
        const itemsWithInvoiceId = items.map(item => ({
            ...item,
            invoice_id: invoiceData.id
        }))

        const { error: itemsError } = await supabase
            .from('sp_invoice_items')
            .insert(itemsWithInvoiceId)

        if (itemsError) throw itemsError

        return { data: invoiceData as SPInvoice, error: null }
    } catch (error) {
        console.error('Error creating SP invoice:', error)
        return { data: null, error }
    }
}

export async function updateSPInvoice(id: string, updates: Partial<SPInvoice>, items?: Partial<SPInvoiceItem>[]) {
    try {
        // Update invoice
        const { data, error } = await supabase
            .from('sp_invoices')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        // Update invoice items if provided
        if (items) {
            // Delete existing items
            await supabase
                .from('sp_invoice_items')
                .delete()
                .eq('invoice_id', id)

            // Insert new items
            const itemsWithInvoiceId = items.map(item => ({
                ...item,
                invoice_id: id
            }))

            const { error: itemsError } = await supabase
                .from('sp_invoice_items')
                .insert(itemsWithInvoiceId)

            if (itemsError) throw itemsError
        }

        return { data: data as SPInvoice, error: null }
    } catch (error) {
        console.error('Error updating SP invoice:', error)
        return { data: null, error }
    }
}

export async function deleteSPInvoice(id: string) {
    try {
        const { error } = await supabase
            .from('sp_invoices')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Error deleting SP invoice:', error)
        return { error }
    }
}

// ============ PAYMENTS ============

export async function getSPPayments(filters?: { client_id?: string; invoice_id?: string }) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        let query = supabase
            .from('sp_payments')
            .select(`
                *,
                client:sp_clients(*),
                invoice:sp_invoices(*)
            `)
            .eq('created_by', user.id)

        if (filters?.client_id) {
            query = query.eq('client_id', filters.client_id)
        }

        if (filters?.invoice_id) {
            query = query.eq('invoice_id', filters.invoice_id)
        }

        const { data, error } = await query.order('payment_date', { ascending: false })

        if (error) throw error
        return { data: data as SPPayment[], error: null }
    } catch (error) {
        console.error('Error fetching SP payments:', error)
        return { data: null, error }
    }
}

export async function createSPPayment(payment: Partial<SPPayment>) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('sp_payments')
            .insert({ ...payment, created_by: user.id })
            .select(`
                *,
                client:sp_clients(*),
                invoice:sp_invoices(*)
            `)
            .single()

        if (error) throw error

        // Update invoice if payment is linked to one
        if (payment.invoice_id && data) {
            await updateInvoicePaymentStatus(payment.invoice_id, payment.amount)
        }

        return { data: data as SPPayment, error: null }
    } catch (error) {
        console.error('Error creating SP payment:', error)
        return { data: null, error }
    }
}

async function updateInvoicePaymentStatus(invoiceId: string, paymentAmount?: number) {
    const { data: invoice } = await supabase
        .from('sp_invoices')
        .select('total_amount, amount_paid')
        .eq('id', invoiceId)
        .single()

    if (invoice) {
        const newAmountPaid = (invoice.amount_paid || 0) + (paymentAmount || 0)
        const newAmountDue = invoice.total_amount - newAmountPaid

        let status: SPInvoiceStatus = 'unpaid'
        if (newAmountPaid >= invoice.total_amount) {
            status = 'paid'
        } else if (newAmountPaid > 0) {
            status = 'partially_paid'
        }

        await supabase
            .from('sp_invoices')
            .update({
                amount_paid: newAmountPaid,
                amount_due: newAmountDue,
                status
            })
            .eq('id', invoiceId)
    }
}

// ============ LEADS ============

export async function getSPLeads(filters?: { status?: SPLeadStatus }) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        let query = supabase
            .from('sp_leads')
            .select('*')
            .eq('created_by', user.id)

        if (filters?.status) {
            query = query.eq('status', filters.status)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        return { data: data as SPLead[], error: null }
    } catch (error) {
        console.error('Error fetching SP leads:', error)
        return { data: null, error }
    }
}

export async function createSPLead(lead: Partial<SPLead>) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('sp_leads')
            .insert({ ...lead, created_by: user.id })
            .select()
            .single()

        if (error) throw error
        return { data: data as SPLead, error: null }
    } catch (error) {
        console.error('Error creating SP lead:', error)
        return { data: null, error }
    }
}

export async function updateSPLead(id: string, updates: Partial<SPLead>) {
    try {
        const { data, error } = await supabase
            .from('sp_leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return { data: data as SPLead, error: null }
    } catch (error) {
        console.error('Error updating SP lead:', error)
        return { data: null, error }
    }
}

export async function convertSPLeadToClient(leadId: string, clientData: Partial<SPClient>) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Create client
        const { data: client, error: clientError } = await createSPClient(clientData)
        if (clientError || !client) throw clientError

        // Update lead
        await updateSPLead(leadId, {
            status: 'closed_converted',
            converted_client_id: client.id,
            conversion_date: new Date().toISOString()
        })

        return { data: client, error: null }
    } catch (error) {
        console.error('Error converting lead to client:', error)
        return { data: null, error }
    }
}

// ============ DASHBOARD STATS ============

export async function getSPDashboardStats(): Promise<{ data: SPDashboardStats | null; error: any }> {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString()
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString()

        // Fetch all data in parallel
        const [
            { data: clients },
            { data: allJobs },
            { data: invoices },
            { data: leads }
        ] = await Promise.all([
            supabase.from('sp_clients').select('*').eq('created_by', user.id),
            supabase.from('sp_jobs').select('*').eq('created_by', user.id),
            supabase.from('sp_invoices').select('*').eq('created_by', user.id),
            supabase.from('sp_leads').select('*').eq('created_by', user.id)
        ])

        const stats: SPDashboardStats = {
            total_clients: clients?.length || 0,
            active_clients: clients?.filter(c => c.status === 'active').length || 0,
            jobs_today: allJobs?.filter(j => j.created_at >= startOfDay).length || 0,
            jobs_this_week: allJobs?.filter(j => j.created_at >= startOfWeek).length || 0,
            jobs_this_month: allJobs?.filter(j => j.created_at >= startOfMonth).length || 0,
            total_jobs_completed: allJobs?.filter(j => j.status === 'completed').length || 0,
            jobs_in_progress: allJobs?.filter(j => j.status === 'in_progress').length || 0,
            pending_payment_jobs: allJobs?.filter(j => j.status === 'pending_payment').length || 0,
            monthly_earnings: invoices
                ?.filter(i => i.invoice_date >= startOfMonth && i.status === 'paid')
                .reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0,
            total_earnings: invoices
                ?.filter(i => i.status === 'paid')
                .reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0,
            outstanding_payments: invoices
                ?.filter(i => i.status !== 'paid' && i.status !== 'cancelled')
                .reduce((sum, i) => sum + (i.amount_due || i.total_amount || 0), 0) || 0,
            outstanding_payments_count: invoices
                ?.filter(i => i.status !== 'paid' && i.status !== 'cancelled').length || 0,
            new_leads: leads?.filter(l => l.status === 'new_lead').length || 0,
            hot_leads: leads?.filter(l => l.status === 'hot_lead').length || 0,
            repeat_services_due: 0, // Will be calculated from repeat services
            overdue_invoices_count: invoices
                ?.filter(i => i.status === 'overdue').length || 0,
        }

        return { data: stats, error: null }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return { data: null, error }
    }
}
