import React, { useState, useMemo } from 'react'
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
import { useClients } from '../../../../src/hooks/useTravelAgent'
import {
  TravelClient,
  ClientStatus,
  PackageType,
  PriorityTag,
  SearchFilters,
} from '../../../../src/types/travelAgent'

export default function ServiceProviderClientsList() {
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

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case 'in_progress': return '#667EEA'
      case 'rejected': return '#DC2626'
      case 'completed': return '#059669'
      default: return '#6B7280'
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
      case 'tourist_visa': return 'document'
      case 'ticketing': return 'ticket'
      case 'visit_visa': return 'briefcase'
      default: return 'person'
    }
  }

  const renderClientItem = ({ item }: { item: TravelClient }) => (
    <TouchableOpacity
      style={styles.clientItem}
      onPress={() => router.push(`/(verticals)/service-provider/clients/${item.id}`)}
    >
      <View style={styles.clientHeader}>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{item.full_name}</Text>
          <Text style={styles.clientPhone}>{item.phone_number}</Text>
          {item.email && (
            <Text style={styles.clientEmail}>{item.email}</Text>
          )}
        </View>
        <View style={styles.clientBadges}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
          </View>
          {item.priority_tag !== 'normal' && (
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority_tag) }]}>
              <Text style={styles.badgeText}>{item.priority_tag}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.clientDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{item.country}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name={getPackageIcon(item.package_type)} size={16} color="#6B7280" />
          <Text style={styles.detailText}>{item.package_type.replace('_', ' ')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="flag" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{item.lead_source.replace('_', ' ')}</Text>
        </View>
      </View>

      {item.notes && (
        <Text style={styles.clientNotes} numberOfLines={2}>{item.notes}</Text>
      )}

      <View style={styles.clientFooter}>
        <Text style={styles.clientDate}>
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No clients found</Text>
      <Text style={styles.emptyText}>
        {searchTerm || statusFilter || packageFilter || priorityFilter
          ? 'Try adjusting your search or filters'
          : 'Start by adding your first client'}
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/(verticals)/service-provider/clients/new')}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Client</Text>
      </TouchableOpacity>
    </View>
  )

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.filterOptions}>
          {(['all', 'new', 'in_process', 'documents_pending', 'submitted', 'approved', 'rejected', 'completed'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                (status === 'all' ? !statusFilter : statusFilter === status) && styles.filterButtonActive
              ]}
              onPress={() => setStatusFilter(status === 'all' ? undefined : status as ClientStatus)}
            >
              <Text style={[
                styles.filterButtonText,
                (status === 'all' ? !statusFilter : statusFilter === status) && styles.filterButtonTextActive
              ]}>
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Package:</Text>
        <View style={styles.filterOptions}>
          {(['all', 'umrah_package', 'tourist_visa', 'ticketing', 'visit_visa'] as const).map((pkg) => (
            <TouchableOpacity
              key={pkg}
              style={[
                styles.filterButton,
                (pkg === 'all' ? !packageFilter : packageFilter === pkg) && styles.filterButtonActive
              ]}
              onPress={() => setPackageFilter(pkg === 'all' ? undefined : pkg as PackageType)}
            >
              <Text style={[
                styles.filterButtonText,
                (pkg === 'all' ? !packageFilter : packageFilter === pkg) && styles.filterButtonTextActive
              ]}>
                {pkg === 'all' ? 'All' : pkg.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>Priority:</Text>
        <View style={styles.filterOptions}>
          {(['all', 'normal', 'priority', 'urgent', 'vip'] as const).map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.filterButton,
                (priority === 'all' ? !priorityFilter : priorityFilter === priority) && styles.filterButtonActive
              ]}
              onPress={() => setPriorityFilter(priority === 'all' ? undefined : priority as PriorityTag)}
            >
              <Text style={[
                styles.filterButtonText,
                (priority === 'all' ? !priorityFilter : priorityFilter === priority) && styles.filterButtonTextActive
              ]}>
                {priority === 'all' ? 'All' : priority}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Error loading clients</Text>
        <Text style={styles.errorText}>{error?.message || 'Something went wrong'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Service Provider Clients</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(verticals)/service-provider/clients/new')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients by name, phone, email, or country..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color={showFilters ? '#FFFFFF' : '#6B7280'} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && renderFilters()}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {data?.data?.total || 0} client{data?.data?.total !== 1 ? 's' : ''} found
        </Text>
      </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 24,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  filterToggle: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleActive: {
    backgroundColor: '#3B82F6',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 0,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    padding: 24,
    paddingTop: 12,
  },
  clientItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  clientBadges: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  priorityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  clientDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  clientNotes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  clientFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  clientDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addClientButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadMoreIndicator: {
    paddingVertical: 24,
  },
})