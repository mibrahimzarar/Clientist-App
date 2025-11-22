// Trip Management Types

export type Trip = {
    id: string
    client_id: string
    departure_city: string
    departure_date: string
    destination_city: string
    destination_date: string
    airline?: string
    flight_number?: string
    pnr_number?: string
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
}

export type TripFormData = {
    client_id: string
    departure_city: string
    departure_date: string
    destination_city: string
    destination_date: string
    airline?: string
    flight_number?: string
    pnr_number?: string
    notes?: string
}

export type TripFilters = {
    search_term?: string
    client_id?: string
    from_date?: string
    to_date?: string
}
