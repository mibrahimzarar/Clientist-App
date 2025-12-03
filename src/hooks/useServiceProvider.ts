import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getSPClients,
    getSPClient,
    createSPClient,
    updateSPClient,
    deleteSPClient,
    getSPJobs,
    getSPJob,
    createSPJob,
    updateSPJob,
    deleteSPJob,
    getSPJobCategories,
    createSPJobCategory,
    getSPInvoices,
    getSPInvoice,
    createSPInvoice,
    updateSPInvoice,
    deleteSPInvoice,
    getSPPayments,
    createSPPayment,
    getSPLeads,
    getSPLead,
    createSPLead,
    updateSPLead,
    deleteSPLead,
    convertSPLeadToClient,
    getSPDashboardStats,
} from '../services/serviceProviderService'
import {
    SPClient,
    SPJob,
    SPJobCategory,
    SPInvoice,
    SPInvoiceItem,
    SPPayment,
    SPLead,
    SPJobStatus,
    SPLeadStatus,
    SPInvoiceStatus,
} from '../types/serviceProvider'

// ============ CLIENTS ============

export function useSPClients() {
    return useQuery({
        queryKey: ['sp-clients'],
        queryFn: getSPClients,
    })
}

export function useSPClient(id: string) {
    return useQuery({
        queryKey: ['sp-client', id],
        queryFn: () => getSPClient(id),
        enabled: !!id,
    })
}

export function useCreateSPClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (client: Partial<SPClient>) => createSPClient(client),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sp-clients'] })
        },
    })
}

export function useUpdateSPClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<SPClient> }) =>
            updateSPClient(id, updates),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['sp-clients'] })
            queryClient.invalidateQueries({ queryKey: ['sp-client', id] })
        },
    })
}

export function useDeleteSPClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteSPClient(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sp-clients'] })
        },
    })
}

// ============ JOB CATEGORIES ============

export function useSPJobCategories() {
    return useQuery({
        queryKey: ['sp-job-categories'],
        queryFn: getSPJobCategories,
    })
}

export function useCreateSPJobCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (category: Partial<SPJobCategory>) => createSPJobCategory(category),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sp-job-categories'] })
        },
    })
}

// ============ JOBS ============

export function useSPJobs(filters?: { status?: SPJobStatus; client_id?: string }) {
    return useQuery({
        queryKey: ['sp-jobs', filters],
        queryFn: () => getSPJobs(filters),
    })
}

export function useSPJob(id: string) {
    return useQuery({
        queryKey: ['sp-job', id],
        queryFn: () => getSPJob(id),
        enabled: !!id,
    })
}

export function useCreateSPJob() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (job: Partial<SPJob>) => createSPJob(job),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sp-jobs'] })
            queryClient.invalidateQueries({ queryKey: ['sp-dashboard-stats'] })
        },
    })
}

export function useUpdateSPJob() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<SPJob> }) =>
            updateSPJob(id, updates),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['sp-jobs'] })
            queryClient.invalidateQueries({ queryKey: ['sp-job', id] })
            queryClient.invalidateQueries({ queryKey: ['sp-dashboard-stats'] })
        },
    })
}

export function useDeleteSPJob() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteSPJob(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sp-jobs'] })
            queryClient.invalidateQueries({ queryKey: ['sp-dashboard-stats'] })
        },
    })
}

// ============ INVOICES ============

export function useSPInvoices(filters?: { status?: SPInvoiceStatus; client_id?: string }) {
    return useQuery({
        queryKey: ['sp-invoices', filters],
        queryFn: () => getSPInvoices(filters),
    })
}

export function useSPInvoice(id: string) {
    return useQuery({
        queryKey: ['sp-invoice', id],
        queryFn: () => getSPInvoice(id),
        enabled: !!id,
    })
}

export function useCreateSPInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            invoice,
            items,
        }: {
            invoice: Partial<SPInvoice>
            items: Partial<SPInvoiceItem>[]
        }) => createSPInvoice(invoice, items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sp-invoices'] })
            queryClient.invalidateQueries({ queryKey: ['sp-dashboard-stats'] })
        },
    })
}

export function useUpdateSPInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, updates, items }: { id: string; updates: Partial<SPInvoice>; items?: Partial<SPInvoiceItem>[] }) =>
            updateSPInvoice(id, updates, items),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['sp-invoices'] })
            queryClient.invalidateQueries({ queryKey: ['sp-invoice', id] })
            queryClient.invalidateQueries({ queryKey: ['sp-dashboard-stats'] })
        },
    })
}

export function useDeleteSPInvoice() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteSPInvoice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sp-invoices'] })
            queryClient.invalidateQueries({ queryKey: ['sp-dashboard-stats'] })
        },
    })
}

// ============ PAYMENTS ============

export function useSPPayments(filters?: { client_id?: string; invoice_id?: string }) {
    return useQuery({
        queryKey: ['sp-payments', filters],
        queryFn: () => getSPPayments(filters),
    })
}

export function useCreateSPPayment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payment: Partial<SPPayment>) => createSPPayment(payment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sp-payments'] })
            queryClient.invalidateQueries({ queryKey: ['sp-invoices'] })
            queryClient.invalidateQueries({ queryKey: ['sp-dashboard-stats'] })
        },
    })
}

// ============ LEADS ============

export function useSPLeads(filters?: { status?: SPLeadStatus }) {
    return useQuery({
        queryKey: ['sp-leads', filters],
        queryFn: () => getSPLeads(filters),
    })
}

export function useSPLead(id: string) {
    return useQuery({
        queryKey: ['sp-lead', id],
        queryFn: () => getSPLead(id),
        enabled: !!id,
    })
}

export function useCreateSPLead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (lead: Partial<SPLead>) => createSPLead(lead),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sp-leads'] })
            queryClient.invalidateQueries({ queryKey: ['sp-dashboard-stats'] })
        },
    })
}

export function useUpdateSPLead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<SPLead> }) =>
            updateSPLead(id, updates),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['sp-leads'] })
            queryClient.invalidateQueries({ queryKey: ['sp-lead', id] })
            queryClient.invalidateQueries({ queryKey: ['sp-dashboard-stats'] })
        },
    })
}

export function useDeleteSPLead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await deleteSPLead(id)
            if (error) throw error
            return { error: null }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sp-leads'] })
            queryClient.invalidateQueries({ queryKey: ['sp-dashboard-stats'] })
        },
    })
}

export function useConvertSPLeadToClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ leadId, clientData }: { leadId: string; clientData: Partial<SPClient> }) =>
            convertSPLeadToClient(leadId, clientData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sp-leads'] })
            queryClient.invalidateQueries({ queryKey: ['sp-clients'] })
            queryClient.invalidateQueries({ queryKey: ['sp-dashboard-stats'] })
        },
    })
}

// ============ DASHBOARD STATS ============

export function useSPDashboardStats() {
    return useQuery({
        queryKey: ['sp-dashboard-stats'],
        queryFn: getSPDashboardStats,
    })
}
