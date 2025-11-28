import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { useFreelancerStats, useActiveProjects, useFreelancerTasks, useFreelancerLeads, useFreelancerInvoices } from '../../hooks/useFreelancer'
import TopStatsWidget from '../widgets/freelancer/TopStatsWidget'
import { FreelancerCalendarWidget } from '../widgets/freelancer/FreelancerCalendarWidget'
import { SmartRemindersWidget } from '../widgets/freelancer/SmartRemindersWidget'
import { EarningsWidget } from '../widgets/freelancer/EarningsWidget'

const { width } = Dimensions.get('window')

export default function FreelancerDashboard() {
  const insets = useSafeAreaInsets()
  const { data: statsData } = useFreelancerStats()
  const { data: projectsData } = useActiveProjects()
  const { data: tasksData } = useFreelancerTasks()
  const { data: leadsData } = useFreelancerLeads()
  const { data: invoicesData } = useFreelancerInvoices()
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)

  const stats = statsData
  const projects = projectsData?.data || []
  const tasks = tasksData?.data || []
  const leads = leadsData?.data || []
  
  // Calculate total projects (not just active) for success percentage
  const totalProjects = (stats?.active_projects || 0) + (stats?.completed_projects || 0)

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

  // Prepare notifications for Today's Schedule
  const todayTaskCount = tasks?.filter(t => {
    if (!t.due_date) return false
    const taskDate = new Date(t.due_date).toDateString()
    const today = new Date().toDateString()
    return taskDate === today
  }).length || 0
  const overdueLead = leads?.filter(l => l.next_follow_up && new Date(l.next_follow_up).toDateString() === new Date().toDateString()).length || 0
  const dueInvoices = invoicesData?.data?.filter(inv => {
    const dueDate = new Date(inv.due_date).toDateString()
    const today = new Date().toDateString()
    return dueDate === today && inv.status !== 'paid'
  }).length || 0
  const notifications = []

  if (todayTaskCount > 0) {
    notifications.push({
      id: 'tasks',
      type: 'task' as const,
      title: 'Tasks Due Today',
      subtitle: `${todayTaskCount} task${todayTaskCount > 1 ? 's' : ''}`,
      count: todayTaskCount,
      route: '/(verticals)/freelancer/tasks'
    })
  }

  if (overdueLead > 0) {
    notifications.push({
      id: 'leads',
      type: 'lead' as const,
      title: 'Leads to Follow Up',
      subtitle: `${overdueLead} follow-up${overdueLead > 1 ? 's' : ''}`,
      count: overdueLead,
      route: '/(verticals)/freelancer/leads'
    })
  }

  if (dueInvoices > 0) {
    notifications.push({
      id: 'invoices',
      type: 'invoice' as const,
      title: 'Invoices Due Today',
      subtitle: `${dueInvoices} invoice${dueInvoices > 1 ? 's' : ''}`,
      count: dueInvoices,
      route: '/(verticals)/freelancer/invoices'
    })
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>Freelancer</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/profile')} style={styles.profileButton}>
            <Image
              source={{ uri: companyLogo || 'https://ui-avatars.com/api/?name=Freelancer&background=8B5CF6&color=fff' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Top Stats Widget */}
        <TopStatsWidget
          totalClients={totalProjects}
          activeClients={stats?.active_projects || 0} // Using active projects as proxy for active work
          completedClients={stats?.completed_projects || 0}
          urgentTasks={stats?.overdue_tasks_count || 0}
          notifications={notifications}
          onClientPress={() => router.push('/(verticals)/freelancer/clients')}
        />

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll} contentContainerStyle={styles.actionsContainer}>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/freelancer/clients')}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.actionIcon}>
              <Ionicons name="people" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>Clients</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/freelancer/projects')}>
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionIcon}>
              <Ionicons name="briefcase" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>Projects</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/freelancer/tasks')}>
            <LinearGradient colors={['#EC4899', '#DB2777']} style={styles.actionIcon}>
              <Ionicons name="checkbox" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/freelancer/invoices')}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.actionIcon}>
              <Ionicons name="receipt" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>Invoices</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(verticals)/freelancer/leads')}>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionIcon}>
              <Ionicons name="person-add" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>Leads</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Calendar Widget */}
        <FreelancerCalendarWidget />

        {/* Smart Reminders Widget */}
        <SmartRemindersWidget />

        {/* Active Projects Widget */}
        <View style={styles.activeProjectsContainer}>
          <View style={styles.widgetWithShadow}>
            <View style={styles.widgetInner}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.widgetHeader}
              >
                <View style={styles.widgetHeaderContent}>
                  <View style={styles.widgetIconContainer}>
                    <Ionicons name="briefcase" size={20} color="#7C3AED" />
                  </View>
                  <View>
                    <Text style={styles.widgetTitle}>Active Projects</Text>
                    <Text style={styles.widgetSubtitle}>{projects.length} in progress</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => router.push('/(verticals)/freelancer/projects')}>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              </LinearGradient>

              <View style={styles.widgetContent}>
                {projects.map((project, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.widgetItem,
                      index === projects.length - 1 && styles.widgetItemLast
                    ]}
                    onPress={() => router.push(`/(verticals)/freelancer/projects/${project.id}` as any)}
                  >
                    <View style={[styles.widgetItemIcon, { backgroundColor: '#F3E8FF' }]}>
                      <Ionicons name="code-slash" size={16} color="#8B5CF6" />
                    </View>
                    <View style={styles.widgetItemContent}>
                      <Text style={styles.widgetItemTitle}>{project.title}</Text>
                      <Text style={styles.widgetItemSubtitle}>{project.client?.full_name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: '#F3E8FF' }]}>
                      <Text style={[styles.statusText, { color: '#8B5CF6' }]}>
                        {project.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

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
    borderWidth: 2.5,
    borderColor: '#8B5CF6',
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
