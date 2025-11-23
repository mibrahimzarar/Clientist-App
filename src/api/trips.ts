import { supabase } from '../lib/supabase'
import { Trip, TripFormData, TripFilters } from '../types/trips'

export async function getTrips(userId: string, filters?: TripFilters) {
  try {
    let query = supabase
      .from('travel_trips')
      .select(`
        *,
        client:clients(id, full_name, phone_number, email)
      `)
      .eq('created_by', userId)
      .order('departure_date', { ascending: false })

    if (filters?.search_term) {
      query = query.or(`departure_city.ilike.%${filters.search_term}%,destination_city.ilike.%${filters.search_term}%`)
    }

    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id)
    }

    if (filters?.from_date) {
      query = query.gte('departure_date', filters.from_date)
    }

    if (filters?.to_date) {
      query = query.lte('departure_date', filters.to_date)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data as Trip[], error: null }
  } catch (error) {
    console.error('Error fetching trips:', error)
    return { data: null, error }
  }
}

export async function getTripById(id: string) {
  try {
    const { data, error } = await supabase
      .from('travel_trips')
      .select(`
        *,
        client:clients(id, full_name, phone_number, email)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as Trip, error: null }
  } catch (error) {
    console.error('Error fetching trip:', error)
    return { data: null, error }
  }
}

export async function createTrip(userId: string, tripData: TripFormData) {
  try {
    const { data, error } = await supabase
      .from('travel_trips')
      .insert({
        ...tripData,
        created_by: userId,
      })
      .select(`
        *,
        client:clients(id, full_name, phone_number, email)
      `)
      .single()

    if (error) throw error
    return { data: data as Trip, error: null }
  } catch (error) {
    console.error('Error creating trip:', error)
    return { data: null, error }
  }
}

export async function updateTrip(id: string, tripData: Partial<TripFormData>) {
  try {
    const { data, error } = await supabase
      .from('travel_trips')
      .update(tripData)
      .eq('id', id)
      .select(`
        *,
        client:clients(id, full_name, phone_number, email)
      `)
      .single()

    if (error) throw error
    return { data: data as Trip, error: null }
  } catch (error) {
    console.error('Error updating trip:', error)
    return { data: null, error }
  }
}

export async function deleteTrip(id: string) {
  try {
    const { error } = await supabase
      .from('travel_trips')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting trip:', error)
    return { error }
  }
}