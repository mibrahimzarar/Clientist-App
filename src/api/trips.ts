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

    if (filters?.trip_type) {
      query = query.eq('trip_type', filters.trip_type)
    }

    const { data, error } = await query

    if (error) throw error

    let trips = (data || []) as Trip[]

    if (trips.length > 0) {
      const tripIds = trips.map((t) => t.id)
      const { data: stopsData } = await supabase
        .from('trip_stops')
        .select('*')
        .in('trip_id', tripIds)
        .order('stop_number', { ascending: true })

      const stopsByTrip: Record<string, any[]> = {}
      ;(stopsData || []).forEach((s) => {
        const key = s.trip_id
        if (!stopsByTrip[key]) stopsByTrip[key] = []
        stopsByTrip[key].push(s)
      })

      trips = trips.map((t) => ({
        ...t,
        stops: stopsByTrip[t.id] || []
      }))
    }

    return { data: trips, error: null }
  } catch (error) {
    console.error('Error fetching trips:', error)
    return { data: null, error }
  }
}

export async function getTripById(id: string) {
  try {
    // Fetch trip with client and stops
    const { data: tripData, error: tripError } = await supabase
      .from('travel_trips')
      .select(`
        *,
        client:clients(id, full_name, phone_number, email)
      `)
      .eq('id', id)
      .single()

    if (tripError) throw tripError

    // Fetch stops if trip has them
    const { data: stops, error: stopsError } = await supabase
      .from('trip_stops')
      .select('*')
      .eq('trip_id', id)
      .order('stop_number', { ascending: true })

    if (stopsError) {
      console.error('Error fetching stops:', stopsError)
    }

    const trip = {
      ...tripData,
      stops: stops || []
    } as Trip

    return { data: trip, error: null }
  } catch (error) {
    console.error('Error fetching trip:', error)
    return { data: null, error }
  }
}

export async function createTrip(userId: string, tripData: TripFormData) {
  try {
    // Extract stops from trip data
    const { stops, ...tripFields } = tripData

    // Insert trip
    const { data: trip, error: tripError } = await supabase
      .from('travel_trips')
      .insert({
        ...tripFields,
        created_by: userId,
      })
      .select(`
        *,
        client:clients(id, full_name, phone_number, email)
      `)
      .single()

    if (tripError) throw tripError

    // Insert stops if provided
    let stopsData = []
    if (stops && stops.length > 0 && trip) {
      const stopsToInsert = stops.map((stop) => ({
        ...stop,
        trip_id: trip.id,
      }))

      const { data: insertedStops, error: stopsError } = await supabase
        .from('trip_stops')
        .insert(stopsToInsert)
        .select()

      if (stopsError) {
        console.error('Error inserting stops:', stopsError)
      } else {
        stopsData = insertedStops || []
      }
    }

    return {
      data: {
        ...trip,
        stops: stopsData
      } as Trip,
      error: null
    }
  } catch (error) {
    console.error('Error creating trip:', error)
    return { data: null, error }
  }
}

export async function updateTrip(id: string, tripData: Partial<TripFormData>) {
  try {
    // Extract stops from trip data
    const { stops, ...tripFields } = tripData

    // Update trip
    const { data: trip, error: tripError } = await supabase
      .from('travel_trips')
      .update(tripFields)
      .eq('id', id)
      .select(`
        *,
        client:clients(id, full_name, phone_number, email)
      `)
      .single()

    if (tripError) throw tripError

    // Handle stops update if provided
    let stopsData = []
    if (stops !== undefined) {
      // Delete existing stops
      await supabase
        .from('trip_stops')
        .delete()
        .eq('trip_id', id)

      // Insert new stops if any
      if (stops && stops.length > 0) {
        const stopsToInsert = stops.map((stop) => ({
          ...stop,
          trip_id: id,
        }))

        const { data: insertedStops, error: stopsError } = await supabase
          .from('trip_stops')
          .insert(stopsToInsert)
          .select()

        if (stopsError) {
          console.error('Error updating stops:', stopsError)
        } else {
          stopsData = insertedStops || []
        }
      }
    } else {
      // Fetch existing stops if not updating them
      const { data: existingStops } = await supabase
        .from('trip_stops')
        .select('*')
        .eq('trip_id', id)
        .order('stop_number', { ascending: true })

      stopsData = existingStops || []
    }

    return {
      data: {
        ...trip,
        stops: stopsData
      } as Trip,
      error: null
    }
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
