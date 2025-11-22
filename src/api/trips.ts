import { supabase } from '../lib/supabase'
import { load, save } from '../lib/storage'
import { nanoid } from 'nanoid/non-secure'

export type TripStatus = 'planned' | 'confirmed' | 'completed' | 'cancelled'
export type Trip = {
  id: string
  user_id: string
  client_id?: string
  destination: string
  start_date?: string
  end_date?: string
  status: TripStatus
  price?: number
  notes?: string
  created_at?: string
}

const KEY = 'clientist_trips'

export async function listTrips(userId: string): Promise<Trip[]> {
  try {
    const { data, error } = await supabase.from('trips').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Trip[]
  } catch {
    const all = await load<Trip[]>(KEY, [])
    return all.filter(t => t.user_id === userId)
  }
}

export async function createTrip(userId: string, partial: Partial<Trip>): Promise<Trip> {
  const trip: Trip = {
    id: nanoid(),
    user_id: userId,
    client_id: partial.client_id,
    destination: partial.destination || '',
    start_date: partial.start_date,
    end_date: partial.end_date,
    status: partial.status || 'planned',
    price: partial.price,
    notes: partial.notes,
    created_at: new Date().toISOString()
  }
  try {
    const { error } = await supabase.from('trips').insert(trip)
    if (error) throw error
  } catch {
    const all = await load<Trip[]>(KEY, [])
    const next = [trip, ...all]
    await save(KEY, next)
  }
  return trip
}