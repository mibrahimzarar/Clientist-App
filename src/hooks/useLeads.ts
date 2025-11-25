// React Query hooks for Lead Management API
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  convertLeadToClient,
  getLeadNotes,
  createLeadNote,
  getLeadStatistics,
  getTodaysFollowUps,
  getUpcomingFollowUps
} from '../api/leads'
import { LeadFormData, LeadStatus, LeadSource, PriorityTag } from '../types/travelAgent'

// ========== LEAD HOOKS ==========

export function useLeads(
  page: number = 1, 
  pageSize: number = 20, 
  filters?: {
    search_term?: string
    status_filter?: LeadStatus
    source_filter?: LeadSource
    priority_filter?: PriorityTag
    tag_filter?: string
  }
) {
  return useQuery({
    queryKey: ['leads', page, pageSize, filters],
    queryFn: () => getLeads(page, pageSize, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLeadById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead-statistics'] })
      queryClient.invalidateQueries({ queryKey: ['upcoming-follow-ups'] })
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadFormData> }) => updateLead(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead', id] })
      queryClient.invalidateQueries({ queryKey: ['lead-statistics'] })
      queryClient.invalidateQueries({ queryKey: ['upcoming-follow-ups'] })
      queryClient.invalidateQueries({ queryKey: ['todays-follow-ups'] })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead-statistics'] })
    },
  })
}

export function useConvertLeadToClient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: convertLeadToClient,
    onSuccess: (_, leadId) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['lead-statistics'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

// ========== LEAD NOTES HOOKS ==========

export function useLeadNotes(leadId: string) {
  return useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: () => getLeadNotes(leadId),
    enabled: !!leadId,
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useCreateLeadNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ leadId, content, type }: { leadId: string; content: string; type?: string }) => 
      createLeadNote(leadId, content, type),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] })
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
    },
  })
}

// ========== STATISTICS & FOLLOW-UPS HOOKS ==========

export function useLeadStatistics() {
  return useQuery({
    queryKey: ['lead-statistics'],
    queryFn: getLeadStatistics,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useTodaysFollowUps() {
  return useQuery({
    queryKey: ['todays-follow-ups'],
    queryFn: getTodaysFollowUps,
    staleTime: 60 * 1000, // 1 minute
  })
}

export function useUpcomingFollowUps(limit: number = 20) {
  return useQuery({
    queryKey: ['upcoming-follow-ups', limit],
    queryFn: () => getUpcomingFollowUps(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
