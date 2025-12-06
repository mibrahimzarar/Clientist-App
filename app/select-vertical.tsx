import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { BouncingBallsLoader } from '../src/components/ui/BouncingBallsLoader'
import { VERTICALS } from '../src/verticals'
import { supabase } from '../src/lib/supabase'
import { setSelectedVertical } from '../src/lib/verticalStorage'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'

const verticalIcons: Record<string, any> = {
  travel_agent: 'airplane',
  freelancer: 'briefcase',
  service_provider: 'construct',
  admin: 'shield-checkmark',
}

const verticalColors: Record<string, [string, string]> = {
  travel_agent: ['#4F46E5', '#7C3AED'],
  freelancer: ['#10B981', '#059669'],
  service_provider: ['#F59E0B', '#D97706'],
  admin: ['#EF4444', '#DC2626'],
}

export default function SelectVertical() {
  const insets = useSafeAreaInsets()
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
        
        // Check if user is admin via DB or email pattern
        let adminAccess = false
        
        // Check email pattern (e.g. admin@... or ...@admin.com)
        if (data.user.email?.startsWith('admin@') || data.user.email?.endsWith('@admin.com')) {
            adminAccess = true
        }

        // Check DB profile
        if (!adminAccess) {
            const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.user.id)
            .single()
            
            if (profile?.is_admin) {
            adminAccess = true
            }
        }

        setIsAdmin(adminAccess)
      }
      setLoading(false)
    }
    load()
  }, [])

  const onSelect = async (id: string) => {
    if (!userId || selecting) return

    try {
      setSelecting(true)
      await setSelectedVertical(userId, id)
      // Navigate to root - the main index will show the appropriate dashboard
      router.replace('/')
    } catch (error) {
      console.error('Error selecting vertical:', error)
      setSelecting(false)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <BouncingBallsLoader size={12} color="#222" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Vertical</Text>
          <Text style={styles.subtitle}>Select the business vertical that best describes your work</Text>
        </View>

        {/* Vertical Cards */}
        <View style={styles.cardsContainer}>
          {VERTICALS.filter(v => v.id !== 'admin' || isAdmin).map((vertical, index) => (
            <TouchableOpacity
              key={vertical.id}
              onPress={() => onSelect(vertical.id)}
              disabled={selecting}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={verticalColors[vertical.id] || ['#6B7280', '#4B5563']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.verticalCard,
                  selecting && styles.verticalCardDisabled
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={verticalIcons[vertical.id] || 'business'}
                    size={40}
                    color="#fff"
                  />
                </View>
                <Text style={styles.verticalName}>{vertical.name}</Text>
                <View style={styles.arrowContainer}>
                  <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.8)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {selecting && (
          <View style={styles.loadingOverlay}>
            <BouncingBallsLoader size={12} color="#4F46E5" />
            <Text style={styles.loadingText}>Loading your dashboard...</Text>
          </View>
        )}

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  verticalCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  verticalCardDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  verticalName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(249,250,251,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
})