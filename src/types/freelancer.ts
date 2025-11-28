// Freelancer Management System Types

export type FreelancerClientStatus = 'active' | 'inactive' | 'archived' | 'lead'
export type ProjectStatus = 'draft' | 'in_progress' | 'pending_feedback' | 'revision' | 'completed' | 'delivered' | 'closed'
export type FreelancerProjectStatus = ProjectStatus
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type LeadStatus = 'potential' | 'call_later' | 'hot' | 'cold' | 'converted'
export type MeetingType = 'client_meeting' | 'internal' | 'review' | 'kickoff'
export type ReminderType = 'follow_up' | 'contract_expiry' | 'payment' | 'automation_ping' | 'custom'

export type FreelancerClient = {
    id: string
    full_name: string
    company_name?: string
    role?: string
    email?: string
    phone_number?: string
    whatsapp?: string
    country?: string
    timezone?: string
    tags?: string[] // VIP, High-value, etc.
    notes?: string
    status: FreelancerClientStatus
    profile_picture_url?: string
    created_at: string
    updated_at: string
    created_by?: string
}

export type FreelancerProject = {
    id: string
    client_id: string
    title: string
    description?: string
    project_type: string // Logo Design, Web Dev, etc.
    category?: string
    tags?: string[]
    status: ProjectStatus
    priority: ProjectPriority
    start_date?: string
    deadline?: string
    expected_delivery_date?: string
    budget?: number
    currency?: string
    total_revisions_allowed?: number
    revisions_used?: number
    created_at: string
    updated_at: string
    client?: FreelancerClient // Joined data
}

export type FreelancerTask = {
    id: string
    project_id: string
    title: string
    description?: string
    status: TaskStatus
    priority: ProjectPriority
    due_date?: string
    estimated_hours?: number
    actual_hours?: number
    assigned_to?: string
    created_at: string
    updated_at: string
}

export type FreelancerInvoice = {
    id: string
    project_id?: string
    client_id: string
    invoice_number: string
    issue_date: string
    due_date: string
    status: InvoiceStatus
    currency: string
    subtotal: number
    tax_amount?: number
    discount_amount?: number
    total_amount: number
    notes?: string
    pdf_url?: string
    created_at: string
    updated_at: string
    client?: FreelancerClient
    project?: FreelancerProject
    items?: FreelancerInvoiceItem[]
}

export type FreelancerInvoiceItem = {
    id: string
    invoice_id: string
    description: string
    quantity: number
    unit_price: number
    amount: number
    created_at: string
    updated_at: string
}

export type FreelancerLead = {
    id: string
    full_name: string
    company?: string
    email?: string
    phone?: string
    source?: string
    status: LeadStatus
    notes?: string
    next_follow_up?: string
    converted_client_id?: string
    created_at: string
    updated_at: string
}

export type FreelancerMeeting = {
    id: string
    title: string
    description?: string
    start_time: string
    end_time: string
    client_id?: string
    project_id?: string
    type: MeetingType
    location?: string
    meeting_link?: string
    created_at: string
    updated_at: string
    client?: FreelancerClient
}

export type FreelancerReminder = {
    id: string
    title: string
    description?: string
    due_date: string
    type: ReminderType
    priority: 'low' | 'medium' | 'high'
    is_completed: boolean
    client_id?: string
    project_id?: string
    created_at: string
    updated_at: string
    client?: FreelancerClient
}

export type FreelancerDocument = {
    id: string
    project_id: string
    name: string
    url: string
    type: string
    size_bytes?: number
    uploaded_at: string
    uploaded_by?: string
}

export type DashboardStats = {
    total_clients: number
    active_projects: number
    completed_projects: number
    monthly_earnings: number
    overdue_payments_count: number
    leads_requiring_followup: number
    projects_awaiting_feedback: number
    overdue_tasks_count: number
}
