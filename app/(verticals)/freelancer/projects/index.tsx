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
import { useFreelancerProjects } from '../../../../src/hooks/useFreelancer'
import { FreelancerProject, ProjectStatus } from '../../../../src/types/freelancer'

export default function FreelancerProjectsList() {
    const insets = useSafeAreaInsets()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | undefined>()
    const [showFilters, setShowFilters] = useState(false)

    const { data, isLoading, refetch } = useFreelancerProjects()

    // Client-side filtering for mock data
    const allProjects = data?.data?.data || []
    const projects = allProjects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter ? project.status === statusFilter : true
        return matchesSearch && matchesStatus
    })

    if (isLoading && !projects.length) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <BouncingBallsLoader size={12} color="#8B5CF6" />
            </View>
        )
    }

    const getStatusColor = (status: ProjectStatus): [string, string] => {
        switch (status) {
            case 'in_progress': return ['#8B5CF6', '#7C3AED']
            case 'pending_feedback': return ['#F59E0B', '#D97706']
            case 'completed': return ['#10B981', '#059669']
            case 'draft': return ['#9CA3AF', '#6B7280']
            default: return ['#6B7280', '#4B5563']
        }
    }

    const MemoizedProjectCard = React.memo(({ item, onPress }: { item: FreelancerProject, onPress: (id: string) => void }) => (
        <TouchableOpacity
            style={styles.projectCard}
            onPress={() => onPress(item.id)}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={getStatusColor(item.status)}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.statusBar}
            />

            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <View style={styles.projectInfo}>
                        <Text style={styles.projectTitle}>{item.title}</Text>
                        <Text style={styles.clientName}>{item.client?.full_name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status)[0] + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status)[0] }]}>
                            {item.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Ionicons name="pricetag-outline" size={14} color="#6B7280" />
                        <Text style={styles.detailText}>{item.project_type}</Text>
                    </View>
                    {item.deadline && (
                        <View style={styles.detailItem}>
                            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                            <Text style={styles.detailText}>Due: {item.deadline}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.priorityBadge}>
                        <Ionicons name="flag" size={12} color={item.priority === 'urgent' ? '#EF4444' : '#6B7280'} />
                        <Text style={[styles.priorityText, item.priority === 'urgent' && { color: '#EF4444' }]}>
                            {item.priority}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
            </View>
        </TouchableOpacity>
    ))

    return (
        <View style={styles.container}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Projects</Text>
                        <Text style={styles.headerSubtitle}>
                            {projects.length} active projects
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push('/(verticals)/freelancer/projects/new')}
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
                            placeholder="Search projects..."
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
                        <Ionicons name="options" size={20} color={showFilters ? '#8B5CF6' : '#6B7280'} />
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
                        {(['in_progress', 'pending_feedback', 'completed', 'draft'] as ProjectStatus[]).map((status) => (
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

            {/* Projects List */}
            <FlatList
                data={projects}
                renderItem={({ item }) => (
                    <MemoizedProjectCard
                        item={item}
                        onPress={(id) => router.push(`/(verticals)/freelancer/projects/${id}` as any)}
                    />
                )}
                keyExtractor={(item) => item.id}
                initialNumToRender={8}
                windowSize={5}
                removeClippedSubviews={true}
                maxToRenderPerBatch={8}
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
        shadowColor: '#8B5CF6',
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
        backgroundColor: '#F3E8FF',
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
        backgroundColor: '#8B5CF6',
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    projectCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    statusBar: {
        height: 4,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
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
    projectInfo: {
        flex: 1,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    clientName: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: '#4B5563',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    priorityText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
})
