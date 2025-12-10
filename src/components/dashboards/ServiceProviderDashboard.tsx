import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { useSPDashboardStats, useSPJobs, useSPLeads, useSPInvoices } from '../../hooks/useServiceProvider'
import { SPDashboardStats } from '../../types/serviceProvider'
import { TopStatsWidget } from '../widgets/serviceProvider/TopStatsWidget'
import { QuickActionsWidget } from '../widgets/serviceProvider/QuickActionsWidget'
import { EarningsWidget } from '../widgets/serviceProvider/EarningsWidget'
import { ServiceProviderCalendarWidget } from '../widgets/serviceProvider/ServiceProviderCalendarWidget'
import { LeadsWidget } from '../widgets/serviceProvider/LeadsWidget'
import { SmartRemindersWidget } from '../widgets/serviceProvider/SmartRemindersWidget'
import NotificationCenter from '../notifications/NotificationCenter'

export const ServiceProviderDashboard: React.FC = () => {
    const { data: statsData } = useSPDashboardStats()
    const { data: jobsData } = useSPJobs() // Fetch all jobs, not just in_progress
    const { data: leadsData } = useSPLeads()
    const { data: invoicesData } = useSPInvoices()
    const [companyLogo, setCompanyLogo] = useState<string | null>(null)
    const [companyName, setCompanyName] = useState<string>('Service Provider')

    const stats = statsData?.data
    const allJobs = jobsData?.data || []
    const jobs = allJobs.filter(j => j.status === 'in_progress') // Filter for active jobs widget
    const leads = leadsData?.data || []

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
                    .select('company_logo, company_name')
                    .eq('id', user.id)
                    .single()

                if (data?.company_logo) {
                    setCompanyLogo(data.company_logo)
                }
                if (data?.company_name) {
                    setCompanyName(data.company_name)
                }
            }
        } catch (error) {
            console.log('Error fetching profile:', error)
        }
    }

    // Prepare notifications for Today's Schedule
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toDateString()

    const todayJobsCount = allJobs?.filter(j => {
        if (!j.scheduled_date) return false
        const jobDate = new Date(j.scheduled_date)
        jobDate.setHours(0, 0, 0, 0)
        return jobDate.toDateString() === todayStr
    }).length || 0

    const overdueLeads = leads?.filter(l => {
        if (!l.next_follow_up) return false
        const followUpDate = new Date(l.next_follow_up)
        followUpDate.setHours(0, 0, 0, 0)
        return followUpDate.toDateString() === todayStr
    }).length || 0

    const dueInvoices = invoicesData?.data?.filter(inv => {
        if (!inv.due_date || inv.status === 'paid') return false
        const dueDate = new Date(inv.due_date)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate.toDateString() === todayStr
    }).length || 0

    const notifications = []

    if (todayJobsCount > 0) {
        notifications.push({
            id: 'jobs',
            type: 'task' as const,
            title: 'Jobs Scheduled Today',
            subtitle: `${todayJobsCount} job${todayJobsCount > 1 ? 's' : ''}`,
            count: todayJobsCount,
            route: '/(verticals)/service-provider/jobs'
        })
    }

    if (overdueLeads > 0) {
        notifications.push({
            id: 'leads',
            type: 'lead' as const,
            title: 'Leads to Follow Up',
            subtitle: `${overdueLeads} follow-up${overdueLeads > 1 ? 's' : ''}`,
            count: overdueLeads,
            route: '/(verticals)/service-provider/leads'
        })
    }

    if (dueInvoices > 0) {
        notifications.push({
            id: 'invoices',
            type: 'invoice' as const,
            title: 'Invoices Due Today',
            subtitle: `${dueInvoices} invoice${dueInvoices > 1 ? 's' : ''}`,
            count: dueInvoices,
            route: '/(verticals)/service-provider/invoices'
        })
    }

    if (!stats) {
        return null
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.name}>{companyName}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <NotificationCenter />
                        <TouchableOpacity onPress={() => router.push('/(app)/profile')} style={styles.profileButton}>
                            <Image
                                source={{ uri: companyLogo || `https://ui-avatars.com/api/?name=${companyName}&background=3B82F6&color=fff` }}
                                style={styles.profileImage}
                                contentFit="cover"
                                transition={200}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Top Stats Widget */}
                <TopStatsWidget
                    pendingJobs={stats?.jobs_in_progress || 0}
                    activeClients={stats?.active_clients || 0}
                    completedClients={stats?.total_jobs_completed || 0}
                    urgentTasks={stats?.urgent_jobs_count || 0}
                    notifications={notifications}
                />

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll} contentContainerStyle={styles.actionsContainer}>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/service-provider/clients')}>
                        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.actionIcon}>
                            <Ionicons name="people" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Clients</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/service-provider/jobs')}>
                        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionIcon}>
                            <Ionicons name="construct" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Jobs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/service-provider/invoices')}>
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.actionIcon}>
                            <Ionicons name="receipt" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Invoices</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/service-provider/leads')}>
                        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionIcon}>
                            <Ionicons name="person-add" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.actionText}>Leads</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Calendar Widget */}
                <ServiceProviderCalendarWidget />

                {/* Smart Reminders Widget */}
                <SmartRemindersWidget />

                {/* Active Jobs Widget */}
                <View style={styles.activeProjectsContainer}>
                    <View style={styles.widgetWithShadow}>
                        <View style={styles.widgetInner}>
                            <LinearGradient
                                colors={['#3B82F6', '#2563EB']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.widgetHeader}
                            >
                                <View style={styles.widgetHeaderContent}>
                                    <View style={styles.widgetIconContainer}>
                                        <Ionicons name="construct" size={20} color="#2563EB" />
                                    </View>
                                    <View>
                                        <Text style={styles.widgetTitle}>Pending Jobs</Text>
                                        <Text style={styles.widgetSubtitle}>{jobs.length} in pending</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => router.push('/(verticals)/service-provider/jobs')}>
                                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                                </TouchableOpacity>
                            </LinearGradient>

                            <View style={styles.widgetContent}>
                                {jobs.slice(0, 5).map((job, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.widgetItem,
                                            index === jobs.slice(0, 5).length - 1 && styles.widgetItemLast
                                        ]}
                                        onPress={() => router.push(`/(verticals)/service-provider/jobs/${job.id}` as any)}
                                    >
                                        <View style={[styles.widgetItemIcon, { backgroundColor: '#DBEAFE' }]}>
                                            <Ionicons name="hammer" size={16} color="#3B82F6" />
                                        </View>
                                        <View style={styles.widgetItemContent}>
                                            <Text style={styles.widgetItemTitle}>{job.title}</Text>
                                            <Text style={styles.widgetItemSubtitle}>{job.client?.full_name}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: '#DBEAFE' }]}>
                                            <Text style={[styles.statusText, { color: '#3B82F6' }]}>
                                                {job.status.replace('_', ' ')}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Leads Widget */}
                <LeadsWidget />

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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        marginTop: 40,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
        shadowColor: '#3B82F6',
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
    activeProjectsContainer: {
        paddingHorizontal: 24,
        marginTop: 15,
        marginBottom: 40,
    },
    widgetWithShadow: {
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 12,
        marginBottom: 0,
    },
    widgetInner: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    widgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    widgetHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    widgetIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    widgetTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    widgetSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
    },
    widgetContent: {
        padding: 20,
    },
    widgetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    widgetItemLast: {
        borderBottomWidth: 0,
        paddingBottom: 0,
    },
    widgetItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
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
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
})
