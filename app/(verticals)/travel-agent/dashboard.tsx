import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useDashboardSummary, useClientAnalytics, useUpcomingTravels, usePendingTasks } from '../../../src/hooks/useTravelAgent'
import { Ionicons } from '@expo/vector-icons'

export default function TravelAgentDashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardSummary()
  const { data: analyticsData } = useClientAnalytics()
  const { data: upcomingTravels } = useUpcomingTravels(5)
  const { data: pendingTasks } = usePendingTasks(5)

  const getStatusColor = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444'
      case 'priority': return '#F59E0B'
      case 'vip': return '#8B5CF6'
      default: return '#6B7280'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'today': return '#EF4444'
      case 'tomorrow': return '#F59E0B'
      case 'this_week': return '#3B82F6'
      case 'this_month': return '#10B981'
      default: return '#6B7280'
    }
  }

  if (dashboardLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Travel Agent Dashboard</Text>
          <Text style={styles.subtitle}>Manage your clients and bookings</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/(app)/settings')}
        >
          <Ionicons name="settings" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Analytics Cards */}
      <View style={styles.analyticsSection}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <Ionicons name="people" size={24} color="#3B82F6" />
            <Text style={styles.analyticsNumber}>{dashboardData?.data?.total_clients || 0}</Text>
            <Text style={styles.analyticsLabel}>Total Clients</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Ionicons name="time" size={24} color="#F59E0B" />
            <Text style={styles.analyticsNumber}>{dashboardData?.data?.in_process_clients || 0}</Text>
            <Text style={styles.analyticsLabel}>In Process</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.analyticsNumber}>{dashboardData?.data?.completed_clients || 0}</Text>
            <Text style={styles.analyticsLabel}>Completed</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={styles.analyticsNumber}>{dashboardData?.data?.urgent_tasks || 0}</Text>
            <Text style={styles.analyticsLabel}>Urgent Tasks</Text>
          </View>
        </View>
      </View>

      {/* Client Status Breakdown */}
      {analyticsData && analyticsData.data && analyticsData.data.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Status Breakdown</Text>
          <View style={styles.statusContainer}>
            {analyticsData.data.map((item, index) => (
              <View key={index} style={styles.statusItem}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
                <View style={styles.statusContent}>
                  <Text style={styles.statusText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={styles.statusCount}>{item.client_count} clients</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Upcoming Travels */}
      {upcomingTravels && upcomingTravels.data && upcomingTravels.data.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Travels</Text>
            <TouchableOpacity onPress={() => router.push('/(verticals)/travel-agent/clients')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listContainer}>
            {upcomingTravels.data.map((travel, index) => (
              <TouchableOpacity
                key={index}
                style={styles.listItem}
                onPress={() => router.push(`/(verticals)/travel-agent/clients/${travel.client_id}`)}
              >
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{travel.full_name}</Text>
                  <Text style={styles.listItemSubtitle}>
                    {travel.airline} • {travel.pnr_number}
                  </Text>
                  {travel.departure_date && (
                    <Text style={styles.listItemDate}>
                      Departure: {new Date(travel.departure_date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(travel.travel_urgency) }]}>
                  <Text style={styles.urgencyText}>{travel.travel_urgency.replace('_', ' ')}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Pending Tasks */}
      {pendingTasks && pendingTasks.data && pendingTasks.data.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/(verticals)/travel-agent/clients')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listContainer}>
            {pendingTasks.data.map((task, index) => (
              <TouchableOpacity
                key={index}
                style={styles.listItem}
                onPress={() => router.push(`/(verticals)/travel-agent/clients/${task.client_id}`)}
              >
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{task.reminder_title}</Text>
                  <Text style={styles.listItemSubtitle}>{task.full_name}</Text>
                  <Text style={styles.listItemDate}>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.urgencyBadge, { backgroundColor: getPriorityColor(task.urgency === 'overdue' ? 'urgent' : 'normal') }]}>
                  <Text style={styles.urgencyText}>{task.urgency.replace('_', ' ')}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(verticals)/travel-agent/clients/new')}
          >
            <Ionicons name="person-add" size={24} color="#3B82F6" />
            <Text style={styles.actionText}>Add Client</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(verticals)/travel-agent/trips')}
          >
            <Ionicons name="airplane" size={24} color="#10B981" />
            <Text style={styles.actionText}>Manage Trips</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(verticals)/travel-agent/clients')}
          >
            <Ionicons name="people" size={24} color="#8B5CF6" />
            <Text style={styles.actionText}>All Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(verticals)/travel-agent/visas')}
          >
            <Ionicons name="document-text" size={24} color="#F59E0B" />
            <Text style={styles.actionText}>Visa Status</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  analyticsSection: {
    padding: 24,
  },
  section: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  statusCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  listItemDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
  },
})