// Lead Management API functions using Supabase
import { supabase } from '../lib/supabase'
import {
  Lead,
  LeadNote,
  LeadFormData,
  LeadStatistics,
  TodaysFollowUp,
  UpcomingFollowUp,
  ApiResponse,
  PaginatedResponse,
  LeadStatus,
  LeadSource,
  PriorityTag,
  ClientFormData,
  TravelClient
} from '../types/travelAgent'

// ========== LEAD OPERATIONS ==========

// Get all leads with pagination and filters
export async function getLeads(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    search_term?: string
    status_filter?: LeadStatus
    source_filter?: LeadSource
    priority_filter?: PriorityTag
    tag_filter?: string
  }
): Promise<ApiResponse<PaginatedResponse<Lead>>> {
  try {
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters?.search_term) {
      query = query.or(`full_name.ilike.%${filters.search_term}%,phone_number.ilike.%${filters.search_term}%,email.ilike.%${filters.search_term}%`)
    }
    if (filters?.status_filter) {
      query = query.eq('lead_status', filters.status_filter)
    }
    if (filters?.source_filter) {
      query = query.eq('lead_source', filters.source_filter)
    }
    if (filters?.priority_filter) {
      query = query.eq('priority_tag', filters.priority_filter)
    }
    if (filters?.tag_filter) {
      query = query.contains('tags', [filters.tag_filter])
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
      error: error instanceof Error ? error.message : 'Failed to fetch leads',
      success: false
    }
  }
}

// Get single lead by ID
export async function getLeadById(id: string): Promise<ApiResponse<Lead>> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      data: data as Lead,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch lead',
      success: false
    }
  }
}

// Create new lead
export async function createLead(leadData: LeadFormData): Promise<ApiResponse<Lead>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('leads')
      .insert([{
        ...leadData,
        lead_status: leadData.lead_status || 'potential',
        priority_tag: leadData.priority_tag || 'normal',
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
      error: error instanceof Error ? error.message : 'Failed to create lead',
      success: false
    }
  }
}

// Update lead
export async function updateLead(id: string, leadData: Partial<LeadFormData>): Promise<ApiResponse<Lead>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('leads')
      .update({
        ...leadData,
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
      error: error instanceof Error ? error.message : 'Failed to update lead',
      success: false
    }
  }
}

// Delete lead
export async function deleteLead(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete lead',
      success: false
    }
  }
}

// Convert lead to client
export async function convertLeadToClient(leadId: string): Promise<ApiResponse<TravelClient>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError) throw leadError

    // Create client from lead
    const clientData: ClientFormData = {
      full_name: lead.full_name,
      phone_number: lead.phone_number,
      email: lead.email,
      country: lead.country || 'Unknown',
      package_type: lead.interested_package || 'tourist_visa',
      lead_source: lead.lead_source,
      status: 'in_progress',
      priority_tag: lead.priority_tag,
      notes: lead.notes
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert([{
        ...clientData,
        created_by: user.id,
        updated_by: user.id,
        profile_picture_url: lead.profile_picture_url
      }])
      .select()
      .single()

    if (clientError) throw clientError

    // Update lead status to converted
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        lead_status: 'converted',
        converted_client_id: client.id,
        converted_at: new Date().toISOString(),
        updated_by: user.id
      })
      .eq('id', leadId)

    if (updateError) throw updateError

    return {
      data: client,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to convert lead to client',
      success: false
    }
  }
}

// ========== LEAD NOTES OPERATIONS ==========

// Get notes for a lead
export async function getLeadNotes(leadId: string): Promise<ApiResponse<LeadNote[]>> {
  try {
    const { data, error } = await supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch lead notes',
      success: false
    }
  }
}

// Create lead note
export async function createLeadNote(leadId: string, content: string, type: string = 'general'): Promise<ApiResponse<LeadNote>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('lead_notes')
      .insert([{
        lead_id: leadId,
        content,
        type,
        created_by: user.id
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
      error: error instanceof Error ? error.message : 'Failed to create lead note',
      success: false
    }
  }
}

// ========== LEAD STATISTICS & FOLLOW-UPS ==========

// Get lead statistics
export async function getLeadStatistics(): Promise<ApiResponse<LeadStatistics>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .rpc('get_lead_statistics', { user_id: user.id })
      .single()

    if (error) throw error

    return {
      data: data as LeadStatistics,
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch lead statistics',
      success: false
    }
  }
}

// Get today's follow-ups
export async function getTodaysFollowUps(): Promise<ApiResponse<TodaysFollowUp[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('todays_follow_ups')
      .select('*')
      .eq('created_by', user.id)

    if (error) throw error

    return {
      data: data || [],
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch today\'s follow-ups',
      success: false
    }
  }
}

// Get upcoming follow-ups
export async function getUpcomingFollowUps(limit: number = 20): Promise<ApiResponse<UpcomingFollowUp[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('upcoming_follow_ups')
      .select('*')
      .eq('created_by', user.id)
      .limit(limit)

    if (error) throw error

    return {
      data: data || [],
      success: true
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch upcoming follow-ups',
      success: false
    }
  }
}
