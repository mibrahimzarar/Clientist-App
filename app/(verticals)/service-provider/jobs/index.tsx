import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSPJobs } from '../../../../src/hooks/useServiceProvider'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { SPJob, SPJobStatus } from '../../../../src/types/serviceProvider'
import { useAuth } from '../../../../src/context/AuthContext'

export default function JobsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<SPJobStatus | 'all'>('all')
    const { data: jobsData, isLoading } = useSPJobs()
    const { currency } = useAuth()

    const jobs = jobsData?.data || []

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.client?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' || job.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: SPJobStatus) => {
        switch (status) {
            case 'in_progress': return '#F59E0B'
            case 'completed': return '#10B981'
            case 'pending_payment': return '#EF4444'
            case 'cancelled': return '#6B7280'
            default: return '#6B7280'
        }
    }

    const getStatusIcon = (status: SPJobStatus) => {
        switch (status) {
            case 'in_progress': return 'construct'
            case 'completed': return 'checkmark-circle'
            case 'pending_payment': return 'card'
            case 'cancelled': return 'close-circle'
            default: return 'ellipse'
        }
    }

    const statusFilters: { label: string; value: SPJobStatus | 'all' }[] = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Pending Payment', value: 'pending_payment' },
        { label: 'Cancelled', value: 'cancelled' },
    ]

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <BouncingBallsLoader size={12} color="#3B82F6" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Jobs</Text>
                        <Text style={styles.headerSubtitle}>{filteredJobs.length} jobs</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push('/(verticals)/service-provider/jobs/new')}
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
                            placeholder="Search jobs..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </LinearGradient>

            {/* Status Filters */}
            <View style={styles.filtersSection}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                >
                    {statusFilters.map((filter) => {
                        const count = filter.value === 'all' 
                            ? jobs.length 
                            : jobs.filter(j => j.status === filter.value).length
                        
                        return (
                            <TouchableOpacity
                                key={filter.value}
                                style={[
                                    styles.filterChip,
                                    filterStatus === filter.value && styles.filterChipActive
                                ]}
                                onPress={() => setFilterStatus(filter.value)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.filterChipText,
                                    filterStatus === filter.value && styles.filterChipTextActive
                                ]}>
                                    {filter.label}
                                </Text>
                                {count > 0 && (
                                    <View style={[
                                        styles.filterBadge,
                                        filterStatus === filter.value && styles.filterBadgeActive
                                    ]}>
                                        <Text style={[
                                            styles.filterBadgeText,
                                            filterStatus === filter.value && styles.filterBadgeTextActive
                                        ]}>
                                            {count}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>

            {/* Jobs List */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {filteredJobs.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="construct-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No jobs found</Text>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'Try adjusting your search' : 'Create your first job to get started'}
                        </Text>
                        {!searchQuery && (
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => router.push('/(verticals)/service-provider/jobs/new')}
                            >
                                <LinearGradient
                                    colors={['#3B82F6', '#2563EB']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.emptyButtonGradient}
                                >
                                    <Ionicons name="add-circle" size={20} color="#fff" />
                                    <Text style={styles.emptyButtonText}>Create Job</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    filteredJobs.map((job) => (
                        <TouchableOpacity
                            key={job.id}
                            style={styles.jobCard}
                            onPress={() => router.push(`/(verticals)/service-provider/jobs/${job.id}` as any)}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={[getStatusColor(job.status), getStatusColor(job.status) + 'CC']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={styles.jobStatusBar}
                            />
                            
                            <View style={styles.jobContent}>
                                <View style={styles.jobHeader}>
                                    <View style={styles.jobTitleRow}>
                                        <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                                        {job.is_urgent && (
                                            <View style={styles.urgentBadge}>
                                                <Ionicons name="alert-circle" size={14} color="#EF4444" />
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.jobClient} numberOfLines={1}>
                                        <Ionicons name="person-outline" size={14} color="#6B7280" />
                                        {' '}{job.client?.full_name}
                                    </Text>
                                </View>

                                <View style={styles.jobMeta}>
                                    <View style={[styles.statusChip, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                                        <Ionicons name={getStatusIcon(job.status)} size={14} color={getStatusColor(job.status)} />
                                        <Text style={[styles.statusChipText, { color: getStatusColor(job.status) }]}>
                                            {job.status === 'in_progress' ? 'Pending' : job.status.replace('_', ' ')}
                                        </Text>
                                    </View>
                                    
                                    {job.scheduled_date && (
                                        <View style={styles.metaItem}>
                                            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                                            <Text style={styles.metaText}>
                                                {new Date(job.scheduled_date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    )}
                                    
                                    {job.job_price && (
                                        <View style={styles.metaItem}>
                                            <Ionicons name="cash-outline" size={14} color="#10B981" />
                                            <Text style={[styles.metaText, { color: '#10B981', fontWeight: '600' }]}>
                                                {currency} {job.job_price.toLocaleString()}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                            </View>

                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" style={styles.chevron} />
                        </TouchableOpacity>
                    ))
                )}
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
        paddingBottom: 20,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginBottom: 8,
    },
    searchBar: {
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
    filtersSection: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    filtersContainer: {
        paddingHorizontal: 20,
        gap: 10,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    filterChipActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    filterBadge: {
        backgroundColor: '#E5E7EB',
        borderRadius: 10,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    filterBadgeActive: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    filterBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#374151',
    },
    filterBadgeTextActive: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    jobCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    jobStatusBar: {
        width: 5,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    jobContent: {
        flex: 1,
        padding: 16,
    },
    jobHeader: {
        marginBottom: 12,
    },
    jobTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    urgentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        gap: 2,
    },
    urgentText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#EF4444',
    },
    jobClient: {
        fontSize: 14,
        color: '#6B7280',
    },
    jobMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#F3E8FF',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8B5CF6',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#111827',
        marginTop: 24,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        gap: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    statusChipText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    chevron: {
        marginLeft: 8,
    },
})
