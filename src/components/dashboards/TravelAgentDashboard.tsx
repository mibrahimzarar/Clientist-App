
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useDashboardSummary, useClientAnalytics, useUpcomingTravels, usePendingTasks, useClients } from '../../hooks/useTravelAgent'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

export default function TravelAgentDashboard() {
    const insets = useSafeAreaInsets()
    const { data: dashboardData, isLoading: dashboardLoading } = useDashboardSummary()
    const { data: analyticsData } = useClientAnalytics()
    const { data: upcomingTravels } = useUpcomingTravels(5)
    const { data: pendingTasks } = usePendingTasks(5)
    const { data: clientsData } = useClients(1, 10)
    const [companyLogo, setCompanyLogo] = useState<string | null>(null)

    const clients = clientsData?.data?.data || []

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
            case 'new': return ['#3B82F6', '#2563EB']
            case 'in_process': return ['#F59E0B', '#D97706']
            case 'documents_pending': return ['#EF4444', '#DC2626']
            case 'submitted': return ['#8B5CF6', '#7C3AED']
            case 'approved': return ['#10B981', '#059669']
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

                {/* Hero Card */}
                <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    <View style={styles.heroContent}>
                        <View>
                            <Text style={styles.heroLabel}>Total Clients</Text>
                            <Text style={styles.heroNumber}>{dashboardData?.data?.total_clients || 0}</Text>
                        </View>
                        <View style={styles.heroIconContainer}>
                            <Ionicons name="people" size={32} color="#fff" />
                        </View>
                    </View>
                    <View style={styles.heroStats}>
                        <View style={styles.heroStatItem}>
                            <Text style={styles.heroStatNumber}>{dashboardData?.data?.in_process_clients || 0}</Text>
                            <Text style={styles.heroStatLabel}>Active</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.heroStatItem}>
                            <Text style={styles.heroStatNumber}>{dashboardData?.data?.completed_clients || 0}</Text>
                            <Text style={styles.heroStatLabel}>Completed</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.heroStatItem}>
                            <Text style={styles.heroStatNumber}>{dashboardData?.data?.urgent_tasks || 0}</Text>
                            <Text style={styles.heroStatLabel}>Urgent</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll} contentContainerStyle={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/travel-agent/clients/new')}>
                        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.actionIcon}>
                            <Ionicons name="person-add" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Add Client</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/travel-agent/trips')}>
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.actionIcon}>
                            <Ionicons name="airplane" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Trips</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/travel-agent/visas')}>
                        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionIcon}>
                            <Ionicons name="document-text" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Visas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={signOut}>
                        <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.actionIcon}>
                            <Ionicons name="log-out" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Sign Out</Text>
                    </TouchableOpacity>
                </ScrollView>

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
                                    <Text style={styles.clientInitials}>
                                        {client.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                    </Text>
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
                                <Text style={styles.widgetTitle}>Upcoming Travels</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/(verticals)/travel-agent/clients')}>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                            </TouchableOpacity>
                        </LinearGradient>

                        <View style={styles.widgetContent}>
                            {upcomingTravels?.data?.slice(0, 3).map((travel, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.widgetItem}
                                    onPress={() => router.push(`/(verticals)/travel-agent/clients/${travel.client_id}`)}
                                >
                                    <View style={styles.widgetItemIcon}>
                                        <Ionicons name="person" size={16} color="#10B981" />
                                    </View>
                                    <View style={styles.widgetItemContent}>
                                        <Text style={styles.widgetItemTitle}>{travel.full_name}</Text>
                                        <Text style={styles.widgetItemSubtitle}>{travel.airline} • {travel.pnr_number}</Text>
                                    </View>
                                    <Text style={styles.widgetItemDate}>
                                        {new Date(travel.departure_date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            {(!upcomingTravels?.data || upcomingTravels.data.length === 0) && (
                                <View style={styles.widgetEmpty}>
                                    <Text style={styles.widgetEmptyText}>No upcoming travels</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Pending Tasks Widget */}
                    <View style={styles.widget}>
                        <LinearGradient
                            colors={['#F59E0B', '#D97706']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.widgetHeader}
                        >
                            <View style={styles.widgetHeaderContent}>
                                <Ionicons name="checkbox" size={20} color="#fff" />
                                <Text style={styles.widgetTitle}>Pending Tasks</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/(verticals)/travel-agent/clients')}>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                            </TouchableOpacity>
                        </LinearGradient>

                        <View style={styles.widgetContent}>
                            {pendingTasks?.data?.slice(0, 3).map((task, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.widgetItem}
                                    onPress={() => router.push(`/(verticals)/travel-agent/clients/${task.client_id}`)}
                                >
                                    <View style={[
                                        styles.widgetItemIcon,
                                        { backgroundColor: task.urgency === 'overdue' ? '#FEE2E2' : '#FEF3C7' }
                                    ]}>
                                        <Ionicons
                                            name={task.urgency === 'overdue' ? 'warning' : 'time'}
                                            size={16}
                                            color={task.urgency === 'overdue' ? '#EF4444' : '#F59E0B'}
                                        />
                                    </View>
                                    <View style={styles.widgetItemContent}>
                                        <Text style={styles.widgetItemTitle}>{task.reminder_title}</Text>
                                        <Text style={styles.widgetItemSubtitle}>{task.full_name}</Text>
                                    </View>
                                    <Text style={styles.widgetItemDate}>
                                        {new Date(task.due_date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            {(!pendingTasks?.data || pendingTasks.data.length === 0) && (
                                <View style={styles.widgetEmpty}>
                                    <Text style={styles.widgetEmptyText}>No pending tasks</Text>
                                </View>
                            )}
                        </View>
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
    heroCard: {
        marginHorizontal: 24,
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    heroLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    heroNumber: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '800',
    },
    heroIconContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 12,
        borderRadius: 16,
    },
    heroStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
    },
    heroStatItem: {
        alignItems: 'center',
        flex: 1,
    },
    heroStatNumber: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    heroStatLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
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
    },
})

