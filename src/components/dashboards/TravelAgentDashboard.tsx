
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useDashboardSummary, useClientAnalytics, useClients, useUpcomingTravels, usePendingTasks } from '../../hooks/useTravelAgent'
import { useTodaysFollowUps, useLeadStatistics } from '../../hooks/useLeads'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TravelAgentCalendarWidget } from '../widgets/travelAgent/TravelAgentCalendarWidget'
import TopStatsWidget from '../widgets/travelAgent/TopStatsWidget'
import { SmartRemindersWidget } from '../widgets/travelAgent/SmartRemindersWidget'
import { EarningsWidget } from '../widgets/travelAgent/EarningsWidget'

const { width } = Dimensions.get('window')

export default function TravelAgentDashboard() {
    const insets = useSafeAreaInsets()
    const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useDashboardSummary()
    const { data: analyticsData } = useClientAnalytics()
    const { data: clientsData, refetch: refetchClients } = useClients(1, 10)
    const { data: todaysFollowUpsData } = useTodaysFollowUps()
    const { data: leadStatsData } = useLeadStatistics()
    const { data: travelsData } = useUpcomingTravels(100)
    const { data: tasksData } = usePendingTasks(100)
    const [companyLogo, setCompanyLogo] = useState<string | null>(null)

    const clients = clientsData?.data?.data || []
    const todaysFollowUps = todaysFollowUpsData?.data || []
    const leadStats = leadStatsData?.data
    const travels = travelsData?.data || []
    const tasks = tasksData?.data || []

    // Prepare notifications for the widget
    const todaysNotifications = []

    // Check for today's tasks
    const todayTaskCount = tasks?.filter(t => {
        if (!t.due_date) return false
        const taskDate = new Date(t.due_date).toDateString()
        const today = new Date().toDateString()
        return taskDate === today
    }).length || 0
    
    if (todayTaskCount > 0) {
        todaysNotifications.push({
            id: 'tasks',
            type: 'task' as const,
            title: 'Tasks Due Today',
            subtitle: `${todayTaskCount} task${todayTaskCount > 1 ? 's' : ''}`,
            count: todayTaskCount,
            route: '/(verticals)/travel-agent/tasks'
        })
    }

    // Check for today's travels
    const todayTravelCount = travels?.filter(t => {
        if (!t.departure_date) return false
        const travelDate = new Date(t.departure_date).toDateString()
        const today = new Date().toDateString()
        return travelDate === today
    }).length || 0
    
    if (todayTravelCount > 0) {
        todaysNotifications.push({
            id: 'travels',
            type: 'trip' as const,
            title: 'Trips Today',
            subtitle: `${todayTravelCount} trip${todayTravelCount > 1 ? 's' : ''}`,
            count: todayTravelCount,
            route: '/(verticals)/travel-agent/trips'
        })
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
            // Refetch dashboard data when screen is focused
            refetchDashboard()
            refetchClients()
        }, [refetchDashboard, refetchClients])
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
            case 'in_progress': return ['#3C51BF', '#2730A3']
            case 'rejected': return ['#F687B3', '#ED64A6']
            case 'completed': return ['#48BB78', '#38A169']
            default: return ['#A0AEC0', '#718096']
        }
    }

    if (dashboardLoading && !dashboardData) {
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
                    totalClients={clients.filter(c => c.status === 'in_progress').length}
                    activeClients={dashboardData?.data?.in_process_clients || 0}
                    completedClients={dashboardData?.data?.completed_clients || 0}
                    urgentTasks={dashboardData?.data?.urgent_tasks || 0}
                    leadsToFollow={leadStats?.todays_followups || 0}
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

                    {/*<TouchableOpacity style={styles.actionButton} onPress={signOut}>
                        <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.actionIcon}>
                            <Ionicons name="log-out" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Sign Out</Text>
                    </TouchableOpacity>*/}
                </ScrollView>

                {/* Calendar Widget */}
                <TravelAgentCalendarWidget />

                {/* Smart Reminders Widget */}
                <SmartRemindersWidget />

                {/* Active Clients Widget */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Clients</Text>
                    <TouchableOpacity onPress={() => router.push('/(verticals)/travel-agent/clients')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.clientsScroll}
                >
                    {clients.filter(client => client.status === 'in_progress').map((client) => (
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

                    {clients.filter(client => client.status === 'in_progress').length === 0 && (
                        <View style={styles.emptyClients}>
                            <Ionicons name="people-outline" size={32} color="#9CA3AF" />
                            <Text style={styles.emptyText}>No active clients</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Earnings Widget */}
                <EarningsWidget />

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
        shadowColor: '#0D8ABC',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
        borderRadius: 26,
    },
    profileImage: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 3,
        borderColor: '#fff',
        backgroundColor: '#DBEAFE',
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
})

