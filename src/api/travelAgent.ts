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
  ClientEarning,
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
  EarningFormData,
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
      .select('*, client_earnings(*)', { count: 'exact' })

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
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
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
        status: clientData.status || 'in_progress',
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

// Upload client profile image
export async function uploadClientProfileImage(
  clientId: string,
  imageUri: string,
  fileName: string
): Promise<ApiResponse<string>> {
  try {
    console.log('Starting image upload for client:', clientId)
    console.log('Image URI:', imageUri)

    const fileExt = fileName.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `${clientId}/profile_${Date.now()}.${fileExt}`
    console.log('Upload path:', filePath)

    // Map file extensions to proper MIME types
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'heic': 'image/heic',
      'heif': 'image/heif',
    }

    const mimeType = mimeTypes[fileExt] || 'image/jpeg'
    console.log('MIME type:', mimeType)

    // Read the file as ArrayBuffer for React Native
    const response = await fetch(imageUri)
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    console.log('File read, size:', uint8Array.length, 'bytes')

    // Upload to Supabase Storage using ArrayBuffer
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client-profiles')
      .upload(filePath, uint8Array, {
        contentType: mimeType,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    console.log('Upload successful:', uploadData)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('client-profiles')
      .getPublicUrl(filePath)

    console.log('Public URL:', publicUrl)

    // Update client record with profile picture URL
    const { error: updateError } = await supabase
      .from('clients')
      .update({ profile_picture_url: publicUrl })
      .eq('id', clientId)

    if (updateError) {
      console.error('Database update error:', updateError)
      throw updateError
    }

    console.log('Client record updated successfully')

    return {
      data: publicUrl,
      success: true
    }
  } catch (error) {
    console.error('Image upload failed:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to upload profile image',
      success: false
    }
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 30)

    const { data, error } = await supabase
      .from('travel_trips')
      .select(`
        *,
        client:clients(id, full_name, phone_number, email, status)
      `)
      .gte('departure_date', today.toISOString())
      .lte('departure_date', endDate.toISOString())
      .order('departure_date', { ascending: true })
      .limit(limit)

    if (error) throw error

    const travels: UpcomingTravel[] = (data || []).map((trip: any) => {
      const departureDate = new Date(trip.departure_date)
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      const diffTime = departureDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let urgency: 'today' | 'tomorrow' | 'this_week' | 'this_month' | 'later' = 'later'

      if (diffDays <= 0) urgency = 'today'
      else if (diffDays === 1) urgency = 'tomorrow'
      else if (diffDays <= 7) urgency = 'this_week'
      else if (diffDays <= 30) urgency = 'this_month'

      return {
        client_id: trip.client_id,
        full_name: trip.client?.full_name || 'Unknown Client',
        phone_number: trip.client?.phone_number || '',
        email: trip.client?.email,
        client_status: trip.client?.status || 'pending',
        departure_date: trip.departure_date,
        return_date: trip.return_date,
        airline: trip.airline,
        pnr_number: trip.pnr_number,
        hotel_name: trip.hotel_name,
        departure_city: trip.departure_city,
        destination_city: trip.destination_city,
        travel_urgency: urgency
      }
    })

    return {
      data: travels,
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 30)

    const { data, error } = await supabase
      .from('client_tasks')
      .select(`
        *,
        client:clients(id, full_name, phone_number, email)
      `)
      .eq('status', 'pending')
      .gte('due_date', today.toISOString())
      .lte('due_date', endDate.toISOString())
      .order('due_date', { ascending: true })
      .limit(limit)

    if (error) throw error

    const tasks: PendingTask[] = (data || []).map((task: any) => ({
      id: task.id,
      client_id: task.client_id,
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium',
      due_date: task.due_date,
      status: task.status,
      is_reminder_enabled: task.is_reminder_enabled,
      created_at: task.created_at,
      created_by: task.created_by,
      full_name: task.client?.full_name || 'Unknown Client',
      phone_number: task.client?.phone_number || '',
      email: task.client?.email
    }))

    return {
      data: tasks,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch pending tasks',
      success: false
    }
  }
}

// ========== CLIENT EARNINGS OPERATIONS ==========

// Get earnings for a client
export async function getClientEarnings(clientId: string): Promise<ApiResponse<ClientEarning[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('client_earnings')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', user.id)
      .order('earned_date', { ascending: false })

    if (error) throw error

    return {
      data: data as ClientEarning[],
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch earnings',
      success: false
    }
  }
}

// Add earning for a client
export async function addClientEarning(clientId: string, earningData: EarningFormData): Promise<ApiResponse<ClientEarning>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('client_earnings')
      .insert([{
        user_id: user.id,
        client_id: clientId,
        amount: earningData.amount,
        currency: earningData.currency || '',
        description: earningData.description,
        earned_date: earningData.earned_date || new Date().toISOString().split('T')[0],
        notes: earningData.notes
      }])
      .select()
      .single()

    if (error) throw error

    return {
      data: data as ClientEarning,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to add earning',
      success: false
    }
  }
}

// Update earning
export async function updateClientEarning(earningId: string, earningData: Partial<EarningFormData>): Promise<ApiResponse<ClientEarning>> {
  try {
    const { data, error } = await supabase
      .from('client_earnings')
      .update(earningData)
      .eq('id', earningId)
      .select()
      .single()

    if (error) throw error

    return {
      data: data as ClientEarning,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update earning',
      success: false
    }
  }
}

// Delete earning
export async function deleteClientEarning(earningId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('client_earnings')
      .delete()
      .eq('id', earningId)

    if (error) throw error

    return {
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete earning',
      success: false
    }
  }
}