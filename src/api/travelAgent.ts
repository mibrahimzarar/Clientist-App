// Travel Agent API functions using Supabase
import { supabase } from '../lib/supabase'
import {
  TravelClient,
  TravelInformation,
  VisaApplication,
  TravelReminder,
  Payment,
  ClientFile,
  FollowUp,
  DashboardSummary,
  ClientAnalytics,
  UpcomingTravel,
  PendingTask,
  PaymentSummary,
  SearchFilters,
  ClientFormData,
  TravelFormData,
  VisaFormData,
  ReminderFormData,
  PaymentFormData,
  FileUploadResponse,
  ApiResponse,
  PaginatedResponse
} from '../types/travelAgent'

// ========== CLIENT OPERATIONS ==========

// Get all clients with pagination and filters
export async function getClients(
  page: number = 1,
  pageSize: number = 20,
  filters?: SearchFilters
): Promise<ApiResponse<PaginatedResponse<TravelClient>>> {
  try {
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters?.search_term) {
      query = query.or(`full_name.ilike.%${filters.search_term}%,phone_number.ilike.%${filters.search_term}%,email.ilike.%${filters.search_term}%,country.ilike.%${filters.search_term}%`)
    }
    if (filters?.status_filter) {
      query = query.eq('status', filters.status_filter)
    }
    if (filters?.package_filter) {
      query = query.eq('package_type', filters.package_filter)
    }
    if (filters?.priority_filter) {
      query = query.eq('priority_tag', filters.priority_filter)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) throw error

    return {
      data: {
        data: data || [],
        total: count || 0,
        page,
        page_size: pageSize,
        total_pages: Math.ceil((count || 0) / pageSize)
      },
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch clients',
      success: false
    }
  }
}

// Get single client with all related data
export async function getClientById(id: string): Promise<ApiResponse<TravelClient>> {
  try {
    // Use the database function to get all related data
    const { data, error } = await supabase
      .rpc('get_client_full_details', { client_uuid: id })
      .single()

    if (error) throw error

    return {
      data: data as TravelClient,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch client',
      success: false
    }
  }
}

// Create new client
export async function createClient(clientData: ClientFormData): Promise<ApiResponse<TravelClient>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('clients')
      .insert([{
        ...clientData,
        status: clientData.status || 'new',
        priority_tag: clientData.priority_tag || 'normal',
        created_by: user.id,
        updated_by: user.id
      }])
      .select()
      .single()

    if (error) throw error

    return {
      data,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create client',
      success: false
    }
  }
}

// Update client
export async function updateClient(id: string, clientData: Partial<ClientFormData>): Promise<ApiResponse<TravelClient>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('clients')
      .update({
        ...clientData,
        updated_by: user.id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      data,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update client',
      success: false
    }
  }
}

// Delete client
export async function deleteClient(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete client',
      success: false
    }
  }
}

// ========== TRAVEL INFORMATION OPERATIONS ==========

export async function getTravelInformation(clientId: string): Promise<ApiResponse<TravelInformation>> {
  try {
    const { data, error } = await supabase
      .from('travel_information')
      .select('*')
      .eq('client_id', clientId)
      .single()

    if (error) throw error

    return {
      data,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch travel information',
      success: false
    }
  }
}

export async function createOrUpdateTravelInformation(
  clientId: string, 
  travelData: TravelFormData
): Promise<ApiResponse<TravelInformation>> {
  try {
    const { data, error } = await supabase
      .from('travel_information')
      .upsert([{
        client_id: clientId,
        ...travelData
      }], {
        onConflict: 'client_id'
      })
      .select()
      .single()

    if (error) throw error

    return {
      data,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to save travel information',
      success: false
    }
  }
}

// ========== VISA APPLICATION OPERATIONS ==========

export async function getVisaApplications(clientId: string): Promise<ApiResponse<VisaApplication[]>> {
  try {
    const { data, error } = await supabase
      .from('visa_applications')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch visa applications',
      success: false
    }
  }
}

export async function createVisaApplication(
  clientId: string, 
  visaData: VisaFormData
): Promise<ApiResponse<VisaApplication>> {
  try {
    const { data, error } = await supabase
      .from('visa_applications')
      .insert([{
        client_id: clientId,
        ...visaData
      }])
      .select()
      .single()

    if (error) throw error

    return {
      data,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create visa application',
      success: false
    }
  }
}

export async function updateVisaApplication(
  id: string, 
  visaData: Partial<VisaFormData>
): Promise<ApiResponse<VisaApplication>> {
  try {
    const { data, error } = await supabase
      .from('visa_applications')
      .update(visaData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      data,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update visa application',
      success: false
    }
  }
}

// ========== REMINDER OPERATIONS ==========

export async function getReminders(clientId?: string): Promise<ApiResponse<TravelReminder[]>> {
  try {
    let query = supabase
      .from('reminders')
      .select('*')
      .order('due_date', { ascending: true })

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query

    if (error) throw error

    return {
      data: data || [],
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch reminders',
      success: false
    }
  }
}

export async function createReminder(
  clientId: string, 
  reminderData: ReminderFormData
): Promise<ApiResponse<TravelReminder>> {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .insert([{
        client_id: clientId,
        ...reminderData,
        is_completed: false
      }])
      .select()
      .single()

    if (error) throw error

    return {
      data,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create reminder',
      success: false
    }
  }
}

export async function updateReminderStatus(id: string, isCompleted: boolean): Promise<ApiResponse<TravelReminder>> {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .update({ 
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      data,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update reminder',
      success: false
    }
  }
}

// ========== PAYMENT OPERATIONS ==========

export async function getPayments(clientId: string): Promise<ApiResponse<Payment[]>> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .order('payment_date', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch payments',
      success: false
    }
  }
}

export async function createPayment(
  clientId: string, 
  paymentData: PaymentFormData
): Promise<ApiResponse<Payment>> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        client_id: clientId,
        ...paymentData
      }])
      .select()
      .single()

    if (error) throw error

    return {
      data,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create payment',
      success: false
    }
  }
}

// ========== FILE UPLOAD OPERATIONS ==========

export async function uploadClientFile(
  clientId: string,
  file: File,
  fileType: string
): Promise<ApiResponse<FileUploadResponse>> {
  try {
    const fileName = `${clientId}/${fileType}/${Date.now()}_${file.name}`
    const bucketName = getBucketNameForFileType(fileType)

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const fileUrl = uploadData.path

    // Create record in client_files table
    const { data: fileRecord, error: dbError } = await supabase
      .from('client_files')
      .insert([{
        client_id: clientId,
        file_name: file.name,
        file_type: fileType,
        file_url: fileUrl,
        file_size: file.size,
        mime_type: file.type
      }])
      .select()
      .single()

    if (dbError) throw dbError

    return {
      data: {
        file_url: fileUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type
      },
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to upload file',
      success: false
    }
  }
}

function getBucketNameForFileType(fileType: string): string {
  switch (fileType) {
    case 'passport_scan':
    case 'cnic_scan':
      return 'client-passports'
    case 'payment_receipt':
      return 'client-receipts'
    case 'ticket_pdf':
      return 'client-tickets'
    case 'profile_picture':
      return 'client-profiles'
    default:
      return 'client-documents'
  }
}

// ========== DASHBOARD ANALYTICS ==========

export async function getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .rpc('get_client_dashboard_summary', { user_id: user.id })
      .single()

    if (error) throw error

    return {
      data: data as DashboardSummary,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard summary',
      success: false
    }
  }
}

export async function getClientAnalytics(): Promise<ApiResponse<ClientAnalytics[]>> {
  try {
    const { data, error } = await supabase
      .from('client_analytics')
      .select('*')

    if (error) throw error

    return {
      data: data || [],
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch client analytics',
      success: false
    }
  }
}

export async function getUpcomingTravels(limit: number = 10): Promise<ApiResponse<UpcomingTravel[]>> {
  try {
    const { data, error } = await supabase
      .from('upcoming_travels')
      .select('*')
      .limit(limit)

    if (error) throw error

    return {
      data: data || [],
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch upcoming travels',
      success: false
    }
  }
}

export async function getPendingTasks(limit: number = 10): Promise<ApiResponse<PendingTask[]>> {
  try {
    const { data, error } = await supabase
      .from('pending_tasks')
      .select('*')
      .limit(limit)

    if (error) throw error

    return {
      data: data || [],
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch pending tasks',
      success: false
    }
  }
}