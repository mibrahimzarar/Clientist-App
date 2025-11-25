import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLeads, useLeadStatistics, useConvertLeadToClient, useTodaysFollowUps } from '../../../../src/hooks/useLeads'
import { LeadStatus, LeadSource, PriorityTag } from '../../../../src/types/travelAgent'
import LeadCard from '../../../../src/components/leads/LeadCard'
import LeadFormModal from '../../../../src/components/leads/LeadFormModal'

export default function LeadsScreen() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>()
  const [sourceFilter, setSourceFilter] = useState<LeadSource | undefined>()
  const [priorityFilter, setPriorityFilter] = useState<PriorityTag | undefined>()
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(undefined)

  const { data: leadsData, isLoading, refetch } = useLeads(page, 20, {
    search_term: searchTerm,
    status_filter: statusFilter,
    source_filter: sourceFilter,
    priority_filter: priorityFilter,
  })

  const { data: statsData } = useLeadStatistics()
  const { data: todaysFollowUpsData } = useTodaysFollowUps()
  const convertMutation = useConvertLeadToClient()

  const leads = leadsData?.data?.data || []
  const stats = statsData?.data
  const todaysFollowUps = todaysFollowUpsData?.data || []

  const handleConvertLead = async (leadId: string) => {
    Alert.alert(
      'Convert Lead',
      'Are you sure you want to convert this lead to a client?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Convert',
          onPress: async () => {
            try {
              const result = await convertMutation.mutateAsync(leadId)
              if (result.success) {
                Alert.alert('Success', 'Lead converted to client successfully!', [
                  {
                    text: 'View Client',
                    onPress: () => router.push(`/(verticals)/travel-agent/clients/${result.data?.id}`)
                  },
                  { text: 'OK' }
                ])
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to convert lead')
            }
          }
        }
      ]
    )
  }

  const statusOptions: { value: LeadStatus | undefined; label: string; color: string }[] = [
    { value: undefined, label: 'All', color: '#6B7280' },
    { value: 'potential', label: 'Potential', color: '#6366F1' },
    { value: 'call_later', label: 'Call Later', color: '#F59E0B' },
    { value: 'interested', label: 'Interested', color: '#10B981' },
    { value: 'not_interested', label: 'Not Interested', color: '#6B7280' },
    { value: 'converted', label: 'Converted', color: '#8B5CF6' },
  ]

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lead Management</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedLead(undefined)
              setShowFormModal(true)
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        {stats && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsScroll}
            contentContainerStyle={styles.statsContainer}
          >
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total_leads}</Text>
              <Text style={styles.statLabel}>Total Leads</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.potential_leads}</Text>
              <Text style={styles.statLabel}>Potential</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.interested_leads}</Text>
              <Text style={styles.statLabel}>Interested</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.todays_followups}</Text>
              <Text style={styles.statLabel}>Today's Follow-ups</Text>
            </View>
            <View style={[styles.statCard, stats.overdue_followups > 0 && styles.statCardAlert]}>
              <Text style={styles.statNumber}>{stats.overdue_followups}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
          </ScrollView>
        )}
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Follow-ups */}
        {todaysFollowUps.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                <Text style={styles.sectionTitle}>Today's Follow-ups</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{todaysFollowUps.length}</Text>
              </View>
            </View>
            {todaysFollowUps.slice(0, 3).map((followUp) => (
              <View key={followUp.id} style={styles.followUpCard}>
                <View style={styles.followUpContent}>
                  <Text style={styles.followUpName}>{followUp.full_name}</Text>
                  <Text style={styles.followUpPhone}>{followUp.phone_number}</Text>
                </View>
                <TouchableOpacity
                  style={styles.followUpButton}
                  onPress={() => router.push(`/(verticals)/travel-agent/leads/${followUp.id}` as any)}
                >
                  <Ionicons name="chevron-forward" size={20} color="#6366F1" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search leads..."
            placeholderTextColor="#9CA3AF"
          />
          {searchTerm !== '' && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={[
                styles.filterChip,
                statusFilter === option.value && styles.filterChipActive
              ]}
              onPress={() => setStatusFilter(option.value)}
            >
              <View style={[styles.filterDot, { backgroundColor: option.color }]} />
              <Text style={[
                styles.filterText,
                statusFilter === option.value && styles.filterTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Leads List */}
        <View style={styles.leadsSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : leads.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No leads found</Text>
              <Text style={styles.emptyText}>Add your first lead to get started</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => {
                  setSelectedLead(undefined)
                  setShowFormModal(true)
                }}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Add Lead</Text>
              </TouchableOpacity>
            </View>
          ) : (
            leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onPress={() => router.push(`/(verticals)/travel-agent/leads/${lead.id}` as any)}
                onConvert={() => handleConvertLead(lead.id)}
              />
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Lead Form Modal */}
      <LeadFormModal
        visible={showFormModal}
        onClose={() => {
          setShowFormModal(false)
          setSelectedLead(undefined)
        }}
        lead={selectedLead}
        onSuccess={() => {
          refetch()
        }}
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
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsScroll: {
    marginTop: 8,
  },
  statsContainer: {
    gap: 12,
    paddingRight: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
  },
  statCardAlert: {
    backgroundColor: 'rgba(239,68,68,0.3)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  followUpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  followUpContent: {
    flex: 1,
  },
  followUpName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  followUpPhone: {
    fontSize: 13,
    color: '#6B7280',
  },
  followUpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  filterScroll: {
    marginBottom: 20,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  leadsSection: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
})
