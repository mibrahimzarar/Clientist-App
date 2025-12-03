import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useSPLeads } from '../../../hooks/useServiceProvider'
import { SPLeadStatus } from '../../../types/serviceProvider'

export function LeadsWidget() {
    const { data: leadsResponse, isLoading } = useSPLeads()

    const leads = leadsResponse?.data || []

    const handleLeadPress = (leadId: string) => {
        router.push(`/(verticals)/service-provider/leads/${leadId}`)
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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Recent Leads</Text>
                    <Text style={styles.subtitle}>{leads.length} potential clients</Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#F59E0B" />
                    </View>
                ) : leads.length > 0 ? (
                    <View>
                        {leads.slice(0, 5).map((lead) => (
                            <TouchableOpacity
                                key={lead.id}
                                style={styles.leadCard}
                                onPress={() => handleLeadPress(lead.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(lead.status) }]} />
                                <View style={styles.leadContent}>
                                    <View style={styles.leadHeader}>
                                        <Text style={styles.leadName}>{lead.full_name}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(lead.status)}20` }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(lead.status) }]}>
                                                {lead.status.replace(/_/g, ' ')}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.leadInfo}>
                                        {lead.phone && (
                                            <View style={styles.infoRow}>
                                                <Ionicons name="call-outline" size={14} color="#6B7280" />
                                                <Text style={styles.infoText}>{lead.phone}</Text>
                                            </View>
                                        )}
                                        {lead.service_interested && (
                                            <View style={styles.infoRow}>
                                                <Ionicons name="construct-outline" size={14} color="#6B7280" />
                                                <Text style={styles.infoText}>{lead.service_interested}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                        {leads.length > 5 && (
                            <TouchableOpacity
                                style={styles.viewAllButton}
                                onPress={() => router.push('/(verticals)/service-provider/leads')}
                            >
                                <Text style={styles.viewAllText}>View All Leads ({leads.length})</Text>
                                <Ionicons name="arrow-forward" size={16} color="#F59E0B" />
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No leads yet</Text>
                        <Text style={styles.emptySubtext}>Add your first lead to get started</Text>
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    content: {
        paddingHorizontal: 20,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    leadCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statusIndicator: {
        width: 4,
    },
    leadContent: {
        flex: 1,
        padding: 12,
    },
    leadHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    leadName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    leadInfo: {
        gap: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 13,
        color: '#6B7280',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 4,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 4,
        paddingVertical: 10,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F59E0B',
    },
})

