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
    Platform,
    KeyboardAvoidingView
} from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSPLead, useUpdateSPLead } from '../../../../../src/hooks/useServiceProvider'
import { SPLeadStatus, SPLeadSource } from '../../../../../src/types/serviceProvider'
import DateTimePicker from '@react-native-community/datetimepicker'

export default function EditLeadScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const insets = useSafeAreaInsets()
    
    const { data: leadData, isLoading: leadLoading } = useSPLead(id)
    const updateLeadMutation = useUpdateSPLead()

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        whatsapp: '',
        email: '',
        source: 'phone_call' as SPLeadSource,
        status: 'new_lead' as SPLeadStatus,
        service_interested: '',
        next_follow_up: new Date(),
        notes: ''
    })

    useEffect(() => {
        if (leadData?.data) {
            const lead = leadData.data
            setFormData({
                full_name: lead.full_name || '',
                phone: lead.phone || '',
                whatsapp: lead.whatsapp || '',
                email: lead.email || '',
                source: lead.source || 'phone_call',
                status: lead.status || 'new_lead',
                service_interested: lead.service_interested || '',
                next_follow_up: lead.next_follow_up ? new Date(lead.next_follow_up) : new Date(),
                notes: lead.notes || ''
            })
        }
    }, [leadData])

    const handleSave = async () => {
        if (!formData.full_name.trim() || !formData.phone.trim()) {
            Alert.alert('Error', 'Please fill in required fields (Name and Phone)')
            return
        }

        try {
            await updateLeadMutation.mutateAsync({
                id,
                updates: {
                    ...formData,
                    next_follow_up: formData.next_follow_up.toISOString()
                }
            })
            router.back()
        } catch (error) {
            Alert.alert('Error', 'Failed to update lead')
        }
    }

    const sources: { label: string; value: SPLeadSource }[] = [
        { label: 'Phone Call', value: 'phone_call' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Referral', value: 'referral' },
        { label: 'Website', value: 'website' },
        { label: 'Other', value: 'other' },
    ]

    const statuses: { label: string; value: SPLeadStatus; color: string }[] = [
        { label: 'New Lead', value: 'new_lead', color: '#F59E0B' },
        { label: 'Hot Lead', value: 'hot_lead', color: '#EF4444' },
        { label: 'Call Later', value: 'call_later', color: '#6B7280' },
        { label: 'Price Requested', value: 'price_requested', color: '#8B5CF6' },
        { label: 'Converted', value: 'closed_converted', color: '#10B981' },
        { label: 'Lost', value: 'lost', color: '#9CA3AF' },
    ]

    if (leadLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <Stack.Screen
                options={{
                    headerTitle: 'Edit Lead',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
                            <Ionicons name="arrow-back" size={24} color="#6366F1" />
                            <Text style={{ color: '#6366F1', fontSize: 16, marginLeft: 4 }}>Cancel</Text>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                            <Ionicons name="close-circle-outline" size={28} color="#6B7280" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView style={styles.content} contentContainerStyle={{ paddingTop: 44 }} showsVerticalScrollIndicator={false}>
                {/* Basic Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.full_name}
                            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                            placeholder="Enter full name"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.phone}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            placeholder="Enter phone number"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>WhatsApp</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.whatsapp}
                            onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
                            placeholder="WhatsApp number (optional)"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="Email address (optional)"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lead Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Service Interested In</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.service_interested}
                            onChangeText={(text) => setFormData({ ...formData, service_interested: text })}
                            placeholder="e.g. AC Repair, Installation"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                {/* Source */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lead Source</Text>
                    <View style={styles.optionsGrid}>
                        {sources.map((source) => (
                            <TouchableOpacity
                                key={source.value}
                                style={[
                                    styles.optionButton,
                                    formData.source === source.value && styles.optionButtonActive
                                ]}
                                onPress={() => setFormData({ ...formData, source: source.value })}
                            >
                                <Text style={[
                                    styles.optionText,
                                    formData.source === source.value && styles.optionTextActive
                                ]}>
                                    {source.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lead Status</Text>
                    <View style={styles.optionsGrid}>
                        {statuses.map((status) => (
                            <TouchableOpacity
                                key={status.value}
                                style={[
                                    styles.statusButton,
                                    formData.status === status.value && {
                                        backgroundColor: `${status.color}20`,
                                        borderColor: status.color
                                    }
                                ]}
                                onPress={() => setFormData({ ...formData, status: status.value })}
                            >
                                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                                <Text style={[
                                    styles.statusButtonText,
                                    formData.status === status.value && { color: status.color, fontWeight: '600' }
                                ]}>
                                    {status.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Follow Up */}
                <View style={styles.section}>
                    <DatePickerInput
                        label="Follow Up Date"
                        value={formData.next_follow_up}
                        onChange={(date) => setFormData({ ...formData, next_follow_up: date })}
                    />
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity 
                        style={[styles.saveButton, { backgroundColor: '#F3F4F6', flex: 1, borderWidth: 1, borderColor: '#E5E7EB' }]}
                        onPress={() => router.back()}
                    >
                        <View style={styles.saveButtonContent}>
                            <Text style={[styles.saveButtonText, { color: '#374151' }]}>Cancel</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.saveButton, { flex: 2 }]}
                        onPress={handleSave}
                        disabled={updateLeadMutation.isPending}
                    >
                        <View style={styles.saveButtonContent}>
                            {updateLeadMutation.isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

function DatePickerInput({ label, value, onChange }: { label: string, value: Date, onChange: (date: Date) => void }) {
    const [show, setShow] = useState(false)

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity onPress={() => setShow(true)} style={styles.dateButton}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.dateText}>
                    {value.toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </Text>
            </TouchableOpacity>
            {show && (
                <DateTimePicker
                    value={value}
                    mode="date"
                    onChange={(event, date) => {
                        setShow(false)
                        if (date) onChange(date)
                    }}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
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
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    optionButtonActive: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
    },
    optionText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    optionTextActive: {
        color: '#F59E0B',
        fontWeight: '600',
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusButtonText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 10,
    },
    dateText: {
        fontSize: 15,
        color: '#111827',
        flex: 1,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    saveButton: {
        backgroundColor: '#6366F1',
        borderRadius: 12,
        overflow: 'hidden',
    },
    saveButtonContent: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
})
