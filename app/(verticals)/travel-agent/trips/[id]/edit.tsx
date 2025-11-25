import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Modal,
} from 'react-native'
import { BouncingBallsLoader } from '../../../../../src/components/ui/BouncingBallsLoader'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../../../../src/lib/supabase'
import { useTrip, useUpdateTrip } from '../../../../../src/hooks/useTrips'
import { useClients } from '../../../../../src/hooks/useTravelAgent'
import { TripFormData, TripType, TripStop } from '../../../../../src/types/trips'

type DatePickerType =
    | 'departure'
    | 'destination'
    | 'return_departure'
    | 'return_destination'
    | `stop_arrival_${number}`
    | `stop_departure_${number}`
    | null

export default function EditTrip() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const [userId, setUserId] = useState<string | null>(null)
    const { data: tripData, isLoading: tripLoading } = useTrip(id)
    const updateTrip = useUpdateTrip()
    const [tripType, setTripType] = useState<TripType>('one_way')

    const [formData, setFormData] = useState<TripFormData>({
        client_id: '',
        trip_type: 'one_way',
        departure_city: '',
        departure_date: '',
        destination_city: '',
        destination_date: '',
        airline: '',
        flight_number: '',
        pnr_number: '',
        notes: '',
        return_departure_city: '',
        return_departure_date: '',
        return_destination_city: '',
        return_destination_date: '',
        return_airline: '',
        return_flight_number: '',
        return_pnr_number: '',
        stops: [],
    })

    const [showClientPicker, setShowClientPicker] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState<DatePickerType>(null)
    const [tempDate, setTempDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day')
    const [viewDate, setViewDate] = useState(new Date())

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || null)
        }
        fetchUser()
    }, [])

    // Load trip data into form
    useEffect(() => {
        if (tripData?.data) {
            const trip = tripData.data
            setTripType(trip.trip_type || 'one_way')
            setFormData({
                client_id: trip.client_id,
                trip_type: trip.trip_type || 'one_way',
                departure_city: trip.departure_city,
                departure_date: trip.departure_date,
                destination_city: trip.destination_city,
                destination_date: trip.destination_date,
                airline: trip.airline || '',
                flight_number: trip.flight_number || '',
                pnr_number: trip.pnr_number || '',
                notes: trip.notes || '',
                return_departure_city: trip.return_departure_city || '',
                return_departure_date: trip.return_departure_date || '',
                return_destination_city: trip.return_destination_city || '',
                return_destination_date: trip.return_destination_date || '',
                return_airline: trip.return_airline || '',
                return_flight_number: trip.return_flight_number || '',
                return_pnr_number: trip.return_pnr_number || '',
                stops: trip.stops || [],
            })
        }
    }, [tripData])

    const { data: clientsData } = useClients(1, 100)
    const clients = clientsData?.data?.data || []

    const selectedClient = clients.find(c => c.id === formData.client_id)

    const handleSubmit = async () => {
        if (!formData.client_id || !formData.departure_city || !formData.departure_date ||
            !formData.destination_city || !formData.destination_date) {
            Alert.alert('Required Fields', 'Please fill in all required fields')
            return
        }

        try {
            await updateTrip.mutateAsync({ id, data: formData })
            Alert.alert('Success', 'Trip updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error) {
            Alert.alert('Error', 'Failed to update trip. Please try again.')
        }
    }

    const formatDateTime = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}`
    }

    const handleDateConfirm = () => {
        const formattedDate = formatDateTime(tempDate)
        if (showDatePicker === 'departure') {
            setFormData({ ...formData, departure_date: formattedDate })
        } else if (showDatePicker === 'destination') {
            setFormData({ ...formData, destination_date: formattedDate })
        } else if (showDatePicker === 'return_departure') {
            setFormData({ ...formData, return_departure_date: formattedDate })
        } else if (showDatePicker === 'return_destination') {
            setFormData({ ...formData, return_destination_date: formattedDate })
        } else if (showDatePicker && showDatePicker.startsWith('stop_')) {
            const [_, type, indexStr] = showDatePicker.split('_')
            const stopIndex = parseInt(indexStr)
            const updatedStops = [...(formData.stops || [])]
            if (type === 'arrival') {
                updatedStops[stopIndex] = { ...updatedStops[stopIndex], arrival_date: formattedDate }
            } else if (type === 'departure') {
                updatedStops[stopIndex] = { ...updatedStops[stopIndex], departure_date: formattedDate }
            }
            setFormData({ ...formData, stops: updatedStops })
        }
        setShowDatePicker(null)
    }

    const openDatePicker = (type: DatePickerType) => {
        if (!type) return
        let currentDate = new Date()
        if (type === 'departure' && formData.departure_date) {
            currentDate = new Date(formData.departure_date)
        } else if (type === 'destination' && formData.destination_date) {
            currentDate = new Date(formData.destination_date)
        } else if (type === 'return_departure' && formData.return_departure_date) {
            currentDate = new Date(formData.return_departure_date)
        } else if (type === 'return_destination' && formData.return_destination_date) {
            currentDate = new Date(formData.return_destination_date)
        } else if (type.startsWith('stop_')) {
            const [_, dateType, indexStr] = type.split('_')
            const stopIndex = parseInt(indexStr)
            const stop = formData.stops?.[stopIndex]
            if (stop) {
                if (dateType === 'arrival' && stop.arrival_date) {
                    currentDate = new Date(stop.arrival_date)
                } else if (dateType === 'departure' && stop.departure_date) {
                    currentDate = new Date(stop.departure_date)
                }
            }
        }
        setTempDate(currentDate)
        setViewDate(currentDate)
        setViewMode('day')
        setShowDatePicker(type)
    }

    const completionPercentage = () => {
        const fields = [
            formData.client_id,
            formData.departure_city,
            formData.departure_date,
            formData.destination_city,
            formData.destination_date,
        ]
        const filled = fields.filter(f => f && f.trim()).length
        return Math.round((filled / fields.length) * 100)
    }

    const handleTripTypeChange = (type: TripType) => {
        setTripType(type)
        setFormData({
            ...formData,
            trip_type: type,
            return_departure_city: type === 'return' ? formData.destination_city : '',
            return_destination_city: type === 'return' ? formData.departure_city : '',
        })
    }

    const addStop = (leg: 'outbound' | 'return' = 'outbound') => {
        const currentStops = formData.stops?.filter(s => s.leg === leg) || []
        // Max 2 stops per leg
        if (currentStops.length >= 2) {
            Alert.alert('Maximum Stops', `You can add up to 2 ${leg} stops maximum`)
            return
        }
        const newStop: Omit<TripStop, 'id' | 'trip_id' | 'created_at' | 'updated_at'> = {
            leg,
            stop_number: currentStops.length + 1,
            city: '',
            arrival_date: '',
            departure_date: '',
            hotel_name: '',
            notes: '',
        }
        setFormData({
            ...formData,
            stops: [...(formData.stops || []), newStop]
        })
    }

    const removeStop = (index: number) => {
        const removedStop = formData.stops?.[index]
        if (!removedStop) return

        // Filter out the removed stop and renumber remaining stops of the same leg
        const updatedStops = formData.stops
            ?.filter((_, i) => i !== index)
            .map(stop => {
                if (stop.leg === removedStop.leg) {
                    // Renumber stops of the same leg
                    const sameLegStops = formData.stops!.filter((s, i2) =>
                        i2 < formData.stops!.indexOf(stop) && s.leg === stop.leg && i2 !== index
                    )
                    return { ...stop, stop_number: sameLegStops.length + 1 }
                }
                return stop
            }) || []
        setFormData({ ...formData, stops: updatedStops })
    }

    const updateStop = (index: number, field: string, value: string) => {
        const updatedStops = [...(formData.stops || [])]
        updatedStops[index] = { ...updatedStops[index], [field]: value }
        setFormData({ ...formData, stops: updatedStops })
    }

    if (tripLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <BouncingBallsLoader size={12} color="#047857" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#047857', '#065F46']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Edit Trip</Text>
                    <Text style={styles.headerSubtitle}>Update travel itinerary</Text>
                </View>
                <View style={{ width: 40 }} />
            </LinearGradient>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${completionPercentage()}%` }]} />
                </View>
                <Text style={styles.progressText}>{completionPercentage()}% Complete</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>

                {/* Client Selection Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="person-circle" size={24} color="#047857" />
                        <Text style={styles.cardTitle}>Client Information</Text>
                    </View>

                    <Text style={styles.label}>
                        Select Client <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.clientSelector}
                        onPress={() => setShowClientPicker(!showClientPicker)}
                    >
                        <Ionicons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
                        <Text style={[styles.clientSelectorText, !selectedClient && styles.placeholderText]}>
                            {selectedClient ? selectedClient.full_name : 'Select a client'}
                        </Text>
                        <Ionicons name={showClientPicker ? 'chevron-up' : 'chevron-down'} size={20} color="#6B7280" />
                    </TouchableOpacity>

                    {showClientPicker && (
                        <View style={styles.clientPicker}>
                            <ScrollView style={styles.clientList}>
                                {clients.map((client) => (
                                    <TouchableOpacity
                                        key={client.id}
                                        style={styles.clientItem}
                                        onPress={() => {
                                            setFormData({ ...formData, client_id: client.id })
                                            setShowClientPicker(false)
                                        }}
                                    >
                                        <Text style={styles.clientItemName}>{client.full_name}</Text>
                                        <Text style={styles.clientItemPhone}>{client.phone_number}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Trip Type Selector */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="swap-vertical" size={24} color="#047857" />
                        <Text style={styles.cardTitle}>Trip Type</Text>
                    </View>

                    <View style={styles.tripTypeContainer}>
                        <TouchableOpacity
                            style={[styles.tripTypeButton, tripType === 'one_way' && styles.tripTypeButtonActive]}
                            onPress={() => handleTripTypeChange('one_way')}
                        >
                            <Ionicons
                                name="arrow-forward"
                                size={24}
                                color={tripType === 'one_way' ? '#fff' : '#047857'}
                            />
                            <Text style={[styles.tripTypeText, tripType === 'one_way' && styles.tripTypeTextActive]}>
                                One-way
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tripTypeButton, tripType === 'return' && styles.tripTypeButtonActive]}
                            onPress={() => handleTripTypeChange('return')}
                        >
                            <Ionicons
                                name="swap-horizontal"
                                size={24}
                                color={tripType === 'return' ? '#fff' : '#047857'}
                            />
                            <Text style={[styles.tripTypeText, tripType === 'return' && styles.tripTypeTextActive]}>
                                Round trip
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Departure Information Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="location" size={24} color="#047857" />
                        <Text style={styles.cardTitle}>Departure Details</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Departure City <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.departure_city}
                                onChangeText={(text) => setFormData({ ...formData, departure_city: text })}
                                placeholder="e.g., New York"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Departure Date <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.dateInputContainer}
                            onPress={() => openDatePicker('departure')}
                        >
                            <Ionicons name="calendar" size={20} color="#047857" style={styles.inputIcon} />
                            <Text style={[styles.dateText, !formData.departure_date && styles.placeholderText]}>
                                {formData.departure_date || 'Select departure date'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Destination Information Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="flag" size={24} color="#047857" />
                        <Text style={styles.cardTitle}>Destination Details</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Destination City <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.destination_city}
                                onChangeText={(text) => setFormData({ ...formData, destination_city: text })}
                                placeholder="e.g., London"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Arrival Date <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.dateInputContainer}
                            onPress={() => openDatePicker('destination')}
                        >
                            <Ionicons name="calendar" size={20} color="#047857" style={styles.inputIcon} />
                            <Text style={[styles.dateText, !formData.destination_date && styles.placeholderText]}>
                                {formData.destination_date || 'Select arrival date'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Flight Information Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="airplane" size={24} color="#047857" />
                        <Text style={styles.cardTitle}>Flight Information (Optional)</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Airline</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="airplane-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.airline}
                                onChangeText={(text) => setFormData({ ...formData, airline: text })}
                                placeholder="e.g., Emirates"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Flight Number</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="ticket-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.flight_number}
                                onChangeText={(text) => setFormData({ ...formData, flight_number: text })}
                                placeholder="e.g., EK001"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>PNR Number</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="barcode-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.pnr_number}
                                onChangeText={(text) => setFormData({ ...formData, pnr_number: text })}
                                placeholder="e.g., ABC123"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>
                </View>

                {/* Outbound Stops Section - Shows for All Trips */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="location" size={24} color="#047857" />
                        <Text style={styles.cardTitle}>Outbound Stops (Optional)</Text>
                    </View>

                    <Text style={styles.sectionNote}>
                        Add up to 2 stops between departure and destination
                    </Text>

                    {formData.stops?.filter(s => s.leg === 'outbound').map((stop, legIndex) => {
                        const globalIndex = formData.stops!.indexOf(stop)
                        return (
                            <View key={globalIndex} style={styles.stopCard}>
                                <View style={styles.stopHeader}>
                                    <Text style={styles.stopTitle}>Outbound Stop {stop.stop_number}</Text>
                                    <TouchableOpacity
                                        onPress={() => removeStop(globalIndex)}
                                        style={styles.removeStopButton}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>City</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={stop.city}
                                            onChangeText={(text) => updateStop(globalIndex, 'city', text)}
                                            placeholder="e.g., Dubai"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Arrival Date</Text>
                                    <TouchableOpacity
                                        style={styles.dateInputContainer}
                                        onPress={() => openDatePicker(`stop_arrival_${globalIndex}` as DatePickerType)}
                                    >
                                        <Ionicons name="calendar" size={20} color="#047857" style={styles.inputIcon} />
                                        <Text style={[styles.dateText, !stop.arrival_date && styles.placeholderText]}>
                                            {stop.arrival_date || 'Select arrival date'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Departure Date</Text>
                                    <TouchableOpacity
                                        style={styles.dateInputContainer}
                                        onPress={() => openDatePicker(`stop_departure_${globalIndex}` as DatePickerType)}
                                    >
                                        <Ionicons name="calendar" size={20} color="#047857" style={styles.inputIcon} />
                                        <Text style={[styles.dateText, !stop.departure_date && styles.placeholderText]}>
                                            {stop.departure_date || 'Select departure date'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Hotel (Optional)</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="bed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={stop.hotel_name}
                                            onChangeText={(text) => updateStop(globalIndex, 'hotel_name', text)}
                                            placeholder="Hotel name"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                </View>
                            </View>
                        )
                    })}

                    {(formData.stops?.filter(s => s.leg === 'outbound').length || 0) < 2 && (
                        <TouchableOpacity
                            style={styles.addStopButton}
                            onPress={() => addStop('outbound')}
                        >
                            <Ionicons name="add-circle" size={24} color="#047857" />
                            <Text style={styles.addStopText}>
                                Add Outbound Stop {(formData.stops?.filter(s => s.leg === 'outbound').length || 0) + 1}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Return Flight Section - Only for Round Trips */}
                {tripType === 'return' && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="arrow-back" size={24} color="#047857" />
                            <Text style={styles.cardTitle}>Return Flight</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Return Departure City <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.return_departure_city}
                                    onChangeText={(text) => setFormData({ ...formData, return_departure_city: text })}
                                    placeholder="e.g., London"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Return Departure Date <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={styles.dateInputContainer}
                                onPress={() => openDatePicker('return_departure')}
                            >
                                <Ionicons name="calendar" size={20} color="#047857" style={styles.inputIcon} />
                                <Text style={[styles.dateText, !formData.return_departure_date && styles.placeholderText]}>
                                    {formData.return_departure_date || 'Select date'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Return Destination City <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.return_destination_city}
                                    onChangeText={(text) => setFormData({ ...formData, return_destination_city: text })}
                                    placeholder="e.g., New York"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Return Arrival Date <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={styles.dateInputContainer}
                                onPress={() => openDatePicker('return_destination')}
                            >
                                <Ionicons name="calendar" size={20} color="#047857" style={styles.inputIcon} />
                                <Text style={[styles.dateText, !formData.return_destination_date && styles.placeholderText]}>
                                    {formData.return_destination_date || 'Select date'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Return Airline (Optional)</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="airplane-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.return_airline}
                                    onChangeText={(text) => setFormData({ ...formData, return_airline: text })}
                                    placeholder="e.g., Emirates"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Return Flight Number (Optional)</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="ticket-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.return_flight_number}
                                    onChangeText={(text) => setFormData({ ...formData, return_flight_number: text })}
                                    placeholder="e.g., EK002"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Return PNR Number (Optional)</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="barcode-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.return_pnr_number}
                                    onChangeText={(text) => setFormData({ ...formData, return_pnr_number: text })}
                                    placeholder="e.g., XYZ789"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        {/* Return Stops Section - Within Return Flight Block */}
                        <View style={[styles.card, { marginTop: 0, borderTopWidth: 1, borderTopColor: '#E5E7EB', borderTopLeftRadius: 0, borderTopRightRadius: 0 }]}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="location" size={24} color="#047857" />
                                <Text style={styles.cardTitle}>Return Stops (Optional)</Text>
                            </View>

                            <Text style={styles.sectionNote}>
                                Add up to 2 stops on your return journey
                            </Text>

                            {formData.stops?.filter(s => s.leg === 'return').map((stop, legIndex) => {
                                const globalIndex = formData.stops!.indexOf(stop)
                                return (
                                    <View key={globalIndex} style={styles.stopCard}>
                                        <View style={styles.stopHeader}>
                                            <Text style={styles.stopTitle}>Return Stop {stop.stop_number}</Text>
                                            <TouchableOpacity
                                                onPress={() => removeStop(globalIndex)}
                                                style={styles.removeStopButton}
                                            >
                                                <Ionicons name="close-circle" size={24} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>City</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.input}
                                                    value={stop.city}
                                                    onChangeText={(text) => updateStop(globalIndex, 'city', text)}
                                                    placeholder="e.g., Paris"
                                                    placeholderTextColor="#9CA3AF"
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Arrival Date</Text>
                                            <TouchableOpacity
                                                style={styles.dateInputContainer}
                                                onPress={() => openDatePicker(`stop_arrival_${globalIndex}` as DatePickerType)}
                                            >
                                                <Ionicons name="calendar" size={20} color="#047857" style={styles.inputIcon} />
                                                <Text style={[styles.dateText, !stop.arrival_date && styles.placeholderText]}>
                                                    {stop.arrival_date || 'Select arrival date'}
                                                </Text>
                                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Departure Date</Text>
                                            <TouchableOpacity
                                                style={styles.dateInputContainer}
                                                onPress={() => openDatePicker(`stop_departure_${globalIndex}` as DatePickerType)}
                                            >
                                                <Ionicons name="calendar" size={20} color="#047857" style={styles.inputIcon} />
                                                <Text style={[styles.dateText, !stop.departure_date && styles.placeholderText]}>
                                                    {stop.departure_date || 'Select departure date'}
                                                </Text>
                                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Hotel (Optional)</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="bed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.input}
                                                    value={stop.hotel_name}
                                                    onChangeText={(text) => updateStop(globalIndex, 'hotel_name', text)}
                                                    placeholder="Hotel name"
                                                    placeholderTextColor="#9CA3AF"
                                                />
                                            </View>
                                        </View>
                                    </View>
                                )
                            })}

                            {(formData.stops?.filter(s => s.leg === 'return').length || 0) < 2 && (
                                <TouchableOpacity
                                    style={styles.addStopButton}
                                    onPress={() => addStop('return')}
                                >
                                    <Ionicons name="add-circle" size={24} color="#047857" />
                                    <Text style={styles.addStopText}>
                                        Add Return Stop {(formData.stops?.filter(s => s.leg === 'return').length || 0) + 1}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* Notes Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="document-text" size={24} color="#047857" />
                        <Text style={styles.cardTitle}>Additional Notes</Text>
                    </View>

                    <TextInput
                        style={styles.textArea}
                        value={formData.notes}
                        onChangeText={(text) => setFormData({ ...formData, notes: text })}
                        placeholder="Add any additional notes about this trip..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Submit Button */}
            <View style={styles.submitContainer}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={updateTrip.isPending}
                >
                    <LinearGradient
                        colors={['#047857', '#065F46']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.submitGradient}
                    >
                        {updateTrip.isPending ? (
                            <BouncingBallsLoader color="#fff" size={8} />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                <Text style={styles.submitText}>Update Trip</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Date Picker Modal */}
            <Modal
                visible={showDatePicker !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDatePicker(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient
                            colors={['#047857', '#065F46']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.modalHeader}
                        >
                            <View>
                                <Text style={styles.modalTitle}>
                                    {showDatePicker === 'departure' ? 'Departure Date' : 'Arrival Date'}
                                </Text>
                                <View style={styles.headerSelectors}>
                                    <TouchableOpacity
                                        onPress={() => setViewMode('month')}
                                        style={[styles.headerSelector, viewMode === 'month' && styles.headerSelectorActive]}
                                    >
                                        <Text style={[styles.headerSelectorText, viewMode === 'month' && styles.headerSelectorTextActive]}>
                                            {viewDate.toLocaleDateString('en-US', { month: 'long' })}
                                        </Text>
                                        <Ionicons name="chevron-down" size={16} color={viewMode === 'month' ? '#047857' : 'rgba(255,255,255,0.8)'} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setViewMode('year')}
                                        style={[styles.headerSelector, viewMode === 'year' && styles.headerSelectorActive]}
                                    >
                                        <Text style={[styles.headerSelectorText, viewMode === 'year' && styles.headerSelectorTextActive]}>
                                            {viewDate.getFullYear()}
                                        </Text>
                                        <Ionicons name="chevron-down" size={16} color={viewMode === 'year' ? '#047857' : 'rgba(255,255,255,0.8)'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                                <Ionicons name="close-circle" size={28} color="#fff" />
                            </TouchableOpacity>
                        </LinearGradient>

                        <View style={styles.datePickerContainer}>
                            {viewMode === 'day' && (
                                <>
                                    {/* Date Selection - Horizontal Scroll */}
                                    <View style={styles.dateSection}>
                                        <Text style={styles.sectionLabel}>Select Day</Text>
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.dateScrollContainer}
                                            snapToInterval={80}
                                            decelerationRate="fast"
                                        >
                                            {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                                                const day = i + 1
                                                const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
                                                const isSelected = date.getDate() === tempDate.getDate() &&
                                                    date.getMonth() === tempDate.getMonth() &&
                                                    date.getFullYear() === tempDate.getFullYear()

                                                return (
                                                    <TouchableOpacity
                                                        key={i}
                                                        style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                                                        onPress={() => {
                                                            const newDate = new Date(tempDate)
                                                            newDate.setFullYear(date.getFullYear(), date.getMonth(), day)
                                                            setTempDate(newDate)
                                                        }}
                                                    >
                                                        <Text style={[styles.dateCardDay, isSelected && styles.dateCardDaySelected]}>
                                                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                        </Text>
                                                        <Text style={[styles.dateCardDate, isSelected && styles.dateCardDateSelected]}>
                                                            {day}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })}
                                        </ScrollView>
                                    </View>

                                    {/* Time Selection - Vertical Scrolls */}
                                    <View style={styles.timeSection}>
                                        <Text style={styles.sectionLabel}>Select Time</Text>
                                        <View style={styles.timeGrid}>
                                            {/* Hours */}
                                            <View style={styles.timeColumn}>
                                                <Text style={styles.timeLabel}>Hour</Text>
                                                <ScrollView
                                                    style={styles.timeScroll}
                                                    showsVerticalScrollIndicator={false}
                                                    snapToInterval={50}
                                                    decelerationRate="fast"
                                                >
                                                    {Array.from({ length: 24 }, (_, i) => {
                                                        const isSelected = i === tempDate.getHours()
                                                        return (
                                                            <TouchableOpacity
                                                                key={i}
                                                                style={[styles.timeItem, isSelected && styles.timeItemSelected]}
                                                                onPress={() => {
                                                                    const newDate = new Date(tempDate)
                                                                    newDate.setHours(i)
                                                                    setTempDate(newDate)
                                                                }}
                                                            >
                                                                <Text style={[styles.timeItemText, isSelected && styles.timeItemTextSelected]}>
                                                                    {String(i).padStart(2, '0')}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        )
                                                    })}
                                                </ScrollView>
                                            </View>

                                            <Text style={styles.timeSeparator}>:</Text>

                                            {/* Minutes */}
                                            <View style={styles.timeColumn}>
                                                <Text style={styles.timeLabel}>Minute</Text>
                                                <ScrollView
                                                    style={styles.timeScroll}
                                                    showsVerticalScrollIndicator={false}
                                                    snapToInterval={50}
                                                    decelerationRate="fast"
                                                >
                                                    {Array.from({ length: 12 }, (_, i) => {
                                                        const minute = i * 5
                                                        const isSelected = Math.floor(tempDate.getMinutes() / 5) * 5 === minute
                                                        return (
                                                            <TouchableOpacity
                                                                key={i}
                                                                style={[styles.timeItem, isSelected && styles.timeItemSelected]}
                                                                onPress={() => {
                                                                    const newDate = new Date(tempDate)
                                                                    newDate.setMinutes(minute)
                                                                    setTempDate(newDate)
                                                                }}
                                                            >
                                                                <Text style={[styles.timeItemText, isSelected && styles.timeItemTextSelected]}>
                                                                    {String(minute).padStart(2, '0')}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        )
                                                    })}
                                                </ScrollView>
                                            </View>
                                        </View>
                                    </View>
                                </>
                            )}

                            {viewMode === 'month' && (
                                <View style={styles.monthGrid}>
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const isSelected = i === viewDate.getMonth()
                                        return (
                                            <TouchableOpacity
                                                key={i}
                                                style={[styles.monthCard, isSelected && styles.monthCardSelected]}
                                                onPress={() => {
                                                    const newViewDate = new Date(viewDate)
                                                    newViewDate.setDate(1)
                                                    newViewDate.setMonth(i)
                                                    setViewDate(newViewDate)

                                                    const newTempDate = new Date(tempDate)
                                                    const currentDay = newTempDate.getDate()
                                                    newTempDate.setFullYear(viewDate.getFullYear(), i, 1)
                                                    const daysInMonth = new Date(viewDate.getFullYear(), i + 1, 0).getDate()
                                                    newTempDate.setDate(Math.min(currentDay, daysInMonth))
                                                    setTempDate(newTempDate)

                                                    setViewMode('day')
                                                }}
                                            >
                                                <Text style={[styles.monthText, isSelected && styles.monthTextSelected]}>
                                                    {new Date(2024, i, 15).toLocaleDateString('en-US', { month: 'short' })}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            )}

                            {viewMode === 'year' && (
                                <ScrollView style={styles.yearList} showsVerticalScrollIndicator={false}>
                                    {Array.from({ length: 10 }, (_, i) => {
                                        const year = new Date().getFullYear() - 2 + i
                                        const isSelected = year === viewDate.getFullYear()
                                        return (
                                            <TouchableOpacity
                                                key={i}
                                                style={[styles.yearItem, isSelected && styles.yearItemSelected]}
                                                onPress={() => {
                                                    const newViewDate = new Date(viewDate)
                                                    newViewDate.setDate(1)
                                                    newViewDate.setFullYear(year)
                                                    setViewDate(newViewDate)

                                                    const newTempDate = new Date(tempDate)
                                                    const currentMonth = newTempDate.getMonth()
                                                    const currentDay = newTempDate.getDate()

                                                    newTempDate.setFullYear(year)
                                                    if (newTempDate.getMonth() !== currentMonth) {
                                                        newTempDate.setDate(0)
                                                    }
                                                    setTempDate(newTempDate)

                                                    setViewMode('month')
                                                }}
                                            >
                                                <Text style={[styles.yearText, isSelected && styles.yearTextSelected]}>
                                                    {year}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </ScrollView>
                            )}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowDatePicker(null)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleDateConfirm}
                            >
                                <LinearGradient
                                    colors={['#047857', '#065F46']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.confirmGradient}
                                >
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={styles.confirmText}>Confirm</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

// Styles (same as new.tsx but you can customize if needed)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingVertical: 20,
        shadowColor: '#047857',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    backButton: {
        padding: 8,
    },
    headerContent: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    progressContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#047857',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    formContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginLeft: 12,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#111827',
    },
    clientSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
    },
    clientSelectorText: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        marginLeft: 12,
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    clientPicker: {
        marginTop: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: 200,
    },
    clientList: {
        maxHeight: 200,
    },
    clientItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    clientItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    clientItemPhone: {
        fontSize: 14,
        color: '#6B7280',
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
    },
    dateText: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        marginLeft: 12,
    },
    textArea: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        minHeight: 100,
    },
    submitContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    datePickerContainer: {
        padding: 24,
    },
    dateSection: {
        marginBottom: 110,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateScrollContainer: {
        paddingHorizontal: 8,
        gap: 12,
    },
    dateCard: {
        width: 80,
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateCardSelected: {
        backgroundColor: '#047857',
        borderColor: '#047857',
    },
    dateCardDay: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    dateCardDaySelected: {
        color: 'rgba(255,255,255,0.8)',
    },
    dateCardDate: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    dateCardDateSelected: {
        color: '#fff',
    },
    timeSection: {
        flex: 1,
        marginBottom: 110,
    },
    timeGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    timeColumn: {
        alignItems: 'center',
        height: 200,
    },
    timeLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    timeScroll: {
        width: 80,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    timeItem: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeItemSelected: {
        backgroundColor: '#047857',
    },
    timeItemText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
    },
    timeItemTextSelected: {
        color: '#fff',
    },
    timeSeparator: {
        fontSize: 24,
        fontWeight: '700',
        color: '#374151',
        marginTop: 20,
    },
    modalActions: {
        flexDirection: 'row',
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 16,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    confirmButton: {
        flex: 2,
        borderRadius: 16,
        overflow: 'hidden',
    },
    confirmGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    confirmText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerSelectors: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 6,
    },
    headerSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    headerSelectorActive: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    headerSelectorText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        fontWeight: '600',
    },
    headerSelectorTextActive: {
        color: '#047857',
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 12,
    },
    monthCard: {
        width: '31%',
        aspectRatio: 1.4,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthCardSelected: {
        backgroundColor: '#047857',
        borderColor: '#047857',
        shadowColor: '#047857',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    monthText: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 16,
        color: '#374151',
    },
    monthTextSelected: {
        color: '#fff',
    },
    yearList: {
        maxHeight: 300,
    },
    yearItem: {
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    yearItemSelected: {
        backgroundColor: '#047857',
        borderRadius: 12,
        borderBottomWidth: 0,
        marginVertical: 4,
    },
    yearText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    yearTextSelected: {
        color: '#fff',
    },
    tripTypeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    tripTypeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderWidth: 2,
        borderColor: '#047857',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        gap: 8,
    },
    tripTypeButtonActive: {
        backgroundColor: '#047857',
    },
    tripTypeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#047857',
    },
    tripTypeTextActive: {
        color: '#fff',
    },
    sectionNote: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 16,
        lineHeight: 18,
    },
    stopCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    stopHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    stopTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#047857',
    },
    removeStopButton: {
        padding: 4,
    },
    addStopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0FDF4',
        borderWidth: 2,
        borderColor: '#047857',
        borderRadius: 12,
        borderStyle: 'dashed',
        paddingVertical: 16,
        gap: 8,
    },
    addStopText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#047857',
    },
})
