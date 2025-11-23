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
    Platform,
} from 'react-native'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../../../src/lib/supabase'
import { useCreateTrip } from '../../../../src/hooks/useTrips'
import { useClients } from '../../../../src/hooks/useTravelAgent'
import { TripFormData } from '../../../../src/types/trips'

type DatePickerType = 'departure' | 'destination' | null

export default function NewTrip() {
    const [userId, setUserId] = useState<string | null>(null)
    const [formData, setFormData] = useState<TripFormData>({
        client_id: '',
        departure_city: '',
        departure_date: '',
        destination_city: '',
        destination_date: '',
        airline: '',
        flight_number: '',
        pnr_number: '',
        notes: '',
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

    const { data: clientsData } = useClients(1, 100)
    const clients = clientsData?.data?.data || []
    const createTrip = useCreateTrip(userId || '')

    const selectedClient = clients.find(c => c.id === formData.client_id)

    const handleSubmit = async () => {
        if (!formData.client_id || !formData.departure_city || !formData.departure_date ||
            !formData.destination_city || !formData.destination_date) {
            Alert.alert('Required Fields', 'Please fill in all required fields')
            return
        }

        try {
            await createTrip.mutateAsync(formData)
            Alert.alert('Success', 'Trip created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error) {
            Alert.alert('Error', 'Failed to create trip. Please try again.')
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
        }
        setShowDatePicker(null)
    }

    const openDatePicker = (type: 'departure' | 'destination') => {
        const currentDate = type === 'departure'
            ? (formData.departure_date ? new Date(formData.departure_date) : new Date())
            : (formData.destination_date ? new Date(formData.destination_date) : new Date())
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
                    <Text style={styles.headerTitle}>New Trip</Text>
                    <Text style={styles.headerSubtitle}>Add a new travel itinerary</Text>
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
                    disabled={createTrip.isPending}
                >
                    <LinearGradient
                        colors={['#047857', '#065F46']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.submitGradient}
                    >
                        {createTrip.isPending ? (
                            <BouncingBallsLoader color="#fff" size={8} />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                <Text style={styles.submitText}>Create Trip</Text>
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
                                                    // Fix: Set date to 1 to avoid month overflow (e.g. Jan 31 -> Feb -> Mar)
                                                    const newViewDate = new Date(viewDate)
                                                    newViewDate.setDate(1)
                                                    newViewDate.setMonth(i)
                                                    setViewDate(newViewDate)

                                                    // Update tempDate, clamping day if necessary
                                                    const newTempDate = new Date(tempDate)
                                                    const currentDay = newTempDate.getDate()
                                                    // Set to 1st of target month/year first
                                                    newTempDate.setFullYear(viewDate.getFullYear(), i, 1)
                                                    // Get max days in target month
                                                    const daysInMonth = new Date(viewDate.getFullYear(), i + 1, 0).getDate()
                                                    // Restore day, clamped to max days
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
                                                    // Fix: Handle leap year overflow for viewDate
                                                    const newViewDate = new Date(viewDate)
                                                    newViewDate.setDate(1) // Safe day
                                                    newViewDate.setFullYear(year)
                                                    setViewDate(newViewDate)

                                                    // Update tempDate, handling leap year (Feb 29 -> Feb 28)
                                                    const newTempDate = new Date(tempDate)
                                                    const currentMonth = newTempDate.getMonth()
                                                    const currentDay = newTempDate.getDate()

                                                    newTempDate.setFullYear(year)
                                                    // Check if month changed due to overflow (e.g. Feb 29 -> Mar 1)
                                                    if (newTempDate.getMonth() !== currentMonth) {
                                                        newTempDate.setDate(0) // Go back to last day of previous month (Feb 28/29)
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
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    submitButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#047857',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
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
    // Date Input Styles
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    dateCardMonth: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    dateCardMonthSelected: {
        color: 'rgba(255,255,255,0.9)',
    },
    // Time Selection Styles
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
    // New Date Picker Styles
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
})

