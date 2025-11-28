import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Image,
  TextInput,
  Modal,
} from 'react-native'
import { NotesTimeline } from '../../../../src/components/notes/NotesTimeline'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useClient, useUpdateClient, useDeleteClient, useClientEarnings, useAddClientEarning, useDeleteClientEarning } from '../../../../src/hooks/useTravelAgent'
import { TravelClient, ClientStatus, PackageType, PriorityTag, EarningFormData } from '../../../../src/types/travelAgent'

export default function TravelAgentClientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [refreshing, setRefreshing] = useState(false)
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)
  const [showEarningModal, setShowEarningModal] = useState(false)
  const [earningAmount, setEarningAmount] = useState('')
  const [earningNotes, setEarningNotes] = useState('')

  const { data: clientData, isLoading, error, refetch } = useClient(id!)
  const { data: earningsData } = useClientEarnings(id!)
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  const addEarning = useAddClientEarning()
  const deleteEarning = useDeleteClientEarning()

  const client = clientData?.data
  const earnings = earningsData?.data || []

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

  const handleDeleteEarning = (earningId: string) => {
    Alert.alert(
      'Delete Earning',
      'Are you sure you want to delete this earning record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEarning.mutateAsync(earningId)
              Alert.alert('Success', 'Earning deleted successfully')
            } catch (error) {
              Alert.alert('Error', 'Failed to delete earning')
            }
          },
        },
      ]
    )
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

  const handleAddEarning = async () => {
    if (!earningAmount || isNaN(Number(earningAmount))) {
      Alert.alert('Error', 'Please enter a valid amount')
      return
    }

    try {
      await addEarning.mutateAsync({
        clientId: id!,
        data: {
          amount: Number(earningAmount),
          currency: '',
          notes: earningNotes,
          earned_date: new Date().toISOString().split('T')[0]
        }
      })
      setShowEarningModal(false)
      setEarningAmount('')
      setEarningNotes('')
      Alert.alert('Success', 'Earning added successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to add earning')
    }
  }

  const getStatusColor = (status: ClientStatus): [string, string] => {
    switch (status) {
      case 'in_progress': return ['#667EEA', '#5A67D8']
      case 'rejected': return ['#DC2626', '#B91C1C']
      case 'completed': return ['#059669', '#047857']
      default: return ['#6B7280', '#4B5563']
    }
  }

  const getPriorityColor = (priority: PriorityTag): [string, string] => {
    switch (priority) {
      case 'urgent': return ['#EF4444', '#DC2626']
      case 'priority': return ['#F59E0B', '#D97706']
      case 'vip': return ['#8B5CF6', '#7C3AED']
      default: return ['#10B981', '#059669']
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
        <BouncingBallsLoader />
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
      {/* Header with Gradient */}
      <LinearGradient
        colors={getStatusColor(client.status)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push(`/(verticals)/travel-agent/clients/${id}/edit`)} style={styles.actionButton}>
              <Ionicons name="create" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteClient} style={styles.actionButton}>
              <Ionicons name="trash" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {client.profile_picture_url ? (
              <Image
                source={{ uri: client.profile_picture_url }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {client.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'NA'}
              </Text>
            )}
          </View>
          <Text style={styles.clientName}>{client.full_name || 'Unknown Client'}</Text>
          <View style={styles.badgesRow}>
            <TouchableOpacity
              style={styles.statusBadge}
              onPress={() => setShowStatusPicker(!showStatusPicker)}
            >
              <Text style={styles.badgeText}>{client.status?.replace('_', ' ') || 'Unknown'}</Text>
              <Ionicons name="chevron-down" size={12} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.priorityBadge}
              onPress={() => setShowPriorityPicker(!showPriorityPicker)}
            >
              <LinearGradient
                colors={getPriorityColor(client.priority_tag)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.priorityGradient}
              >
                <Text style={styles.badgeText}>{client.priority_tag || 'normal'}</Text>
                <Ionicons name="chevron-down" size={12} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Status Picker Modal */}
      {showStatusPicker && (
        <View style={styles.pickerContainer}>
          {(['in_progress', 'rejected', 'completed'] as ClientStatus[]).map((status) => (
            <TouchableOpacity
              key={status}
              style={styles.pickerItem}
              onPress={() => handleStatusChange(status)}
            >
              <View style={[styles.pickerDot, { backgroundColor: getStatusColor(status)[0] }]} />
              <Text style={styles.pickerText}>{status?.replace('_', ' ') || status}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Priority Picker Modal */}
      {showPriorityPicker && (
        <View style={styles.pickerContainer}>
          {(['normal', 'priority', 'urgent', 'vip'] as PriorityTag[]).map((priority) => (
            <TouchableOpacity
              key={priority}
              style={styles.pickerItem}
              onPress={() => handlePriorityChange(priority)}
            >
              <View style={[styles.pickerDot, { backgroundColor: getPriorityColor(priority)[0] }]} />
              <Text style={styles.pickerText}>{priority}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Contact Information Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="call" size={20} color="#4F46E5" />
          <Text style={styles.cardTitle}>Contact Information</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#6B7280" />
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{client.phone_number}</Text>
          </View>
          {client.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color="#6B7280" />
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{client.email}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <Text style={styles.infoLabel}>Country</Text>
            <Text style={styles.infoValue}>{client.country}</Text>
          </View>
        </View>
      </View>

      {/* Package Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name={getPackageIcon(client.package_type)} size={20} color="#10B981" />
          <Text style={styles.cardTitle}>Package Details</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={18} color="#6B7280" />
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{client.package_type?.replace('_', ' ') || 'Unknown'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={18} color="#6B7280" />
            <Text style={styles.infoLabel}>Source</Text>
            <Text style={styles.infoValue}>{client.lead_source?.replace('_', ' ') || 'Unknown'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{new Date(client.created_at).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>

      {/* Notes Section */}
      {client.notes && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color="#F59E0B" />
            <Text style={styles.cardTitle}>Notes</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.notesText}>{client.notes}</Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(`/(verticals)/travel-agent/trips?clientId=${id}`)}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionGradient}
            >
              <Ionicons name="airplane" size={28} color="#fff" />
              <Text style={styles.actionText}>Travel Info</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(`/(verticals)/travel-agent/documents?clientId=${id}&type=payment_receipt`)}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionGradient}
            >
              <Ionicons name="card" size={28} color="#fff" />
              <Text style={styles.actionText}>Payments</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push(`/(verticals)/travel-agent/clients/${id}/files`)}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionGradient}
            >
              <Ionicons name="folder" size={28} color="#fff" />
              <Text style={styles.actionText}>Documents</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Earnings Section - Only show if client is completed */}
      {client.status === 'completed' && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash" size={20} color="#10B981" />
            <Text style={styles.cardTitle}>Earnings</Text>
          </View>
          <View style={styles.cardContent}>
            {earnings.length > 0 ? (
              <View>
                {earnings.map((earning, index) => (
                  <View key={earning.id} style={[styles.earningItem, index !== earnings.length - 1 && styles.earningItemBorder]}>
                    <View style={styles.earningItemLeft}>
                      <Text style={styles.earningAmount}>
                        {earning.currency} {earning.amount.toFixed(2)}
                      </Text>
                      {earning.notes && (
                        <Text style={styles.earningNotes}>{earning.notes}</Text>
                      )}
                      <Text style={styles.earningDate}>
                        {new Date(earning.earned_date).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteEarning(earning.id)}
                      style={styles.deleteEarningButton}
                    >
                      <Ionicons name="trash" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.earningTotalRow}>
                  <Text style={styles.earningTotalLabel}>Total Earnings:</Text>
                  <Text style={styles.earningTotalAmount}>
                     {earnings.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noEarningsText}>No earnings recorded yet</Text>
            )}</View>
          <TouchableOpacity
            style={styles.addEarningButton}
            onPress={() => setShowEarningModal(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addEarningButtonText}>Add Earning</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Earnings Modal */}
      {showEarningModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Earning</Text>
                <Text style={styles.modalSubtitle}>Record your profit from this client</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEarningModal(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount</Text>
                <View style={styles.amountInputWrapper}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={earningAmount}
                    onChangeText={setEarningAmount}
                    placeholderTextColor="#D1D5DB"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput]}
                  placeholder="Add notes about this earning..."
                  multiline
                  numberOfLines={3}
                  value={earningNotes}
                  onChangeText={setEarningNotes}
                  placeholderTextColor="#D1D5DB"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEarningModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleAddEarning}
              >
                <Ionicons name="checkmark" size={20} color="#fff" style={styles.submitIcon} />
                <Text style={styles.modalSubmitButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Notes Timeline */}
      <NotesTimeline clientId={id as string} />
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
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#fff',
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  clientName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  priorityBadge: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  priorityGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 12,
  },
  pickerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    width: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  actionsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  earningItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  earningItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  earningItemLeft: {
    flex: 1,
  },
  earningAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  earningNotes: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  earningDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deleteEarningButton: {
    padding: 8,
  },
  earningTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  earningTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  earningTotalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  noEarningsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  addEarningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addEarningButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalBody: {
    padding: 24,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submitIcon: {
    marginRight: 4,
  },
  modalSubmitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
})