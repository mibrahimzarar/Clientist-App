import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Image,
} from 'react-native'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useClients } from '../../../../src/hooks/useTravelAgent'
import {
  TravelClient,
  ClientStatus,
  PackageType,
  PriorityTag,
  SearchFilters,
} from '../../../../src/types/travelAgent'

export default function TravelAgentClientsList() {
  const insets = useSafeAreaInsets()
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClientStatus | undefined>()
  const [packageFilter, setPackageFilter] = useState<PackageType | undefined>()
  const [priorityFilter, setPriorityFilter] = useState<PriorityTag | undefined>()
  const [showFilters, setShowFilters] = useState(false)

  const filters: SearchFilters = useMemo(() => ({
    search_term: searchTerm || undefined,
    status_filter: statusFilter,
    package_filter: packageFilter,
    priority_filter: priorityFilter,
  }), [searchTerm, statusFilter, packageFilter, priorityFilter])

  const { data, isLoading, isError, error, refetch } = useClients(page, 20, filters)

  const clients = data?.data?.data || []
  const totalPages = data?.data?.total_pages || 1

  if (isLoading && !clients.length) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <BouncingBallsLoader size={12} color="#4F46E5" />
      </View>
    )
  }

  const getStatusColor = (status: ClientStatus): [string, string] => {
    switch (status) {
      case 'in_progress': return ['#667EEA', '#5A67D8']
      case 'rejected': return ['#DC2626', '#B91C1C']
      case 'completed': return ['#059669', '#047857']
      default: return ['#6B7280', '#4B5563']
    }
  }

  const getPriorityColor = (priority: PriorityTag) => {
    switch (priority) {
      case 'urgent': return '#EF4444'
      case 'priority': return '#F59E0B'
      case 'vip': return '#8B5CF6'
      default: return '#10B981'
    }
  }

  const getPackageIcon = (packageType: PackageType) => {
    switch (packageType) {
      case 'umrah_package': return 'airplane'
      case 'tourist_visa': return 'document-text'
      case 'ticketing': return 'ticket'
      case 'visit_visa': return 'briefcase'
      default: return 'cube'
    }
  }

  const renderClientItem = ({ item }: { item: TravelClient }) => (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={() => router.push(`/(verticals)/travel-agent/clients/${item.id}`)}
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
          {/* Profile Picture */}
          <View style={styles.profilePictureContainer}>
            {item.profile_picture_url ? (
              <Image
                source={{ uri: item.profile_picture_url }}
                style={styles.profilePicture}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profileInitials}>
                  {item.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'NA'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{item.full_name}</Text>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={14} color="#6B7280" />
              <Text style={styles.contactText}>{item.phone_number}</Text>
            </View>
            {item.email && (
              <View style={styles.contactRow}>
                <Ionicons name="mail" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{item.email}</Text>
              </View>
            )}
          </View>

          <View style={styles.badges}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status)[0] }]}>
              <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
            </View>
            {item.priority_tag !== 'normal' && (
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority_tag) }]}>
                <Ionicons name="flag" size={10} color="#fff" />
                <Text style={styles.badgeText}>{item.priority_tag}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailChip}>
            <Ionicons name="location" size={16} color="#4F46E5" />
            <Text style={styles.detailText}>{item.country}</Text>
          </View>
          <View style={styles.detailChip}>
            <Ionicons name={getPackageIcon(item.package_type)} size={16} color="#4F46E5" />
            <Text style={styles.detailText}>{item.package_type.replace('_', ' ')}</Text>
          </View>
        </View>

        {item.notes && (
          <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="people-outline" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No clients found</Text>
      <Text style={styles.emptyText}>
        {searchTerm || statusFilter || packageFilter || priorityFilter
          ? 'Try adjusting your search or filters'
          : 'Start by adding your first client'}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/(verticals)/travel-agent/clients/new')}
      >
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Add Your First Client</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )

  if (isError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error loading clients</Text>
          <Text style={styles.errorText}>{error?.message || 'Something went wrong'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
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
            <Text style={styles.headerTitle}>Clients</Text>
            <Text style={styles.headerSubtitle}>
              {data?.data?.total || 0} total clients
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(verticals)/travel-agent/clients/new')}
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
              placeholder="Search clients..."
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
            <Ionicons name="options" size={20} color={showFilters ? '#4F46E5' : '#6B7280'} />
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
            {(['in_progress', 'rejected', 'completed'] as ClientStatus[]).map((status) => (
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

      {/* Clients List */}
      <FlatList
        data={clients}
        renderItem={renderClientItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
        ListEmptyComponent={renderEmptyState}
        onEndReached={() => {
          if (page < totalPages) {
            setPage(page + 1)
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isLoading && clients.length > 0 ? (
            <View style={styles.loadMoreIndicator}>
              <BouncingBallsLoader size={12} color="#4F46E5" />
            </View>
          ) : null
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
    shadowColor: '#4F46E5',
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
    backgroundColor: '#EEF2FF',
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
    backgroundColor: '#4F46E5',
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
  clientCard: {
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
    marginBottom: 12,
    alignItems: 'center',
  },
  profilePictureContainer: {
    marginRight: 12,
  },
  profilePicture: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profilePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInitials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4B5563',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
  },
  badges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  notes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadMoreIndicator: {
    paddingVertical: 24,
  },
})