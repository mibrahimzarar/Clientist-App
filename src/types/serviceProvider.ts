// Service Provider Management System Types

export type SPClientStatus = 'active' | 'inactive' | 'blocked'
export type SPJobStatus = 'in_progress' | 'completed' | 'pending_payment' | 'cancelled'
export type SPJobPriority = 'low' | 'normal' | 'high' | 'urgent'
export type SPInvoiceStatus = 'unpaid' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'
export type SPLeadStatus = 'new_lead' | 'call_later' | 'hot_lead' | 'price_requested' | 'closed_converted' | 'lost'
export type SPPaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'upi' | 'other'
export type SPPaymentStatus = 'received' | 'pending' | 'failed'
export type SPAttachmentType = 'invoice' | 'warranty' | 'quote' | 'before_image' | 'after_image' | 'other'
export type SPItemType = 'service' | 'part' | 'labor' | 'other'
export type SPLeadSource = 'phone_call' | 'whatsapp' | 'referral' | 'website' | 'other'

// Service Provider Client
export type SPClient = {
    id: string
    created_by: string
    full_name: string
    phone_number?: string
    whatsapp?: string
    email?: string
    address?: string
    gps_coordinates?: string
    profile_picture_url?: string
    tags?: string[] // Regular Customer, Urgent, Outstanding Payment, Difficult, VIP
    notes?: string
    is_vip: boolean
    total_jobs_completed: number
    total_spent: number
    outstanding_balance: number
    last_service_date?: string
    next_follow_up_date?: string
    status: SPClientStatus
    created_at: string
    updated_at: string
}

// Job Category
export type SPJobCategory = {
    id: string
    created_by: string
    name: string
    description?: string
    icon?: string
    color?: string
    created_at: string
}

// Job / Work Order
export type SPJob = {
    id: string
    created_by: string
    client_id: string
    category_id?: string
    title: string
    description?: string
    location_address?: string
    status: SPJobStatus
    priority: SPJobPriority
    job_price?: number
    parts_cost: number
    labor_cost: number
    total_cost?: number
    scheduled_date?: string
    start_time?: string
    end_time?: string
    time_spent_minutes?: number
    technician_notes?: string
    items_required?: string[]
    before_images?: string[]
    after_images?: string[]
    is_urgent: boolean
    is_repeat_service: boolean
    repeat_interval_months?: number
    next_service_due?: string
    created_at: string
    updated_at: string
    client?: SPClient
    category?: SPJobCategory
}

// Job Attachment
export type SPJobAttachment = {
    id: string
    job_id: string
    file_name: string
    file_path: string
    file_type?: string
    file_size?: number
    attachment_type: SPAttachmentType
    created_at: string
}

// Invoice
export type SPInvoice = {
    id: string
    created_by: string
    client_id: string
    job_id?: string
    invoice_number: string
    invoice_date: string
    due_date?: string
    status: SPInvoiceStatus
    subtotal: number
    tax_amount: number
    discount_amount: number
    total_amount: number
    amount_paid: number
    amount_due?: number
    notes?: string
    pdf_path?: string
    created_at: string
    updated_at: string
    client?: SPClient
    job?: SPJob
    items?: SPInvoiceItem[]
}

// Invoice Line Item
export type SPInvoiceItem = {
    id: string
    invoice_id: string
    description: string
    quantity: number
    unit_price: number
    amount: number
    item_type?: SPItemType
    created_at: string
}

// Payment
export type SPPayment = {
    id: string
    created_by: string
    client_id: string
    invoice_id?: string
    job_id?: string
    amount: number
    payment_date: string
    payment_method: SPPaymentMethod
    payment_status: SPPaymentStatus
    notes?: string
    receipt_path?: string
    created_at: string
    client?: SPClient
    invoice?: SPInvoice
}

// Lead
export type SPLead = {
    id: string
    created_by: string
    full_name: string
    phone?: string
    whatsapp?: string
    email?: string
    service_interested?: string
    source?: SPLeadSource
    status: SPLeadStatus
    notes?: string
    expected_value?: number
    next_follow_up?: string
    converted_client_id?: string
    conversion_date?: string
    created_at: string
    updated_at: string
}

// Repeat Service Template
export type SPRepeatService = {
    id: string
    created_by: string
    client_id: string
    service_name: string
    category_id?: string
    interval_months: number
    last_service_date?: string
    next_due_date?: string
    is_active: boolean
    auto_reminder: boolean
    standard_price?: number
    notes?: string
    created_at: string
    updated_at: string
    client?: SPClient
    category?: SPJobCategory
}

// Dashboard Statistics
export type SPDashboardStats = {
    total_clients: number
    active_clients: number
    jobs_today: number
    jobs_this_week: number
    jobs_this_month: number
    total_jobs_completed: number
    jobs_in_progress: number
    pending_payment_jobs: number
    monthly_earnings: number
    total_earnings: number
    outstanding_payments: number
    outstanding_payments_count: number
    new_leads: number
    hot_leads: number
    repeat_services_due: number
    overdue_invoices_count: number
    urgent_jobs_count: number
}

// Job with related data for detailed view
export type SPJobWithRelations = SPJob & {
    client: SPClient
    category?: SPJobCategory
    attachments?: SPJobAttachment[]
    invoice?: SPInvoice
}

// Invoice with related data
export type SPInvoiceWithRelations = SPInvoice & {
    client: SPClient
    job?: SPJob
    items: SPInvoiceItem[]
    payments?: SPPayment[]
}

// Client with statistics
export type SPClientWithStats = SPClient & {
    jobs?: SPJob[]
    invoices?: SPInvoice[]
    payments?: SPPayment[]
    repeat_services?: SPRepeatService[]
}
