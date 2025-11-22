import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    Platform,
} from 'react-native'
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
                            <ActivityIndicator color="#fff" />
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
                            <Text style={styles.modalTitle}>
                                {showDatePicker === 'departure' ? 'Departure Date & Time' : 'Arrival Date & Time'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                                <Ionicons name="close-circle" size={28} color="#fff" />
                            </TouchableOpacity>
                        </LinearGradient>

                        <View style={styles.datePickerContainer}>
                            {/* Date Selection - Horizontal Scroll */}
                            <View style={styles.dateSection}>
                                <Text style={styles.sectionLabel}>Select Date</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.dateScrollContainer}
                                    snapToInterval={100}
                                    decelerationRate="fast"
                                >
                                    {Array.from({ length: 60 }, (_, i) => {
                                        const date = new Date()
                                        date.setDate(date.getDate() + i - 7)
                                        const isSelected = date.toDateString() === tempDate.toDateString()
                                        return (
                                            <TouchableOpacity
                                                key={i}
                                                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                                                onPress={() => {
                                                    const newDate = new Date(tempDate)
                                                    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
                                                    setTempDate(newDate)
                                                }}
                                            >
                                                <Text style={[styles.dateCardDay, isSelected && styles.dateCardDaySelected]}>
                                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                </Text>
                                                <Text style={[styles.dateCardDate, isSelected && styles.dateCardDateSelected]}>
                                                    {date.getDate()}
                                                </Text>
                                                <Text style={[styles.dateCardMonth, isSelected && styles.dateCardMonthSelected]}>
                                                    {date.toLocaleDateString('en-US', { month: 'short' })}
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
        marginBottom: 24,
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
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 4,
    },
    dateCardDaySelected: {
        color: 'rgba(255,255,255,0.8)',
    },
    dateCardDate: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    dateCardDateSelected: {
        color: '#fff',
    },
    dateCardMonth: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
    dateCardMonthSelected: {
        color: 'rgba(255,255,255,0.8)',
    },
    timeSection: {
        marginBottom: 24,
    },
    timeGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    timeColumn: {
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    timeScroll: {
        height: 200,
        width: 80,
    },
    timeItem: {
        height: 50,
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    timeItemSelected: {
        backgroundColor: '#047857',
        borderColor: '#047857',
    },
    timeItemText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    timeItemTextSelected: {
        color: '#fff',
        fontWeight: '700',
    },
    timeSeparator: {
        fontSize: 28,
        fontWeight: '700',
        color: '#047857',
        marginTop: 24,
    },
    modalActions: {
        flexDirection: 'row',
        padding: 24,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    confirmButton: {
        flex: 1,
        borderRadius: 12,
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
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
})
