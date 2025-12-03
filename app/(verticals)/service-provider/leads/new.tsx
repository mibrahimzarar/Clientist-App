import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { Stack, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useCreateSPLead } from '../../../../src/hooks/useServiceProvider'
import { SPLeadStatus, SPLeadSource } from '../../../../src/types/serviceProvider'
import { DatePickerInput } from '../../../../src/components/ui/DatePickerInput'

export default function NewLeadScreen() {
    const createMutation = useCreateSPLead()

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        whatsapp: '',
        email: '',
        service_interested: '',
        source: 'phone_call' as SPLeadSource,
        status: 'new_lead' as SPLeadStatus,
        notes: '',
        expected_value: '',
        next_follow_up: '',
    })

    const handleSubmit = async () => {
        if (!formData.full_name.trim() || !formData.phone.trim()) {
            Alert.alert('Required Fields', 'Please enter at least name and phone number')
            return
        }

        try {
            const leadData: any = {
                full_name: formData.full_name,
                phone: formData.phone,
                whatsapp: formData.whatsapp || formData.phone,
                email: formData.email || undefined,
                service_interested: formData.service_interested || undefined,
                source: formData.source,
                status: formData.status,
                notes: formData.notes || undefined,
                expected_value: formData.expected_value ? parseFloat(formData.expected_value) : undefined,
                next_follow_up: formData.next_follow_up || undefined,
            }

            await createMutation.mutateAsync(leadData)
            Alert.alert('Success', 'Lead created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error) {
            Alert.alert('Error', 'Failed to create lead')
        }
    }

    const sources: { label: string; value: SPLeadSource; icon: string }[] = [
        { label: 'Phone Call', value: 'phone_call', icon: 'call' },
        { label: 'WhatsApp', value: 'whatsapp', icon: 'logo-whatsapp' },
        { label: 'Referral', value: 'referral', icon: 'people' },
        { label: 'Website', value: 'website', icon: 'globe' },
        { label: 'Other', value: 'other', icon: 'help-circle' },
    ]

    const statuses: { label: string; value: SPLeadStatus; color: string }[] = [
        { label: 'New Lead', value: 'new_lead', color: '#F59E0B' },
        { label: 'Hot Lead', value: 'hot_lead', color: '#EF4444' },
        { label: 'Call Later', value: 'call_later', color: '#6B7280' },
    ]

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: 'Add New Lead',
                }}
            />

            <ScrollView style={styles.content} contentContainerStyle={{ paddingTop: 40 }} showsVerticalScrollIndicator={false}>
                {/* Basic Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

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

                {/* Service Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Service Interested In</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.service_interested}
                            onChangeText={(text) => setFormData({ ...formData, service_interested: text })}
                            placeholder="e.g., Plumbing, Electrical, AC Repair"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Expected Value</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.expected_value}
                            onChangeText={(text) => setFormData({ ...formData, expected_value: text })}
                            placeholder="Estimated job value"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Lead Source */}
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
                                <Ionicons
                                    name={source.icon as any}
                                    size={18}
                                    color={formData.source === source.value ? '#F59E0B' : '#6B7280'}
                                />
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
                        placeholder="Select follow up date"
                    />
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.notes}
                        onChangeText={(text) => setFormData({ ...formData, notes: text })}
                        placeholder="Add notes about this lead..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                    disabled={createMutation.isPending}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSubmit}
                    disabled={createMutation.isPending}
                >
                    <LinearGradient
                        colors={['#F59E0B', '#D97706']}
                        style={styles.saveButtonGradient}
                    >
                        {createMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark" size={20} color="#fff" />
                                <Text style={styles.saveButtonText}>Create Lead</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
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
    textArea: {
        minHeight: 100,
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
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
    },
    saveButton: {
        flex: 1,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
})
