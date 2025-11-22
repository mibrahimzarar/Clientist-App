import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../src/lib/supabase'
import { router } from 'expo-router'
import { getSelectedVertical } from '../src/lib/verticalStorage'
import { findVerticalById } from '../src/verticals'

type Mode = 'signin' | 'signup'

export default function Index() {
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (session?.user) {
        const v = await getSelectedVertical(session.user.id)
        if (v) {
          const found = findVerticalById(v)
          if (found) router.replace(found.route)
        } else {
          router.replace('/select-vertical')
        }
      }
    }
    init()
    const { data: auth } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const v = await getSelectedVertical(session.user.id)
        if (v) {
          const found = findVerticalById(v)
          if (found) router.replace(found.route)
        } else {
          router.replace('/select-vertical')
        }
      }
    })
    return () => auth.subscription.unsubscribe()
  }, [])

  const onSubmit = async () => {
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch {}
    setLoading(false)
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f7f7f9' }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 24 }}>C</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: '700', marginTop: 12 }}>Clientist</Text>
          <Text style={{ fontSize: 14, color: '#555' }}>Universal client management</Text>
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: '#eee', borderRadius: 10, padding: 4, marginBottom: 16 }}>
          <Pressable onPress={() => setMode('signup')} style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: mode==='signup' ? '#fff' : 'transparent' }}>
            <Text style={{ textAlign: 'center', fontWeight: '600' }}>Sign Up</Text>
          </Pressable>
          <Pressable onPress={() => setMode('signin')} style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: mode==='signin' ? '#fff' : 'transparent' }}>
            <Text style={{ textAlign: 'center', fontWeight: '600' }}>Sign In</Text>
          </Pressable>
        </View>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
          <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 }} />
          <TextInput secureTextEntry placeholder="Password" value={password} onChangeText={setPassword} style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8 }} />
          <Pressable onPress={onSubmit} style={{ marginTop: 16, backgroundColor: '#222', padding: 14, borderRadius: 8 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>{mode === 'signup' ? 'Create Account' : 'Sign In'}</Text>}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}