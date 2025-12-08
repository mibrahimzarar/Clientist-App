import React, { createContext, useContext, useEffect, useState } from 'react'
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [vertical, setVertical] = useState<string | null>(null)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchVertical = async (userId: string) => {
      const v = await getSelectedVertical(userId)
      setVertical(v)
  }

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchProfile(session.user.id)
        fetchVertical(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        // Only fetch if session changed to a new user or signed in
        if (session.user.id !== profile?.id) {
            fetchProfile(session.user.id)
            fetchVertical(session.user.id)
        }
      } else {
        setProfile(null)
        setVertical(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = !!profile?.is_admin || session?.user?.email?.includes('admin') || false
  const currency = profile?.currency || 'USD'

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id)
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
