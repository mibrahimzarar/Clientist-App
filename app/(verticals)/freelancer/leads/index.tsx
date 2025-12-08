import React, { useState } from 'react'
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    RefreshControl,
} from 'react-native'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFreelancerLeads } from '../../../../src/hooks/useFreelancer'
import { FreelancerLead, LeadStatus } from '../../../../src/types/freelancer'

export default function FreelancerLeadsList() {
    const insets = useSafeAreaInsets()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>()
    const [showFilters, setShowFilters] = useState(false)

    const { data, isLoading, refetch } = useFreelancerLeads()

    // Client-side filtering for mock data
    const allLeads = data?.data || []
    const leads = allLeads.filter(lead => {
        const matchesSearch = lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter ? lead.status === statusFilter : true
        return matchesSearch && matchesStatus
    })

    if (isLoading && !leads.length) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <BouncingBallsLoader size={12} color="#F59E0B" />
            </View>
        )
    }

    const getStatusColor = (status: LeadStatus): string => {
        switch (status) {
            case 'potential': return '#6B7280'
            case 'hot': return '#EF4444'
            case 'cold': return '#3B82F6'
            case 'converted': return '#10B981'
            case 'call_later': return '#F59E0B'
            default: return '#6B7280'
        }
    }

    const renderLeadItem = ({ item }: { item: FreelancerLead }) => (
        <TouchableOpacity
            style={styles.leadCard}
            onPress={() => router.push(`/(verticals)/freelancer/leads/${item.id}` as any)}
            activeOpacity={0.7}
        >
            <View style={[styles.statusStrip, { backgroundColor: getStatusColor(item.status) }]} />

            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.leadName}>{item.full_name}</Text>
                        {item.company && <Text style={styles.companyName}>{item.company}</Text>}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    {item.next_follow_up && (
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                            <Text style={styles.infoText}>Follow up: {item.next_follow_up}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardFooter}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="call-outline" size={18} color="#4B5563" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="logo-whatsapp" size={18} color="#4B5563" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                </View>
            </View>
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            {/* Header with Gradient */}
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
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Leads</Text>
                        <Text style={styles.headerSubtitle}>
                            {leads.length} potential clients
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push('/(verticals)/freelancer/leads/new' as any)}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#6B7280" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search leads..."
                            placeholderTextColor="#9CA3AF"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        {searchTerm.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchTerm('')}>
                                <Ionicons name="close-circle" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={[styles.filterButton, showFilters && styles.filterButtonActive]}
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <Ionicons name="options" size={20} color={showFilters ? '#F59E0B' : '#6B7280'} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Filters */}
            {showFilters && (
                <View style={styles.filtersContainer}>
                    <Text style={styles.filterLabel}>Status</Text>
                    <View style={styles.filterChips}>
                        <TouchableOpacity
                            style={[styles.filterChip, !statusFilter && styles.filterChipActive]}
                            onPress={() => setStatusFilter(undefined)}
                        >
                            <Text style={[styles.filterChipText, !statusFilter && styles.filterChipTextActive]}>
                                All
                            </Text>
                        </TouchableOpacity>
                        {(['potential', 'hot', 'cold', 'call_later'] as LeadStatus[]).map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
                                onPress={() => setStatusFilter(status)}
                            >
                                <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>
                                    {status.replace('_', ' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Leads List */}
            <FlatList
                data={leads}
                renderItem={renderLeadItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        marginBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    headerContent: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    addButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#111827',
    },
    filterButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#FEF3C7',
    },
    filtersContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    filterChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterChip: {
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    filterChipActive: {
        backgroundColor: '#F59E0B',
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    leadCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    statusStrip: {
        height: 4,
        width: '100%',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    leadName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    companyName: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    infoRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    convertButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B981',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    convertButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
})
