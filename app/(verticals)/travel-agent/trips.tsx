import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native'
import { BouncingBallsLoader } from '../../../src/components/ui/BouncingBallsLoader'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../../src/lib/supabase'
import { useTrips, useDeleteTrip } from '../../../src/hooks/useTrips'
import { Trip } from '../../../src/types/trips'

export default function TripsPage() {
  const { clientId } = useLocalSearchParams<{ clientId?: string }>()
  const [userId, setUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    fetchUser()
  }, [])

  const { data, isLoading, isError, error, refetch } = useTrips(userId || '', {
    search_term: searchTerm,
    client_id: clientId
  })
  const trips = data?.data || []
  const deleteTrip = useDeleteTrip()

  if (isLoading && !trips.length) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <BouncingBallsLoader size={12} color="#047857" />
      </View>
    )
  }

  const renderTripItem = ({ item }: { item: Trip }) => {
    const departureDate = new Date(item.departure_date)
    const destinationDate = new Date(item.destination_date)
    const duration = Math.ceil((destinationDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24))
    const isReturn = item.trip_type === 'return'
    const returnDepartureDate = item.return_departure_date ? new Date(item.return_departure_date) : null
    const returnDestinationDate = item.return_destination_date ? new Date(item.return_destination_date) : null
    const overallDuration = returnDestinationDate
      ? Math.ceil((returnDestinationDate.getTime() - departureDate.getTime()) / (1000 * 60 * 60 * 24))
      : duration

    const outboundStops = (item.stops || []).filter((s) => s.leg === 'outbound').sort((a, b) => a.stop_number - b.stop_number)
    const returnStops = (item.stops || []).filter((s) => s.leg === 'return').sort((a, b) => a.stop_number - b.stop_number)

    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => { }}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#047857', '#065F46']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tripHeader}
        >
          <View style={styles.headerTopRow}>
            <View style={[styles.typeBadge, { backgroundColor: isReturn ? 'rgba(16,185,129,0.2)' : 'rgba(37,99,235,0.2)', borderColor: isReturn ? '#d1e8e0ff' : '#afbcd8ff' }]}> 
              <Ionicons name={isReturn ? 'swap-vertical' : 'arrow-forward'} size={14} color={isReturn ? '#d1e8e0ff' : '#afbcd8ff'} />
              <Text style={[styles.typeBadgeText, { color: isReturn ? '#d1e8e0ff' : '#afbcd8ff' }]}>{isReturn ? 'Round Trip' : 'One Way'}</Text>
            </View>
            <Text style={styles.duration}>{overallDuration} {overallDuration === 1 ? 'day' : 'days'}</Text>
          </View>

          {!isReturn && (
            <View style={styles.routeContainer}>
              <View style={styles.cityContainer}>
                <Text style={styles.cityCode}>{item.departure_city.substring(0, 3).toUpperCase()}</Text>
                <Text style={styles.cityName}>{item.departure_city}</Text>
              </View>
              <View style={styles.flightPath}>
                <View style={styles.pathLine} />
                <Ionicons name="airplane" size={20} color="#fff" style={styles.planeIcon} />
                <View style={styles.pathLine} />
              </View>
              <View style={styles.cityContainer}>
                <Text style={styles.cityCode}>{item.destination_city.substring(0, 3).toUpperCase()}</Text>
                <Text style={styles.cityName}>{item.destination_city}</Text>
              </View>
            </View>
          )}

          {isReturn && (
            <View>
              <View style={[styles.routeContainer, { marginBottom: 8 }]}> 
                <View style={styles.cityContainer}>
                  <Text style={styles.cityCode}>{item.departure_city.substring(0, 3).toUpperCase()}</Text>
                  <Text style={styles.cityName}>{item.departure_city}</Text>
                </View>
                <View style={styles.flightPath}>
                  <View style={styles.pathLine} />
                  <Ionicons name="airplane" size={20} color="#fff" style={styles.planeIcon} />
                  <View style={styles.pathLine} />
                </View>
                <View style={styles.cityContainer}>
                  <Text style={styles.cityCode}>{item.destination_city.substring(0, 3).toUpperCase()}</Text>
                  <Text style={styles.cityName}>{item.destination_city}</Text>
                </View>
              </View>
              <View style={styles.routeContainer}> 
                <View style={styles.cityContainer}>
                  <Text style={styles.cityCode}>{(item.return_departure_city || item.destination_city).substring(0, 3).toUpperCase()}</Text>
                  <Text style={styles.cityName}>{item.return_departure_city || item.destination_city}</Text>
                </View>
                <View style={styles.flightPath}>
                  <View style={styles.pathLine} />
                  <Ionicons name="airplane" size={20} color="#fff" style={styles.planeIcon} />
                  <View style={styles.pathLine} />
                </View>
                <View style={styles.cityContainer}>
                  <Text style={styles.cityCode}>{(item.return_destination_city || item.departure_city).substring(0, 3).toUpperCase()}</Text>
                  <Text style={styles.cityName}>{item.return_destination_city || item.departure_city}</Text>
                </View>
              </View>
            </View>
          )}
        </LinearGradient>

        <View style={styles.tripDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={16} color="#4F46E5" />
            <Text style={styles.detailText}>{item.client?.full_name || 'No client'}</Text>
          </View>

          {!isReturn && (
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Departure</Text>
                <Text style={styles.dateValue}>
                  {departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Arrival</Text>
                <Text style={styles.dateValue}>
                  {destinationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            </View>
          )}
          {isReturn && (
            <View>
              <View style={[styles.dateRow, { marginBottom: 8 }]}> 
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>Outbound</Text>
                  <Text style={styles.dateValue}>
                    {departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>Arrival</Text>
                  <Text style={styles.dateValue}>
                    {destinationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
              </View>
              <View style={styles.dateRow}> 
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>Return</Text>
                  <Text style={styles.dateValue}>
                    {returnDepartureDate ? returnDepartureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>Arrival</Text>
                  <Text style={styles.dateValue}>
                    {returnDestinationDate ? returnDestinationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {(item.airline || item.pnr_number || item.return_airline || item.return_pnr_number) && (
            <View style={styles.flightInfo}>
              {item.airline && (
                <View style={styles.infoChip}>
                  <Ionicons name="airplane-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{item.airline}</Text>
                </View>
              )}
              {item.pnr_number && (
                <View style={styles.infoChip}>
                  <Ionicons name="ticket-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{item.pnr_number}</Text>
                </View>
              )}
              {isReturn && item.return_airline && (
                <View style={styles.infoChip}>
                  <Ionicons name="airplane-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{item.return_airline}</Text>
                </View>
              )}
              {isReturn && item.return_pnr_number && (
                <View style={styles.infoChip}>
                  <Ionicons name="ticket-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{item.return_pnr_number}</Text>
                </View>
              )}
            </View>
          )}

          {(outboundStops.length > 0 || returnStops.length > 0) && (
            <View style={styles.stopsSection}>
              {outboundStops.length > 0 && (
                <View style={styles.stopsBlock}>
                  <View style={styles.stopsHeader}>
                    <Ionicons name="trail-sign" size={16} color="#047857" />
                    <Text style={styles.stopsTitle}>Outbound Stops</Text>
                  </View>
                  <View style={styles.stopsRow}>
                    {outboundStops.map((s, idx) => (
                      <View key={`out-${s.id}-${idx}`} style={styles.stopItem}>
                        <View style={styles.stopChip}>
                          <Text style={styles.stopCityCode}>{s.city.substring(0, 3).toUpperCase()}</Text>
                          <Text style={styles.stopDate}>{new Date(s.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                        </View>
                        {idx !== outboundStops.length - 1 && <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {returnStops.length > 0 && (
                <View style={styles.stopsBlock}>
                  <View style={styles.stopsHeader}>
                    <Ionicons name="trail-sign" size={16} color="#047857" />
                    <Text style={styles.stopsTitle}>Return Stops</Text>
                  </View>
                  <View style={styles.stopsRow}>
                    {returnStops.map((s, idx) => (
                      <View key={`ret-${s.id}-${idx}`} style={styles.stopItem}>
                        <View style={styles.stopChip}>
                          <Text style={styles.stopCityCode}>{s.city.substring(0, 3).toUpperCase()}</Text>
                          <Text style={styles.stopDate}>{new Date(s.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                        </View>
                        {idx !== returnStops.length - 1 && <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={(e) => {
                e.stopPropagation()
                router.push(`/(verticals)/travel-agent/trips/${item.id}/edit`)
              }}
            >
              <Ionicons name="pencil" size={18} color="#047857" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation()
                Alert.alert(
                  'Delete Trip',
                  `Are you sure you want to delete this trip from ${item.departure_city} to ${item.destination_city}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        await deleteTrip.mutateAsync(item.id)
                        refetch()
                      }
                    }
                  ]
                )
              }}
            >
              <Ionicons name="trash" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="airplane-outline" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No trips found</Text>
      <Text style={styles.emptyText}>
        {searchTerm ? 'Try adjusting your search' : 'Start by adding your first trip'}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/(verticals)/travel-agent/trips/new')}
      >
        <LinearGradient
          colors={['#047857', '#065F46']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyButtonGradient}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Add Your First Trip</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )

  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error loading trips</Text>
          <Text style={styles.errorText}>{(error as any)?.message || 'Something went wrong'}</Text>
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
        colors={['#047857', '#065F46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Trips</Text>
            <Text style={styles.headerSubtitle}>{trips.length} total trips</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(verticals)/travel-agent/trips/new')}
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
              placeholder="Search by city..."
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
        </View>
      </LinearGradient>

      {/* Trips List */}
      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
        ListEmptyComponent={renderEmptyState}
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
    shadowColor: '#047857',
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
  listContent: {
    padding: 20,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tripHeader: {
    padding: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cityContainer: {
    alignItems: 'center',
  },
  cityCode: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  cityName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  flightPath: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  pathLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  planeIcon: {
    marginHorizontal: 8,
  },
  duration: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  tripDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  flightInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  stopsSection: {
    marginTop: 12,
    gap: 12,
  },
  stopsBlock: {
    gap: 8,
  },
  stopsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stopsTitle: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '700',
  },
  stopsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stopCityCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  stopDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
    shadowColor: '#047857',
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
    backgroundColor: '#047857',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
})
