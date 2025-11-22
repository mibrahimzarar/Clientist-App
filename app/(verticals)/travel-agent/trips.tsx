import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, FlatList } from 'react-native'
import { supabase } from '../../../src/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listTrips, createTrip, Trip } from '../../../src/api/trips'

export default function Trips() {
  const [userId, setUserId] = useState<string | null>(null)
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const qc = useQueryClient()
  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id || null)
    }
    run()
  }, [])
  const q = useQuery({ queryKey: ['trips', userId], queryFn: () => listTrips(userId || ''), enabled: !!userId })
  const m = useMutation({ mutationFn: () => createTrip(userId || '', { destination, start_date: startDate, end_date: endDate }),
    onSuccess: () => { setDestination(''); setStartDate(''); setEndDate(''); qc.invalidateQueries({ queryKey: ['trips', userId] }) } })
  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 8 }}>Trips</Text>
      <View style={{ marginBottom: 12 }}>
        <TextInput placeholder="Destination" value={destination} onChangeText={setDestination} style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 8 }} />
        <TextInput placeholder="Start date (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 8 }} />
        <TextInput placeholder="End date (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8 }} />
        <Pressable onPress={() => m.mutate()} style={{ marginTop: 8, backgroundColor: '#222', paddingVertical: 12, borderRadius: 8 }}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Add Trip</Text>
        </Pressable>
      </View>
      <FlatList data={q.data || []} keyExtractor={item => item.id} renderItem={({ item }) => (
        <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontSize: 16 }}>{item.destination}</Text>
          <Text style={{ color: '#666' }}>{item.start_date} → {item.end_date}</Text>
        </View>
      )} />
    </View>
  )
}