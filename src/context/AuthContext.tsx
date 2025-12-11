import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { getSelectedVertical } from '../lib/verticalStorage'

type Profile = {
  id: string
  email?: string
  full_name?: string
  company_name?: string
  company_logo?: string
  role?: string
  status?: string
  currency?: string
  is_admin?: boolean
  type_of_work?: string
  expo_push_token?: string
  created_at?: string
  updated_at?: string
}

type AuthContextType = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  currency: string
  vertical: string | null
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  currency: 'USD',
  vertical: null,
  refreshProfile: async () => {},
})

// Helper to timeout a promise
const withTimeout = <T,>(promise: Promise<T>, ms: number, fallbackValue?: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), ms)
    )
  ]).catch(err => {
    console.error('Promise timeout or error:', err)
    if (fallbackValue !== undefined) return fallbackValue
    throw err
  })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [vertical, setVertical] = useState<string | null>(null)
  const mounted = useRef(true)

  // Use a ref to track the current user ID to avoid closure staleness in onAuthStateChange
  const currentUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (mounted.current && data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchVertical = async (userId: string) => {
    try {
      // Add timeout to storage read
      const v = await withTimeout(getSelectedVertical(userId), 2000, null)
      if (mounted.current) {
        setVertical(v)
      }
    } catch (error) {
      console.error('Error fetching vertical:', error)
    }
  }

  const loadUserData = async (userId: string) => {
    try {
      // Use Promise.allSettled to ensure one failure doesn't block the other
      // and wrap with overall timeout
      await withTimeout(
        Promise.allSettled([
          fetchProfile(userId),
          fetchVertical(userId)
        ]),
        5000 // 5 seconds max for user data
      )
    } catch (e) {
      console.error('Error loading user data:', e)
    }
  }

  useEffect(() => {
    let mounted = true

    // Initial session check
    const initializeAuth = async () => {
      try {
        // Timeout the session check itself (AsyncStorage can hang)
        const { data } = await withTimeout(
          supabase.auth.getSession(),
          3000, // 3 seconds timeout for getSession
{ data: { session: null }, error: null }
        )
        
        const session = data.session

        if (mounted) {
          setSession(session)
          currentUserIdRef.current = session?.user?.id || null
        }

        if (session?.user) {
          await loadUserData(session.user.id)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      const prevUserId = currentUserIdRef.current
      const newUserId = session?.user?.id || null
      
      setSession(session)
      currentUserIdRef.current = newUserId

      if (session?.user) {
        // Only fetch if session changed to a new user
        // OR if we are just signing in/up
        // We use the ref to check against previous state
        if (newUserId !== prevUserId) {
            await loadUserData(session.user.id)
        }
      } else {
        setProfile(null)
        setVertical(null)
      }
      
      // Always ensure loading is false after an auth event
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const isAdmin = !!profile?.is_admin || session?.user?.email?.includes('admin') || false
  const currency = profile?.currency || 'USD'

  const refreshProfile = async () => {
    if (session?.user) {
      await loadUserData(session.user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user ?? null, 
      profile, 
      loading, 
      isAdmin, 
      currency,
      vertical,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
