import React, { useEffect, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { VERTICALS } from '../src/verticals'
import { supabase } from '../src/lib/supabase'
import { setSelectedVertical } from '../src/lib/verticalStorage'
import { router } from 'expo-router'

export default function SelectVertical() {
  const [userId, setUserId] = useState<string | null>(null)
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id || null)
    }
    load()
  }, [])

  const onSelect = async (id: string, route: string) => {
    if (!userId) return
    await setSelectedVertical(userId, id)
    router.replace(route)
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 8 }}>Choose your field</Text>
      <Text style={{ fontSize: 14, marginBottom: 24 }}>Select a vertical to continue</Text>
      {VERTICALS.map(v => (
        <Pressable key={v.id} onPress={() => onSelect(v.id, v.route)} style={{ padding: 16, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ fontSize: 16 }}>{v.name}</Text>
        </Pressable>
      ))}
    </View>
  )
}