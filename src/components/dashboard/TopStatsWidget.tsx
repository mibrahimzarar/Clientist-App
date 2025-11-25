import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'

interface Notification {
  id: string
  type: 'trip' | 'task' | 'lead'
  title: string
  subtitle: string
  count?: number
  route: string
}

interface TopStatsWidgetProps {
  totalClients: number
  activeClients: number
  completedClients: number
  urgentTasks: number
  notifications?: Notification[]
  onClientPress?: () => void
}

export default function TopStatsWidget({
  totalClients,
  activeClients,
  completedClients,
  urgentTasks,
  notifications = [],
  onClientPress
}: TopStatsWidgetProps) {
  const hasNotifications = notifications.length > 0

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'trip': return 'airplane'
      case 'task': return 'checkbox'
      case 'lead': return 'person-add'
      default: return 'notifications'
    }
  }

  const getNotificationColor = (type: string): [string, string] => {
    switch (type) {
      case 'trip': return ['#10B981', '#059669']
      case 'task': return ['#ba509eff', '#ae0e83ff']
      case 'lead': return ['#6366F1', '#4F46E5']
      default: return ['#6B7280', '#4B5563']
    }
  }

  return (
    <View style={styles.container}>
      {/* Main Stats Card */}
      <View>
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCard}
        >
          {/* Top Section */}
          <View style={styles.topSection}>
            <View style={styles.mainStats}>
              <View style={styles.clientIconContainer}>
                <Ionicons name="people" size={32} color="#fff" />
              </View>
              <View style={styles.mainStatsContent}>
                <Text style={styles.mainLabel}>Total Clients</Text>
                <Text style={styles.mainNumber}>{totalClients}</Text>
              </View>
            </View>
            
            {urgentTasks > 0 && (
              <View style={styles.urgentBadge}>
                <Ionicons name="alert-circle" size={16} color="#fff" />
                <Text style={styles.urgentText}>{urgentTasks} Urgent</Text>
              </View>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            
            
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={18} color="#34D399" />
              </View>
              <View>
                <Text style={styles.statNumber}>{completedClients}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
            
            
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="trending-up" size={18} color="#60A5WA" />
              </View>
              <View>
                <Text style={styles.statNumber}>
                  {totalClients > 0 ? Math.round((completedClients / totalClients) * 100) : 0}%
                </Text>
                <Text style={styles.statLabel}>Success</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Notifications Section */}
      {hasNotifications && (
        <View style={styles.notificationsContainer}>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationHeaderLeft}>
              <Ionicons name="time" size={18} color="#6366F1" />
              <Text style={styles.notificationHeaderText}>Today's Schedule</Text>
            </View>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
            </View>
          </View>

          <View style={styles.notificationsList}>
            {notifications.map((notification, index) => {
              const colors = getNotificationColor(notification.type)
              return (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    index === notifications.length - 1 && styles.notificationCardLast
                  ]}
                  onPress={() => router.push(notification.route as any)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[...colors, colors[1]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.notificationGradient}
                  >
                    <View style={styles.notificationIconContainer}>
                      <Ionicons 
                        name={getNotificationIcon(notification.type) as any} 
                        size={20} 
                        color="#fff" 
                      />
                    </View>
                  </LinearGradient>

                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationSubtitle}>{notification.subtitle}</Text>
                  </View>

                  {notification.count && notification.count > 1 && (
                    <View style={[styles.countBadge, { backgroundColor: `${colors[0]}20` }]}>
                      <Text style={[styles.countBadgeText, { color: colors[0] }]}>
                        {notification.count}
                      </Text>
                    </View>
                  )}

                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  mainCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  mainStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clientIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainStatsContent: {
    gap: 4,
  },
  mainLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mainNumber: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 40,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  urgentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  notificationsContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notificationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  notificationBadge: {
    backgroundColor: '#EEF2FF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  notificationsList: {
    gap: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  notificationCardLast: {
    marginBottom: 0,
  },
  notificationGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 2,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  notificationSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
})
