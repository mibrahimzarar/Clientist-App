import { supabase } from './supabase'
import { QueryClient } from '@tanstack/react-query'

export function initRealtime(qc: QueryClient, userId: string) {
  const channel = supabase.channel('db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `user_id=eq.${userId}` }, payload => {
      qc.invalidateQueries({ queryKey: ['clients', userId] })
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
      const clientId = (payload.new as any)?.client_id || (payload.old as any)?.client_id
      if (clientId) qc.invalidateQueries({ queryKey: ['tasks', clientId] })
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, payload => {
      const clientId = (payload.new as any)?.client_id || (payload.old as any)?.client_id
      if (clientId) qc.invalidateQueries({ queryKey: ['notes', clientId] })
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, payload => {
      const clientId = (payload.new as any)?.client_id || (payload.old as any)?.client_id
      if (clientId) qc.invalidateQueries({ queryKey: ['reminders', clientId] })
    })

  channel.subscribe()
  return () => channel.unsubscribe()
}