// Trip Management Types

export type TripType = 'one_way' | 'return'

export type TripStop = {
    id: string
    trip_id: string
    leg: 'outbound' | 'return'
    stop_number: number
    city: string
    arrival_date: string
    departure_date: string
    hotel_name?: string
    notes?: string
    created_at?: string
    updated_at?: string
}

export type Trip = {
    id: string
    client_id: string
    trip_type: TripType

    // Outbound flight
    departure_city: string
    departure_date: string
    destination_city: string
    destination_date: string
    airline?: string
    flight_number?: string
    pnr_number?: string

    // Return flight (for trip_type = 'return')
    return_departure_city?: string
    return_departure_date?: string
    return_destination_city?: string
    return_destination_date?: string
    return_airline?: string
    return_flight_number?: string
    return_pnr_number?: string

    notes?: string
    created_by?: string
    created_at: string
    updated_at: string

    // Related data (for joins)
    client?: {
        id: string
        full_name: string
        phone_number: string
        email?: string
    }

    // Stops for multi-stop trips
    stops?: TripStop[]
}

export type TripFormData = {
    client_id: string
    trip_type: TripType

    // Outbound flight
    departure_city: string
    departure_date: string
    destination_city: string
    destination_date: string
    airline?: string
    flight_number?: string
    pnr_number?: string

    // Return flight
    return_departure_city?: string
    return_departure_date?: string
    return_destination_city?: string
    return_destination_date?: string
    return_airline?: string
    return_flight_number?: string
    return_pnr_number?: string

    notes?: string

    // Stops data (not including IDs, those are generated on save)
    stops?: Omit<TripStop, 'id' | 'trip_id' | 'created_at' | 'updated_at'>[]
}

export type TripFilters = {
    search_term?: string
    client_id?: string
    from_date?: string
    to_date?: string
    trip_type?: TripType
}
