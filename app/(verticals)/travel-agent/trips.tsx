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

    const outboundStops = item.stops?.filter(s => s.leg === 'outbound').sort((a, b) => a.stop_number - b.stop_number) || []
    const returnStops = item.stops?.filter(s => s.leg === 'return').sort((a, b) => a.stop_number - b.stop_number) || []

    const renderLeg = (
      origin: string,
      destination: string,
      date: string,
      stops: typeof outboundStops,
      label: string,
      icon: string
    ) => (
      <View style={styles.legContainer}>
        <View style={styles.legHeader}>
          <View style={styles.legLabelContainer}>
            <Ionicons name={icon as any} size={14} color="#6B7280" />
            <Text style={styles.legLabel}>{label}</Text>
          </View>
          <Text style={styles.legDate}>
            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
          </Text>
        </View>

        <View style={styles.routeRow}>
          {/* Origin */}
          <View style={styles.routeNode}>
            <Text style={styles.cityCode}>{origin.substring(0, 3).toUpperCase()}</Text>
            <Text style={styles.cityName} numberOfLines={1}>{origin}</Text>
          </View>

          {/* Path & Stops */}
          <View style={styles.routePath}>
            <View style={styles.pathLine} />
            {stops.map((stop, index) => (
              <View key={index} style={styles.stopNode}>
                <View style={styles.stopDot} />
                <Text style={styles.stopCode}>{stop.city.substring(0, 3).toUpperCase()}</Text>
              </View>
            ))}
            <Ionicons name="airplane" size={16} color="#047857" style={styles.pathPlane} />
            <View style={styles.pathLine} />
          </View>

          {/* Destination */}
          <View style={styles.routeNode}>
            <Text style={styles.cityCode}>{destination.substring(0, 3).toUpperCase()}</Text>
            <Text style={styles.cityName} numberOfLines={1}>{destination}</Text>
          </View>
        </View>
      </View>
    )

    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => { }}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={item.trip_type === 'return' ? ['#047857', '#065F46'] : ['#059669', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tripHeader}
        >
          <View style={styles.tripTypeContainer}>
            <Ionicons
              name={item.trip_type === 'return' ? 'swap-horizontal' : 'arrow-forward'}
              size={18}
              color="#fff"
            />
            <Text style={styles.tripTypeText}>
              {item.trip_type === 'return' ? 'Round Trip' : 'One-way Trip'}
            </Text>
          </View>
          <Text style={styles.duration}>{duration} {duration === 1 ? 'day' : 'days'}</Text>
        </LinearGradient>

        <View style={styles.tripDetails}>
          {/* Outbound Leg */}
          {renderLeg(
            item.departure_city,
            item.destination_city,
            item.departure_date,
            outboundStops,
            'Outbound',
            'airplane-outline'
          )}

          {/* Return Leg - Only for Round Trips */}
          {item.trip_type === 'return' && (
            <>
              <View style={styles.legDivider} />
              {renderLeg(
                item.return_departure_city || item.destination_city,
                item.return_destination_city || item.departure_city,
                item.return_departure_date || item.destination_date, // Fallback to dest date if return date missing
                returnStops,
                'Return',
                'airplane'
              )}
            </>
          )}

          {/* Footer Info */}
          <View style={styles.cardFooter}>
            <View style={styles.clientInfo}>
              <View style={styles.clientAvatar}>
                <Text style={styles.clientInitials}>
                  {item.client?.full_name?.substring(0, 2).toUpperCase() || 'NA'}
                </Text>
              </View>
              <Text style={styles.clientName}>{item.client?.full_name || 'No client'}</Text>
            </View>

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
                    `Are you sure you want to delete this trip?`,
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
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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