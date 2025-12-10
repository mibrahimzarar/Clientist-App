// Travel Agent Management System Types

// Enum types matching the database schema
export type ClientStatus = 'in_progress' | 'rejected' | 'completed'
export type PackageType = 'umrah_package' | 'tourist_visa' | 'ticketing' | 'visit_visa'
export type LeadSource = 'facebook' | 'referral' | 'walk_in' | 'whatsapp' | 'instagram' | 'website' | 'google' | 'other'
export type LeadStatus = 'potential' | 'call_later' | 'interested' | 'not_interested' | 'converted'
export type PriorityTag = 'normal' | 'priority' | 'urgent' | 'vip'
export type ReminderType = 'follow_up' | 'payment' | 'document_submission' | 'travel_date' | 'visa_expiry'
export type FileType = 'passport_scan' | 'visa_scan' | 'payment_receipt' | 'ticket_pdf' | 'hotel_confirmation' | 'cnic_scan' | 'other'

// Main Client type matching the database schema
export type TravelClient = {
  id: string
  full_name: string
  phone_number: string
  email?: string
  country: string
  package_type: PackageType
  lead_source: LeadSource
  status: ClientStatus
  priority_tag: PriorityTag
  profile_picture_url?: string
  passport_image_url?: string
  notes?: string
  is_visa_issued?: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string

  // Related data (optional for joins)
  travel_information?: TravelInformation
  visa_applications?: VisaApplication[]
  reminders?: TravelReminder[]
  payments?: Payment[]
  client_files?: ClientFile[]
  follow_ups?: FollowUp[]
  earnings?: ClientEarning[]
  client_earnings?: ClientEarning[]
}

// Travel Information type
export type TravelInformation = {
  id: string
  client_id: string
  departure_date?: string
  return_date?: string
  airline?: string
  pnr_number?: string
  hotel_name?: string
  hotel_address?: string
  room_type?: string
  transport_type?: string
  created_at: string
  updated_at: string
}

// Visa Application type
export type VisaApplication = {
  id: string
  client_id: string
  visa_type: string
  application_date?: string
  submission_date?: string
  approval_date?: string
  rejection_date?: string
  rejection_reason?: string
  visa_number?: string
  expiry_date?: string
  status: ClientStatus
  notes?: string
  created_at: string
  updated_at: string
}

// Reminder type (extends the base Reminder)
export type TravelReminder = {
  id: string
  client_id: string
  title: string
  description?: string
  reminder_type: ReminderType
  due_date: string
  is_completed: boolean
  completed_at?: string
  created_at: string
  updated_at: string
}

// Payment type
export type Payment = {
  id: string
  client_id: string
  amount: number
  payment_date: string
  payment_method?: string
  reference_number?: string
  status: string
  notes?: string
  receipt_url?: string
  created_at: string
  updated_at: string
}

// Client File type
export type ClientFile = {
  id: string
  client_id: string
  file_name: string
  file_type: FileType
  file_url: string
  file_size?: number
  mime_type?: string
  uploaded_by?: string
  created_at: string
}

// Follow Up type
export type FollowUp = {
  id: string
  client_id: string
  follow_up_date: string
  follow_up_type?: string
  notes?: string
  status: string
  created_at: string
  updated_at: string
}

// Client Earnings type
export type ClientEarning = {
  id: string
  user_id: string
  client_id: string
  amount: number
  currency: string
  description?: string
  earned_date: string
  notes?: string
  created_at: string
  updated_at: string
}

// Dashboard Analytics Types
export type DashboardSummary = {
  total_clients: number
  new_clients: number
  in_process_clients: number
  completed_clients: number
  urgent_tasks: number
  upcoming_travels: number
  pending_payments: number
}

export type ClientAnalytics = {
  status: ClientStatus
  package_type: PackageType
  priority_tag: PriorityTag
  lead_source: LeadSource
  client_count: number
  recent_clients: number
  successful_clients: number
}

export type UpcomingTravel = {
  client_id: string
  full_name: string
  phone_number: string
  email?: string
  client_status: ClientStatus
  departure_date?: string
  return_date?: string
  airline?: string
  pnr_number?: string
  hotel_name?: string
  departure_city?: string
  destination_city?: string
  travel_urgency: 'today' | 'tomorrow' | 'this_week' | 'this_month' | 'later'
}

export type PendingTask = {
  id: string
  client_id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string
  status: 'pending' | 'in_progress' | 'completed'
  is_reminder_enabled: boolean
  created_at: string
  created_by: string
  full_name: string
  phone_number: string
  email?: string
}

export type PaymentSummary = {
  client_id: string
  full_name: string
  package_type: PackageType
  total_payments: number
  total_amount: number
  pending_payments: number
  completed_payments: number
  last_payment_date?: string
}

// Search and Filter Types
export type SearchFilters = {
  search_term?: string
  status_filter?: ClientStatus
  package_filter?: PackageType
  priority_filter?: PriorityTag
  user_id?: string
}

// Form Types for creating/updating data
export type ClientFormData = {
  full_name: string
  phone_number: string
  email?: string
  country: string
  package_type: PackageType
  lead_source: LeadSource
  status?: ClientStatus
  priority_tag?: PriorityTag
  notes?: string
}

export type TravelFormData = {
  departure_date?: string
  return_date?: string
  airline?: string
  pnr_number?: string
  hotel_name?: string
  hotel_address?: string
  room_type?: string
  transport_type?: string
}

export type VisaFormData = {
  visa_type: string
  application_date?: string
  submission_date?: string
  approval_date?: string
  rejection_date?: string
  rejection_reason?: string
  visa_number?: string
  expiry_date?: string
  status?: ClientStatus
  notes?: string
}

export type ReminderFormData = {
  title: string
  description?: string
  reminder_type: ReminderType
  due_date: string
}

export type PaymentFormData = {
  amount: number
  payment_date: string
  payment_method?: string
  reference_number?: string
  status?: string
  notes?: string
}

export type EarningFormData = {
  amount: number
  currency?: string
  description?: string
  earned_date?: string
  notes?: string
}

// API Response Types
export type ApiResponse<T> = {
  data?: T
  error?: string
  success: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// File Upload Types
export type FileUploadResponse = {
  file_url: string
  file_name: string
  file_size: number
  mime_type: string
}

// Notification Types
export type NotificationData = {
  title: string
  message: string
  type: 'reminder' | 'payment' | 'visa' | 'travel'
  client_id?: string
  reminder_id?: string
  due_date?: string
}

// Client Note type
export type ClientNote = {
  id: string
  client_id: string
  content: string
  type: 'note' | 'status_change' | 'creation' | 'follow_up' | 'system'
  is_pinned: boolean
  created_at: string
  created_by?: string
}

// Lead Management Types
export type Lead = {
  id: string
  full_name: string
  phone_number: string
  email?: string
  country?: string
  lead_status: LeadStatus
  lead_source: LeadSource
  follow_up_date?: string
  notes?: string
  tags?: string[]
  priority_tag: PriorityTag
  interested_package?: PackageType
  profile_picture_url?: string
  converted_client_id?: string
  converted_at?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export type LeadNote = {
  id: string
  lead_id: string
  content: string
  type: string
  created_at: string
  created_by?: string
}

export type LeadFormData = {
  full_name: string
  phone_number: string
  email?: string
  country?: string
  lead_status?: LeadStatus
  lead_source: LeadSource
  follow_up_date?: string
  notes?: string
  tags?: string[]
  priority_tag?: PriorityTag
  interested_package?: PackageType
}

export type LeadStatistics = {
  total_leads: number
  potential_leads: number
  interested_leads: number
  converted_leads: number
  todays_followups: number
  overdue_followups: number
}

export type TodaysFollowUp = {
  id: string
  full_name: string
  phone_number: string
  email?: string
  lead_status: LeadStatus
  lead_source: LeadSource
  follow_up_date: string
  notes?: string
  tags?: string[]
  priority_tag: PriorityTag
  interested_package?: PackageType
  created_by?: string
}

export type UpcomingFollowUp = TodaysFollowUp & {
  urgency: 'today' | 'tomorrow' | 'this_week' | 'later'
}