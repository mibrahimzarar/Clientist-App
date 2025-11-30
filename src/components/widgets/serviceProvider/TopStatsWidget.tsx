import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'

interface Notification {
    id: string
    type: 'task' | 'lead' | 'invoice'
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

export const TopStatsWidget: React.FC<TopStatsWidgetProps> = ({
    totalClients,
    activeClients,
    completedClients,
    urgentTasks,
    notifications = [],
    onClientPress
}) => {
    const hasNotifications = notifications.length > 0

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'task': return 'hammer'
            case 'lead': return 'person-add'
            case 'invoice': return 'receipt'
            default: return 'notifications'
        }
    }

    const getNotificationColor = (type: string): [string, string] => {
        switch (type) {
            case 'task': return ['#EC4899', '#DB2777']
            case 'lead': return ['#F59E0B', '#D97706']
            case 'invoice': return ['#10B981', '#059669']
            default: return ['#6B7280', '#4B5563']
        }
    }

    return (
        <View style={styles.container}>
            {/* Main Stats Card */}
            <View>
                <LinearGradient
                    colors={['#0D8ABC', '#0A5F8F']}
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
                                <Text style={styles.mainLabel}>Active Clients</Text>
                                <Text style={styles.mainNumber}>{activeClients}</Text>
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
                                <Ionicons name="layers" size={18} color="#80A5GC" />
                            </View>
                            <View>
                                <Text style={styles.statNumber}>{totalClients}</Text>
                                <Text style={styles.statLabel}>Total</Text>
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
                                    {(notification.count !== undefined && notification.count > 1) ? (
                                        <View style={[styles.countBadge, { backgroundColor: `${colors[0]}20` }]}>
                                            <Text style={[styles.countBadgeText, { color: colors[0] }]}>
                                                {notification.count.toString()}
                                            </Text>
                                        </View>
                                    ) : null}
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
        shadowColor: '#0D8ABC',
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
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
    },
    mainNumber: {
        fontSize: 36,
        fontWeight: '800',
        color: '#fff',
    },
    urgentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239,68,68,0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    urgentText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    notificationsContainer: {
        marginTop: 16,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    notificationHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    notificationHeaderText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    notificationsList: {
        padding: 16,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 12,
    },
    notificationCardLast: {
        borderBottomWidth: 0,
        paddingBottom: 0,
    },
    notificationGradient: {
        width: 40,
        height: 40,
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
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    notificationSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    countBadge: {
        minWidth: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
})
