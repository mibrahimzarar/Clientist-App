import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useClient, useUpdateClient, useDeleteClient } from '../../../../src/hooks/useTravelAgent'
import { TravelClient, ClientStatus, PackageType, PriorityTag } from '../../../../src/types/travelAgent'

export default function FreelancerClientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [refreshing, setRefreshing] = useState(false)
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)

  const { data: clientData, isLoading, error, refetch } = useClient(id!)
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()

  const client = clientData?.data

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const handleStatusChange = async (newStatus: ClientStatus) => {
    try {
      await updateClient.mutateAsync({ id: id!, data: { status: newStatus } })
      setShowStatusPicker(false)
    } catch (error) {
      Alert.alert('Error', 'Failed to update client status')
    }
  }

  const handlePriorityChange = async (newPriority: PriorityTag) => {
    try {
      await updateClient.mutateAsync({ id: id!, data: { priority_tag: newPriority } })
      setShowPriorityPicker(false)
    } catch (error) {
      Alert.alert('Error', 'Failed to update client priority')
    }
  }

  const handleDeleteClient = () => {
    Alert.alert(
      'Delete Client',
      'Are you sure you want to delete this client? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClient.mutateAsync(id!)
              router.back()
            } catch (error) {
              Alert.alert('Error', 'Failed to delete client')
            }
          },
        },
      ]
    )
  }

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case 'new': return '#3B82F6'
      case 'in_process': return '#F59E0B'
      case 'documents_pending': return '#EF4444'
      case 'submitted': return '#8B5CF6'
      case 'approved': return '#10B981'
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading client details...</Text>
      </View>
    )
  }

  if (error || !client) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Error loading client</Text>
        <Text style={styles.errorText}>{error?.message || 'Client not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client Details</Text>
        <TouchableOpacity onPress={handleDeleteClient} style={styles.deleteButton}>
          <Ionicons name="trash" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Client Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.clientHeader}>
          <View style={styles.clientBasicInfo}>
            <Text style={styles.clientName}>{client.full_name}</Text>
            <Text style={styles.clientPhone}>{client.phone_number}</Text>
            {client.email && <Text style={styles.clientEmail}>{client.email}</Text>}
          </View>
          <View style={styles.clientBadges}>
            <TouchableOpacity
              style={[styles.statusBadge, { backgroundColor: getStatusColor(client.status) }]}
              onPress={() => setShowStatusPicker(!showStatusPicker)}
            >
              <Text style={styles.badgeText}>{client.status.replace('_', ' ')}</Text>
              <Ionicons name="chevron-down" size={12} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.priorityBadge, { backgroundColor: getPriorityColor(client.priority_tag) }]}
              onPress={() => setShowPriorityPicker(!showPriorityPicker)}
            >
              <Text style={styles.badgeText}>{client.priority_tag}</Text>
              <Ionicons name="chevron-down" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Picker */}
        {showStatusPicker && (
          <View style={styles.pickerContainer}>
            {(['new', 'in_process', 'documents_pending', 'submitted', 'approved', 'rejected', 'completed'] as ClientStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.pickerItem}
                onPress={() => handleStatusChange(status)}
              >
                <Text style={styles.pickerText}>{status.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Priority Picker */}
        {showPriorityPicker && (
          <View style={styles.pickerContainer}>
            {(['normal', 'priority', 'urgent', 'vip'] as PriorityTag[]).map((priority) => (
              <TouchableOpacity
                key={priority}
                style={styles.pickerItem}
                onPress={() => handlePriorityChange(priority)}
              >
                <Text style={styles.pickerText}>{priority}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.clientDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{client.country}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name={getPackageIcon(client.package_type)} size={16} color="#6B7280" />
            <Text style={styles.detailText}>{client.package_type.replace('_', ' ')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="flag" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{client.lead_source.replace('_', ' ')}</Text>
          </View>
        </View>

        {client.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{client.notes}</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/(verticals)/freelancer/clients/${id}/projects`)}
          >
            <Ionicons name="briefcase" size={24} color="#3B82F6" />
            <Text style={styles.actionText}>Projects</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/(verticals)/freelancer/clients/${id}/invoices`)}
          >
            <Ionicons name="receipt" size={24} color="#F59E0B" />
            <Text style={styles.actionText}>Invoices</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/(verticals)/freelancer/clients/${id}/time-tracking`)}
          >
            <Ionicons name="time" size={24} color="#EF4444" />
            <Text style={styles.actionText}>Time Tracking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/(verticals)/freelancer/clients/${id}/proposals`)}
          >
            <Ionicons name="document-text" size={24} color="#10B981" />
            <Text style={styles.actionText}>Proposals</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Client Timeline */}
      <View style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.timelineContainer}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: '#3B82F6' }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Client Created</Text>
              <Text style={styles.timelineDate}>
                {new Date(client.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          {client.updated_at !== client.created_at && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#F59E0B' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Last Updated</Text>
                <Text style={styles.timelineDate}>
                  {new Date(client.updated_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  deleteButton: {
    padding: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 16,
  },
  clientBasicInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  clientBadges: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },
  pickerContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
  },
  clientDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
  },
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  actionsSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
  },
  timelineSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  timelineContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  timelineDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
})