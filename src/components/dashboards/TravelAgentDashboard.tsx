
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useDashboardSummary, useClientAnalytics, useUpcomingTravels, usePendingTasks, useClients } from '../../hooks/useTravelAgent'
import { useTodaysFollowUps, useLeadStatistics } from '../../hooks/useLeads'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CalendarWidget } from '../calendar/CalendarWidget'
import TopStatsWidget from '../dashboard/TopStatsWidget'

const { width } = Dimensions.get('window')

export default function TravelAgentDashboard() {
    const insets = useSafeAreaInsets()
    const { data: dashboardData, isLoading: dashboardLoading } = useDashboardSummary()
    const { data: analyticsData } = useClientAnalytics()
    const { data: upcomingTravels } = useUpcomingTravels(100) // Get more items
    const { data: pendingTasks } = usePendingTasks(100) // Get more items
    const { data: clientsData } = useClients(1, 10)
    const { data: todaysFollowUpsData } = useTodaysFollowUps()
    const { data: leadStatsData } = useLeadStatistics()
    const [companyLogo, setCompanyLogo] = useState<string | null>(null)

    const clients = clientsData?.data?.data || []
    const todaysFollowUps = todaysFollowUpsData?.data || []
    const leadStats = leadStatsData?.data

    // Prepare notifications for the widget
    const todaysNotifications = []
    
    // Add trip notifications
    if (upcomingTravels?.data && upcomingTravels.data.length > 0) {
        const todaysTrips = upcomingTravels.data.filter(travel => {
            const travelDate = new Date(travel.departure_date || '')
            const today = new Date()
            return travelDate.toDateString() === today.toDateString()
        })
        if (todaysTrips.length > 0) {
            todaysNotifications.push({
                id: 'trips',
                type: 'trip' as const,
                title: 'Trips Today',
                subtitle: `${todaysTrips.length} ${todaysTrips.length === 1 ? 'client departing' : 'clients departing'} today`,
                count: todaysTrips.length,
                route: '/(verticals)/travel-agent/trips'
            })
        }
    }
    
    // Add task notifications
    if (pendingTasks?.data && pendingTasks.data.length > 0) {
        const todaysTasks = pendingTasks.data.filter(task => {
            const taskDate = new Date(task.due_date)
            const today = new Date()
            return taskDate.toDateString() === today.toDateString()
        })
        if (todaysTasks.length > 0) {
            todaysNotifications.push({
                id: 'tasks',
                type: 'task' as const,
                title: 'Tasks Due Today',
                subtitle: `${todaysTasks.length} ${todaysTasks.length === 1 ? 'task needs' : 'tasks need'} attention`,
                count: todaysTasks.length,
                route: '/(verticals)/travel-agent/tasks'
            })
        }
    }
    
    // Add lead follow-up notifications
    if (todaysFollowUps.length > 0) {
        todaysNotifications.push({
            id: 'leads',
            type: 'lead' as const,
            title: 'Lead Follow-ups',
            subtitle: `${todaysFollowUps.length} ${todaysFollowUps.length === 1 ? 'lead to' : 'leads to'} contact today`,
            count: todaysFollowUps.length,
            route: '/(verticals)/travel-agent/leads'
        })
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchProfile()
        }, [])
    )

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('company_logo')
                    .eq('id', user.id)
                    .single()

                if (data?.company_logo) {
                    setCompanyLogo(data.company_logo)
                }
            }
        } catch (error) {
            console.log('Error fetching profile:', error)
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    const getStatusColor = (status: string): [string, string] => {
        switch (status) {
            case 'pending': return ['#6B7280', '#4B5563']
            case 'in_progress': return ['#F59E0B', '#D97706']
            case 'rejected': return ['#DC2626', '#B91C1C']
            case 'completed': return ['#059669', '#047857']
            default: return ['#6B7280', '#4B5563']
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
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.name}>Agent</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/(app)/profile')} style={styles.profileButton}>
                        <Image
                            source={{ uri: companyLogo || 'https://ui-avatars.com/api/?name=Travel+Agent&background=0D8ABC&color=fff' }}
                            style={styles.profileImage}
                        />
                    </TouchableOpacity>
                </View>

                {/* Top Stats Widget */}
                <TopStatsWidget
                    totalClients={dashboardData?.data?.total_clients || 0}
                    activeClients={dashboardData?.data?.in_process_clients || 0}
                    completedClients={dashboardData?.data?.completed_clients || 0}
                    urgentTasks={dashboardData?.data?.urgent_tasks || 0}
                    notifications={todaysNotifications}
                    onClientPress={() => router.push('/(verticals)/travel-agent/clients')}
                />

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll} contentContainerStyle={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/travel-agent/clients')}>
                        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.actionIcon}>
                            <Ionicons name="people" size={25} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Clients</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/travel-agent/trips')}>
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.actionIcon}>
                            <Ionicons name="airplane" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Trips</Text>
                    </TouchableOpacity>


                    {/* <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/travel-agent/notes')}>
                        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionIcon}>
                            <Ionicons name="create" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Notes</Text>
                    </TouchableOpacity> */}

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/travel-agent/tasks')}>
                        <LinearGradient colors={['#ba509eff', '#ae0e83ff']} style={styles.actionIcon}>
                            <Ionicons name="checkbox" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Tasks</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/travel-agent/leads')}>
                        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionIcon}>
                            <Ionicons name="person-add" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Leads</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/travel-agent/documents')}>
                        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionIcon}>
                            <Ionicons name="document-text" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Documents</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={signOut}>
                        <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.actionIcon}>
                            <Ionicons name="log-out" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Sign Out</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Calendar Widget */}
                <CalendarWidget />

                {/* Recent Clients Widget */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Clients</Text>
                    <TouchableOpacity onPress={() => router.push('/(verticals)/travel-agent/clients')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.clientsScroll}
                >
                    {clients.map((client) => (
                        <TouchableOpacity
                            key={client.id}
                            style={styles.clientCard}
                            onPress={() => router.push(`/(verticals)/travel-agent/clients/${client.id}`)}
                        >
                            <LinearGradient
                                colors={getStatusColor(client.status)}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.clientGradient}
                            >
                                <View style={styles.clientAvatar}>
                                    {client.profile_picture_url ? (
                                        <Image
                                            source={{ uri: client.profile_picture_url }}
                                            style={styles.clientAvatarImage}
                                        />
                                    ) : (
                                        <Text style={styles.clientInitials}>
                                            {client.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'NA'}
                                        </Text>
                                    )}
                                </View>
                                <Text style={styles.clientName} numberOfLines={1}>{client.full_name}</Text>
                                <View style={styles.clientInfo}>
                                    <Ionicons name="location" size={12} color="rgba(255,255,255,0.9)" />
                                    <Text style={styles.clientCountry} numberOfLines={1}>{client.country}</Text>
                                </View>
                                <View style={styles.clientStatus}>
                                    <Text style={styles.clientStatusText}>{client.status.replace('_', ' ')}</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}

                    {clients.length === 0 && (
                        <View style={styles.emptyClients}>
                            <Ionicons name="people-outline" size={32} color="#9CA3AF" />
                            <Text style={styles.emptyText}>No clients yet</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Widgets Container */}
                <View style={styles.bottomWidgets}>

                    {/* Today's Lead Follow-ups Widget */}
                    {todaysFollowUps.length > 0 && (
                        <View style={styles.widget}>
                            <LinearGradient
                                colors={['#6366F1', '#4F46E5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.widgetHeader}
                            >
                                <View style={styles.widgetHeaderContent}>
                                    <Ionicons name="person-add" size={20} color="#fff" />
                                    <Text style={styles.widgetTitle}>Today's Lead Follow-ups</Text>
                                </View>
                                <TouchableOpacity onPress={() => router.push('/(verticals)/travel-agent/leads')}>
                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                                </TouchableOpacity>
                            </LinearGradient>

                            <View style={styles.widgetContent}>
                                {todaysFollowUps.slice(0, 3).map((followUp, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.widgetItem}
                                        onPress={() => router.push(`/(verticals)/travel-agent/leads/${followUp.id}` as any)}
                                    >
                                        <View style={styles.widgetItemIcon}>
                                            <Ionicons name="person" size={16} color="#6366F1" />
                                        </View>
                                        <View style={styles.widgetItemContent}>
                                            <Text style={styles.widgetItemTitle}>{followUp.full_name}</Text>
                                            <Text style={styles.widgetItemSubtitle}>{followUp.phone_number}</Text>
                                        </View>
                                        <View style={[styles.leadStatusBadge, { backgroundColor: '#EEF2FF' }]}>
                                            <Text style={[styles.leadStatusText, { color: '#6366F1' }]}>
                                                {followUp.lead_status.replace('_', ' ')}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                                {todaysFollowUps.length === 0 && (
                                    <View style={styles.widgetEmpty}>
                                        <Text style={styles.widgetEmptyText}>No follow-ups today</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Upcoming Travels Widget */}
                    <View style={styles.widget}>
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.widgetHeader}
                        >
                            <View style={styles.widgetHeaderContent}>
                                <Ionicons name="airplane" size={20} color="#fff" />
                                <Text style={styles.widgetTitle}>Upcoming Travels (30 Days)</Text>
                            </View>
                            <View style={styles.countBadge}>
                                <Text style={styles.countBadgeText}>{upcomingTravels?.data?.length || 0}</Text>
                            </View>
                        </LinearGradient>

                        <ScrollView 
                            style={styles.widgetScrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {upcomingTravels?.data?.map((travel, index) => {
                                const departureDate = new Date(travel.departure_date || Date.now())
                                const today = new Date()
                                const daysUntil = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                                
                                let urgencyColor = '#6B7280'
                                let urgencyBg = '#F3F4F6'
                                let urgencyText = `${daysUntil}d`
                                
                                if (daysUntil === 0) {
                                    urgencyColor = '#EF4444'
                                    urgencyBg = '#FEE2E2'
                                    urgencyText = 'Today'
                                } else if (daysUntil === 1) {
                                    urgencyColor = '#F59E0B'
                                    urgencyBg = '#FEF3C7'
                                    urgencyText = 'Tomorrow'
                                } else if (daysUntil <= 7) {
                                    urgencyColor = '#10B981'
                                    urgencyBg = '#D1FAE5'
                                }
                                
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.widgetItem,
                                            index === (upcomingTravels?.data?.length || 0) - 1 && styles.widgetItemLast
                                        ]}
                                        onPress={() => router.push(`/(verticals)/travel-agent/clients/${travel.client_id}`)}
                                    >
                                        <View style={styles.widgetItemIcon}>
                                            <Ionicons name="airplane" size={16} color="#10B981" />
                                        </View>
                                        <View style={styles.widgetItemContent}>
                                            <Text style={styles.widgetItemTitle}>{travel.full_name}</Text>
                                            <Text style={styles.widgetItemSubtitle}>
                                                {travel.airline} • {travel.pnr_number}
                                            </Text>
                                        </View>
                                        <View style={[styles.urgencyBadge, { backgroundColor: urgencyBg }]}>
                                            <Text style={[styles.urgencyBadgeText, { color: urgencyColor }]}>
                                                {urgencyText}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })}
                            {(!upcomingTravels?.data || upcomingTravels.data.length === 0) && (
                                <View style={styles.widgetEmpty}>
                                    <Ionicons name="airplane-outline" size={32} color="#D1D5DB" />
                                    <Text style={styles.widgetEmptyText}>No upcoming travels</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    {/* Pending Tasks Widget */}
                    <View style={styles.widget}>
                        <LinearGradient
                            colors={['#ba509eff', '#ae0e83ff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.widgetHeader}
                        >
                            <View style={styles.widgetHeaderContent}>
                                <Ionicons name="checkbox" size={20} color="#fff" />
                                <Text style={styles.widgetTitle}>Pending Tasks (30 Days)</Text>
                            </View>
                            <View style={styles.countBadge}>
                                <Text style={styles.countBadgeText}>{pendingTasks?.data?.length || 0}</Text>
                            </View>
                        </LinearGradient>

                        <ScrollView 
                            style={styles.widgetScrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {pendingTasks?.data?.map((task, index) => {
                                const dueDate = new Date(task.due_date || Date.now())
                                const today = new Date()
                                const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                                
                                let urgencyColor = '#6B7280'
                                let urgencyBg = '#F3F4F6'
                                let urgencyText = `${daysUntil}d`
                                
                                if (daysUntil === 0) {
                                    urgencyColor = '#EF4444'
                                    urgencyBg = '#FEE2E2'
                                    urgencyText = 'Today'
                                } else if (daysUntil === 1) {
                                    urgencyColor = '#F59E0B'
                                    urgencyBg = '#FEF3C7'
                                    urgencyText = 'Tomorrow'
                                } else if (daysUntil <= 7) {
                                    urgencyColor = '#ba509eff'
                                    urgencyBg = '#F3E8FF'
                                }
                                
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.widgetItem,
                                            index === (pendingTasks?.data?.length || 0) - 1 && styles.widgetItemLast
                                        ]}
                                        onPress={() => router.push(`/(verticals)/travel-agent/clients/${task.client_id}`)}
                                    >
                                        <View style={styles.widgetItemIcon}>
                                            <Ionicons name="checkbox" size={16} color="#ba509eff" />
                                        </View>
                                        <View style={styles.widgetItemContent}>
                                            <Text style={styles.widgetItemTitle}>{task.title}</Text>
                                            <Text style={styles.widgetItemSubtitle}>{task.full_name}</Text>
                                        </View>
                                        <View style={[styles.urgencyBadge, { backgroundColor: urgencyBg }]}>
                                            <Text style={[styles.urgencyBadgeText, { color: urgencyColor }]}>
                                                {urgencyText}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })}
                            {(!pendingTasks?.data || pendingTasks.data.length === 0) && (
                                <View style={styles.widgetEmpty}>
                                    <Ionicons name="checkbox-outline" size={32} color="#D1D5DB" />
                                    <Text style={styles.widgetEmptyText}>No pending tasks</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                </View>

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
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
        paddingHorizontal: 24,
        paddingVertical: 20,
        marginTop: 40,
    },
    greeting: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    name: {
        fontSize: 28,
        color: '#111827',
        fontWeight: '800',
    },
    profileButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#fff',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginLeft: 24,
        marginBottom: 16,
    },
    actionsScroll: {
        marginBottom: 32,
    },
    actionsContainer: {
        paddingHorizontal: 24,
        gap: 16,
    },
    actionButton: {
        alignItems: 'center',
        marginRight: 4,
    },
    actionIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    seeAll: {
        color: '#4F46E5',
        fontWeight: '600',
        fontSize: 14,
    },
    clientsScroll: {
        paddingHorizontal: 24,
        paddingBottom: 8,
        gap: 12,
    },
    clientCard: {
        width: 140,
        height: 160,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    clientGradient: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    clientAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    clientInitials: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    clientAvatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    clientName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    clientCountry: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
    },
    clientStatus: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    clientStatusText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'capitalize',
    },
    emptyClients: {
        width: 140,
        height: 160,
        backgroundColor: '#fff',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 8,
    },
    bottomWidgets: {
        paddingHorizontal: 24,
        marginTop: 24,
        gap: 16,
    },
    widget: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    widgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    widgetHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    widgetTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    widgetContent: {
        padding: 16,
        paddingTop: 8,
    },
    widgetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    widgetItemIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    widgetItemContent: {
        flex: 1,
    },
    widgetItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    widgetItemSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    widgetItemDate: {
        fontSize: 12,
        fontWeight: '500',
        color: '#9CA3AF',
    },
    widgetEmpty: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    widgetEmptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    leadStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    leadStatusText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    widgetScrollContent: {
        maxHeight: 350,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    urgencyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    urgencyBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    widgetItemLast: {
        borderBottomWidth: 0,
    },
})

