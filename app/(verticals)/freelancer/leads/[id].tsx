import React, { useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFreelancerLead } from '../../../../src/hooks/useFreelancer'

export default function FreelancerLeadDetailScreen() {
    const insets = useSafeAreaInsets()
    const { id } = useLocalSearchParams()
    const [noteInput, setNoteInput] = useState('')

    const { data: leadData, isLoading } = useFreelancerLead(id as string)
    const lead = leadData?.data

    const getStatusColor = (status: string): [string, string] => {
        switch (status) {
            case 'potential': return ['#6B7280', '#4B5563']
            case 'hot': return ['#EF4444', '#DC2626']
            case 'cold': return ['#3B82F6', '#2563EB']
            case 'converted': return ['#10B981', '#059669']
            case 'call_later': return ['#F59E0B', '#D97706']
            default: return ['#6B7280', '#4B5563']
        }
    }

    const handleDelete = async () => {
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
                            // TODO: Implement delete mutation
                            router.back()
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete lead')
                        }
                    }
                }
            ]
        )
    }

    if (isLoading || !lead) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F59E0B" />
            </View>
        )
    }

    const colors = getStatusColor(lead.status)

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={colors} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => router.push(`/(verticals)/freelancer/leads/${id}/edit` as any)} style={styles.headerButton}>
                            <Ionicons name="create" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                            <Ionicons name="trash" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.headerTitle}>{lead.full_name}</Text>
                <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>{lead.status.replace('_', ' ')}</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Contact Info Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Contact Information</Text>

                    {lead.email && (
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="mail" size={20} color="#F59E0B" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{lead.email}</Text>
                            </View>
                        </View>
                    )}

                    {lead.phone && (
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="call" size={20} color="#F59E0B" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Phone</Text>
                                <Text style={styles.infoValue}>{lead.phone}</Text>
                            </View>
                        </View>
                    )}

                    {lead.company && (
                        <View style={styles.infoRow}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="business" size={20} color="#F59E0B" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Company</Text>
                                <Text style={styles.infoValue}>{lead.company}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Lead Details Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Lead Details</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <View style={[styles.statusBadge, { backgroundColor: colors[0] + '20' }]}>
                            <Text style={[styles.statusText, { color: colors[0] }]}>
                                {lead.status.replace('_', ' ')}
                            </Text>
                        </View>
                    </View>

                    {lead.next_follow_up && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Next Follow-up</Text>
                            <View style={styles.detailValue}>
                                <Ionicons name="calendar" size={16} color="#6B7280" />
                                <Text style={styles.detailText}>{lead.next_follow_up}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Notes Section */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Notes</Text>

                    <View style={styles.noteInputContainer}>
                        <TextInput
                            style={styles.noteInput}
                            value={noteInput}
                            onChangeText={setNoteInput}
                            placeholder="Add a note..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.addNoteButton, !noteInput.trim() && styles.addNoteButtonDisabled]}
                            disabled={!noteInput.trim()}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
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
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 12,
    },
    headerBadge: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    headerBadgeText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
        textTransform: 'capitalize',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
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
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    detailValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    noteInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    noteInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#111827',
        minHeight: 44,
        maxHeight: 100,
    },
    addNoteButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F59E0B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addNoteButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
})
