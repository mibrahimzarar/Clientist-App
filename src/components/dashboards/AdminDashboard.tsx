import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { useAdminDashboardSummary } from '../../hooks/useAdmin'
import AdminStatsWidget from '../widgets/admin/AdminStatsWidget'
import AdminUsersWidget from '../widgets/admin/AdminUsersWidget'

export default function AdminDashboard() {
  const insets = useSafeAreaInsets()
  const { data: summaryData } = useAdminDashboardSummary()
  const [adminProfile, setAdminProfile] = useState<string | null>(null)

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/(auth)/sign-in')
  }

  // Fetch admin profile
  React.useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('company_logo, avatar_url')
          .eq('id', user.id)
          .single()

        if (data) {
          setAdminProfile(data.company_logo || data.avatar_url)
        }
      }
    } catch (error) {
      console.log('Error fetching profile:', error)
    }
  }

  const stats = summaryData?.data || {
    total_users: 0,
    active_users: 0,
    total_revenue: 0,
    new_users_today: 0
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>Admin</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push('/(app)/profile')} style={styles.profileButton}>
              <Image
                source={{ uri: adminProfile || 'https://ui-avatars.com/api/?name=Admin&background=4F46E5&color=fff' }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Widget */}
        <AdminStatsWidget
          totalUsers={stats.total_users}
          activeUsers={stats.active_users}
          totalRevenue={stats.total_revenue}
          newUsers={stats.new_users_today}
        />

        {/* Users Widget */}
        <AdminUsersWidget />

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 4,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 22,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
  },
  signOutButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  }
})
