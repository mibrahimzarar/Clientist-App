import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFreelancerLead, useUpdateLead } from '../../../../../src/hooks/useFreelancer'
import { LeadStatus } from '../../../../../src/types/freelancer'
import { DatePickerInput } from '../../../../../src/components/ui/DatePickerInput'

export default function EditLeadPage() {
    const { id } = useLocalSearchParams()
    const { data: leadData, isLoading } = useFreelancerLead(id as string)
    const updateMutation = useUpdateLead()
    
    const [formData, setFormData] = useState({
        full_name: '',
        company: '',
        email: '',
        phone_number: '',
        source: '',
        status: 'potential' as LeadStatus,
        notes: '',
        next_follow_up: '',
    })

    useEffect(() => {
        if (leadData?.data) {
            const lead = leadData.data
            setFormData({
                full_name: lead.full_name || '',
                company: lead.company || '',
                email: lead.email || '',
                phone_number: lead.phone_number || '',
                source: lead.source || '',
                status: lead.status || 'potential',
                notes: lead.notes || '',
                next_follow_up: lead.next_follow_up || '',
            })
        }
    }, [leadData])

    const handleSubmit = async () => {
        if (!formData.full_name) {
            Alert.alert('Error', 'Full Name is required')
            return
        }

        try {
            await updateMutation.mutateAsync({
                id: id as string,
                updates: formData
            })
            Alert.alert('Success', 'Lead updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error) {
            Alert.alert('Error', 'Failed to update lead')
            console.error(error)
        }
    }

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#F59E0B" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Lead</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.full_name}
                            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                            placeholder="e.g. John Doe"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Company</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.company}
                            onChangeText={(text) => setFormData({ ...formData, company: text })}
                            placeholder="e.g. Acme Corp"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="e.g. john@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.phone_number}
                            onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                            placeholder="e.g. +1 234 567 890"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Source</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.source}
                            onChangeText={(text) => setFormData({ ...formData, source: text })}
                            placeholder="e.g. LinkedIn, Referral"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.statusContainer}>
                            {(['potential', 'hot', 'cold', 'call_later'] as LeadStatus[]).map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusChip,
                                        formData.status === status && styles.statusChipActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, status })}
                                >
                                    <Text style={[
                                        styles.statusText,
                                        formData.status === status && styles.statusTextActive
                                    ]}>
                                        {status.replace('_', ' ')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <DatePickerInput
                        label="Next Follow-up"
                        value={formData.next_follow_up}
                        onChange={(date) => setFormData({ ...formData, next_follow_up: date })}
                        placeholder="Select follow-up date"
                    />

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.notes}
                            onChangeText={(text) => setFormData({ ...formData, notes: text })}
                            placeholder="Add notes..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={updateMutation.isPending}
                >
                    {updateMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Update Lead</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        minHeight: 100,
    },
    statusContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statusChipActive: {
        backgroundColor: '#F59E0B',
        borderColor: '#F59E0B',
    },
    statusText: {
        fontSize: 14,
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    statusTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#F59E0B',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
})
