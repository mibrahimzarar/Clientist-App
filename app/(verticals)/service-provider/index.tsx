import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { router, Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../../src/lib/supabase'

export default function ServiceProviderDashboard() {
  const signOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut()
            router.replace('/')
          },
        },
      ]
    )
  }

  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Analytics and overview',
      icon: 'stats-chart' as const,
      href: '/(verticals)/service-provider/dashboard',
      color: '#3B82F6'
    },
    {
      title: 'Services',
      description: 'Manage your services',
      icon: 'construct' as const,
      href: '/(verticals)/service-provider/services',
      color: '#10B981'
    },
    {
      title: 'Bookings',
      description: 'View and manage bookings',
      icon: 'calendar' as const,
      href: '/(verticals)/service-provider/bookings',
      color: '#8B5CF6'
    },
    {
      title: 'Clients',
      description: 'Manage your clients',
      icon: 'people' as const,
      href: '/(verticals)/service-provider/clients',
      color: '#F59E0B'
    },
    {
      title: 'Payments',
      description: 'Track payments and earnings',
      icon: 'card' as const,
      href: '/(verticals)/service-provider/payments',
      color: '#EF4444'
    },
    {
      title: 'Reviews',
      description: 'Customer feedback and ratings',
      icon: 'star' as const,
      href: '/(verticals)/service-provider/reviews',
      color: '#6B7280'
    }
  ]

  const quickActions = [
    {
      title: 'Change Vertical',
      description: 'Switch to Freelancer or Travel Agent',
      icon: 'swap-horizontal' as const,
      onPress: () => router.push('/select-vertical'),
      color: '#3B82F6'
    },
    {
      title: 'Settings',
      description: 'App preferences and configuration',
      icon: 'settings' as const,
      onPress: () => router.push('/(app)/settings'),
      color: '#6B7280'
    }
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Service Provider Portal</Text>
          <Text style={styles.subtitle}>Manage your service business</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Ionicons name="log-out" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href} asChild>
              <TouchableOpacity style={[styles.menuItem, { borderLeftColor: item.color }]}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.actionsTitle]}>Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { borderLeftColor: action.color }]}
              onPress={action.onPress}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name={action.icon} size={20} color={action.color} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  signOutButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionsTitle: {
    marginTop: 24,
  },
  menuGrid: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
})