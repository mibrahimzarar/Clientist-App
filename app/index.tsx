import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../src/lib/supabase'
import { router, Link } from 'expo-router'
import { getSelectedVertical } from '../src/lib/verticalStorage'
import { findVerticalById } from '../src/verticals'
import FreelancerDashboard from '../src/components/dashboards/FreelancerDashboard'
import ServiceProviderDashboard from '../src/components/dashboards/ServiceProviderDashboard'
import TravelAgentDashboard from '../src/components/dashboards/TravelAgentDashboard'

export default function Index() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [vertical, setVertical] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      if (data.session?.user) {
        const v = await getSelectedVertical(data.session.user.id)
        setVertical(v)
      }
      setLoading(false)
    }
    init()

    const { data: auth } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        const v = await getSelectedVertical(session.user.id)
        setVertical(v)
      } else {
        setVertical(null)
      }
    })
    return () => auth.subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#222" />
      </View>
    )
  }

  if (session && vertical) {
    switch (vertical) {
      case 'freelancer':
        return <View style={{ flex: 1, backgroundColor: '#fff' }}><FreelancerDashboard /></View>
      case 'service_provider':
        return <View style={{ flex: 1, backgroundColor: '#fff' }}><ServiceProviderDashboard /></View>
      case 'travel_agent':
        return <View style={{ flex: 1, backgroundColor: '#fff' }}><TravelAgentDashboard /></View>
      default:
        return <View style={{ flex: 1, backgroundColor: '#fff' }}><Text>Unknown Vertical</Text></View>
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.title}>Clientist</Text>
          <Text style={styles.subtitle}>Universal client management</Text>
        </View>

        <View style={styles.actions}>
          <Link href="/sign-up" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </Pressable>
          </Link>

          <Link href="/sign-in" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  secondaryButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
  },
})