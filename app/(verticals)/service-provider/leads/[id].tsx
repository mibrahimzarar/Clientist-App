import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { Stack, useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSPLead, useUpdateSPLead, useConvertSPLeadToClient, useDeleteSPLead } from '../../../../src/hooks/useServiceProvider'
import { SPLeadStatus } from '../../../../src/types/serviceProvider'
import { LinearGradient } from 'expo-linear-gradient'

export default function LeadDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const insets = useSafeAreaInsets()
    const [noteContent, setNoteContent] = useState('')

    const { data: leadData, isLoading: leadLoading, refetch: refetchLead } = useSPLead(id)
    const updateLeadMutation = useUpdateSPLead()
    const convertMutation = useConvertSPLeadToClient()
    const deleteMutation = useDeleteSPLead()

    const lead = leadData?.data

    const handleAddNote = async () => {
        if (!noteContent.trim()) return

        try {
            const currentNotes = lead?.notes || ''
            const newNote = `\n[${new Date().toLocaleString()}] ${noteContent.trim()}`
            const updatedNotes = currentNotes + newNote

            await updateLeadMutation.mutateAsync({
                id,
                updates: { notes: updatedNotes }
            })
            setNoteContent('')
            refetchLead()
        } catch (error) {
            Alert.alert('Error', 'Failed to add note')
        }
    }

    const handleDelete = () => {
        Alert.alert(
            'Delete Lead',
            'Are you sure you want to delete this lead? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMutation.mutateAsync(id)
                            router.back()
                        } catch (error: any) {
                            Alert.alert('Error', error?.message || 'Failed to delete lead')
                        }
                    }
                }
            ]
        )
    }

    const handleConvert = () => {
        Alert.alert(
            'Convert to Client',
            'This will create a new client profile from this lead. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Convert',
                    onPress: async () => {
                        try {
                            // Basic client data from lead
                            const clientData = {
                                full_name: lead?.full_name || '',
                                phone_number: lead?.phone || '',
                                email: lead?.email || '',
                                notes: lead?.notes || '',
                                status: 'active' as const
                            }
                            
                            await convertMutation.mutateAsync({ leadId: id, clientData })
                            Alert.alert('Success', 'Lead converted to client successfully', [
                                { text: 'OK', onPress: () => router.back() }
                            ])
                        } catch (error) {
                            Alert.alert('Error', 'Failed to convert lead')
                        }
                    }
                }
            ]
        )
    }

    const getStatusColor = (status: SPLeadStatus) => {
        switch (status) {
            case 'new_lead': return '#F59E0B'
            case 'call_later': return '#6B7280'
            case 'hot_lead': return '#EF4444'
            case 'price_requested': return '#8B5CF6'
            case 'closed_converted': return '#10B981'
            case 'lost': return '#9CA3AF'
            default: return '#6B7280'
        }
    }

    if (leadLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        )
    }

    if (!lead) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Lead not found</Text>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View style={{ paddingTop: insets.top, backgroundColor: '#6366F1' }}>
                <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
                <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    height: 56
                }}>
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        style={{ flexDirection: 'row', alignItems: 'center', padding: 4 }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 16, marginLeft: 4, fontWeight: '600' }}>Back</Text>
                    </TouchableOpacity>

                    <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>Lead Details</Text>

                    <View style={{ flexDirection: 'row', gap: 16 }}>
                            <TouchableOpacity onPress={() => router.push(`/service-provider/leads/edit/${id}`)}>
                            <Ionicons name="create-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete}>
                            <Ionicons name="trash-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <View style={styles.headerRow}>
                        <View style={styles.avatarContainer}>
                             <Text style={styles.avatarText}>
                                {lead.full_name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.name}>{lead.full_name}</Text>
                            <View style={styles.statusContainer}>
                                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(lead.status)}20` }]}>
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(lead.status) }]} />
                                    <Text style={[styles.statusText, { color: getStatusColor(lead.status) }]}>
                                        {lead.status.replace('_', ' ')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        {lead.phone && (
                             <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="call" size={20} color="#6366F1" />
                                <Text style={styles.actionButtonText}>Call</Text>
                            </TouchableOpacity>
                        )}
                        {lead.whatsapp && (
                             <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="logo-whatsapp" size={20} color="#10B981" />
                                <Text style={styles.actionButtonText}>WhatsApp</Text>
                            </TouchableOpacity>
                        )}
                        {lead.status !== 'closed_converted' && (
                             <TouchableOpacity 
                                style={[styles.actionButton, styles.convertButton]}
                                onPress={handleConvert}
                                disabled={convertMutation.isPending}
                            >
                                {convertMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>Convert</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Info Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Info</Text>
                    <View style={styles.card}>
                        {lead.phone && (
                            <View style={styles.infoRow}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="call-outline" size={20} color="#6B7280" />
                                </View>
                                <View>
                                    <Text style={styles.infoLabel}>Phone</Text>
                                    <Text style={styles.infoValue}>{lead.phone}</Text>
                                </View>
                            </View>
                        )}
                        {lead.email && (
                            <View style={styles.infoRow}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="mail-outline" size={20} color="#6B7280" />
                                </View>
                                <View>
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={styles.infoValue}>{lead.email}</Text>
                                </View>
                            </View>
                        )}
                        {lead.source && (
                            <View style={styles.infoRow}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="globe-outline" size={20} color="#6B7280" />
                                </View>
                                <View>
                                    <Text style={styles.infoLabel}>Source</Text>
                                    <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>
                                        {lead.source.replace('_', ' ')}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lead Details</Text>
                    <View style={styles.card}>
                         {lead.service_interested && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Interested In</Text>
                                <Text style={styles.detailValue}>{lead.service_interested}</Text>
                            </View>
                        )}
                        
                        {lead.expected_value && (
                             <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Expected Value</Text>
                                <Text style={styles.detailValue}>${lead.expected_value}</Text>
                            </View>
                        )}

                        {lead.next_follow_up && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Next Follow Up</Text>
                                <View style={styles.dateBadge}>
                                    <Ionicons name="calendar-outline" size={14} color="#6366F1" />
                                    <Text style={styles.dateText}>
                                        {new Date(lead.next_follow_up).toLocaleDateString(undefined, {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Notes Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes & Activity</Text>
                    <View style={styles.card}>
                        {lead.notes ? (
                            <Text style={styles.noteContent}>{lead.notes}</Text>
                        ) : (
                            <Text style={styles.emptyNotesText}>No notes yet</Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Add Note Input */}
            <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a note..."
                    value={noteContent}
                    onChangeText={setNoteContent}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, !noteContent.trim() && styles.sendButtonDisabled]}
                    onPress={handleAddNote}
                    disabled={!noteContent.trim() || updateLeadMutation.isPending}
                >
                    {updateLeadMutation.isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="send" size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
    },
    content: {
        flex: 1,
        padding: 16,
        paddingTop: 52,
    },
    headerCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#6366F1',
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    actionButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 16,
    },
    actionButton: {
        minWidth: '40%',
        flexGrow: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        gap: 8,
    },
    convertButton: {
        backgroundColor: '#6366F1',
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        color: '#6366F1',
        fontWeight: '500',
    },
    noteContent: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 22,
    },
    emptyNotesText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 16,
    },
    inputContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
})
