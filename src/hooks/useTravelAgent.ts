// React Query hooks for Travel Agent API
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getTravelInformation,
  createOrUpdateTravelInformation,
  getVisaApplications,
  createVisaApplication,
  updateVisaApplication,
  getReminders,
  createReminder,
  updateReminderStatus,
  getPayments,
  createPayment,
  getClientEarnings,
  addClientEarning,
  updateClientEarning,
  deleteClientEarning,
  uploadClientFile,
  getDashboardSummary,
  getClientAnalytics,
  getUpcomingTravels,
  getPendingTasks
} from '../api/travelAgent'
import {
  TravelClient,
  TravelFormData,
  VisaFormData,
  ReminderFormData,
  PaymentFormData,
  EarningFormData,
  SearchFilters
} from '../types/travelAgent'

// ========== CLIENT HOOKS ==========

export function useClients(page: number = 1, pageSize: number = 20, filters?: SearchFilters) {
  return useQuery({
    queryKey: ['clients', page, pageSize, filters],
    queryFn: () => getClients(page, pageSize, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TravelClient> }) => updateClient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

// ========== TRAVEL INFORMATION HOOKS ==========

export function useTravelInformation(clientId: string) {
  return useQuery({
    queryKey: ['travel-information', clientId],
    queryFn: () => getTravelInformation(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateOrUpdateTravelInformation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: TravelFormData }) =>
      createOrUpdateTravelInformation(clientId, data),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['travel-information', clientId] })
      queryClient.invalidateQueries({ queryKey: ['upcoming-travels'] })
    },
  })
}

// ========== VISA APPLICATION HOOKS ==========

export function useVisaApplications(clientId: string) {
  return useQuery({
    queryKey: ['visa-applications', clientId],
    queryFn: () => getVisaApplications(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateVisaApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: VisaFormData }) =>
      createVisaApplication(clientId, data),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['visa-applications', clientId] })
      queryClient.invalidateQueries({ queryKey: ['client', clientId] })
    },
  })
}

export function useUpdateVisaApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VisaFormData> }) =>
      updateVisaApplication(id, data),
    onSuccess: (_, { id }) => {
      // Note: We need to get clientId somehow, this is a simplified version
      queryClient.invalidateQueries({ queryKey: ['visa-applications'] })
    },
  })
}

// ========== REMINDER HOOKS ==========

export function useReminders(clientId?: string) {
  return useQuery({
    queryKey: ['reminders', clientId],
    queryFn: () => getReminders(clientId),
    staleTime: 60 * 1000, // 1 minute for reminders
  })
}

export function useCreateReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: ReminderFormData }) =>
      createReminder(clientId, data),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['reminders', clientId] })
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['pending-tasks'] })
    },
  })
}

export function useUpdateReminderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      updateReminderStatus(id, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['pending-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

// ========== PAYMENT HOOKS ==========

export function usePayments(clientId: string) {
  return useQuery({
    queryKey: ['payments', clientId],
    queryFn: () => getPayments(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: PaymentFormData }) =>
      createPayment(clientId, data),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['payments', clientId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

// ========== FILE UPLOAD HOOKS ==========

export function useUploadClientFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, file, fileType }: { clientId: string; file: File; fileType: string }) =>
      uploadClientFile(clientId, file, fileType),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client', clientId] })
    },
  })
}

// ========== DASHBOARD HOOKS ==========

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
    staleTime: 30 * 1000, // 30 seconds for dashboard
  })
}

export function useClientAnalytics() {
  return useQuery({
    queryKey: ['client-analytics'],
    queryFn: getClientAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpcomingTravels(limit: number = 10) {
  return useQuery({
    queryKey: ['upcoming-travels', limit],
    queryFn: () => getUpcomingTravels(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePendingTasks(limit: number = 10) {
  return useQuery({
    queryKey: ['pending-tasks', limit],
    queryFn: () => getPendingTasks(limit),
    staleTime: 60 * 1000, // 1 minute for tasks
  })
}

// ========== EARNINGS HOOKS ==========

export function useClientEarnings(clientId: string) {
  return useQuery({
    queryKey: ['client-earnings', clientId],
    queryFn: () => getClientEarnings(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAddClientEarning() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: EarningFormData }) =>
      addClientEarning(clientId, data),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client-earnings', clientId] })
      queryClient.invalidateQueries({ queryKey: ['client', clientId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}

export function useUpdateClientEarning() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EarningFormData> }) =>
      updateClientEarning(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-earnings'] })
    },
  })
}

export function useDeleteClientEarning() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteClientEarning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-earnings'] })
    },
  })
}

export function useAggregatedEarnings() {
  return useQuery({
    queryKey: ['aggregated-earnings'],
    queryFn: () => import('../api/travelAgent').then(m => m.getAggregatedEarnings()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}