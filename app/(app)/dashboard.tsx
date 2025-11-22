import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { supabase } from '../../src/lib/supabase'
import { listClients } from '../../src/api/clients'
import { listTasks } from '../../src/api/tasks'

export default function Dashboard() {
  const [counts, setCounts] = useState({ clients: 0, overdue: 0, followups: 0 })
  const [upcoming, setUpcoming] = useState<{ title: string; due: string }[]>([])
  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser()
      const userId = data.user?.id
      if (!userId) return
      const clients = await listClients(userId)
      const allTasks: any[] = []
      for (const c of clients) {
        const ts = await listTasks(c.id)
        allTasks.push(...ts)
      }
      const now = Date.now()
      const overdue = allTasks.filter(t => t.due_date && new Date(t.due_date).getTime() < now && t.status !== 'done').length
      const upcomingList = allTasks.filter(t => t.due_date && new Date(t.due_date).getTime() >= now).sort((a,b)=> new Date(a.due_date||0).getTime() - new Date(b.due_date||0).getTime()).slice(0,5).map(t => ({ title: t.title, due: t.due_date! }))
      setUpcoming(upcomingList)
      const followups = clients.filter(c => c.last_activity_at && Date.now() - new Date(c.last_activity_at).getTime() > 7*24*60*60*1000).length
      setCounts({ clients: clients.length, overdue, followups })
    }
    run()
  }, [])
  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#f7f7f9' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16 }}>Dashboard</Text>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginRight: 8 }}>
          <Text style={{ color: '#888', marginBottom: 4 }}>Clients</Text>
          <Text style={{ fontSize: 22, fontWeight: '700' }}>{counts.clients}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginLeft: 8 }}>
          <Text style={{ color: '#888', marginBottom: 4 }}>Overdue</Text>
          <Text style={{ fontSize: 22, fontWeight: '700' }}>{counts.overdue}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginRight: 8 }}>
          <Text style={{ color: '#888', marginBottom: 4 }}>Follow-ups</Text>
          <Text style={{ fontSize: 22, fontWeight: '700' }}>{counts.followups}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginLeft: 8 }}>
          <Text style={{ color: '#888', marginBottom: 4 }}>Upcoming</Text>
          <Text style={{ fontSize: 22, fontWeight: '700' }}>{upcoming.length}</Text>
        </View>
      </View>
      <Text style={{ marginTop: 20, fontWeight: '700', fontSize: 16 }}>Upcoming deadlines</Text>
      <View style={{ marginTop: 8 }}>
        {upcoming.map(u => (
          <View key={u.title+u.due} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 }}>
            <Text style={{ fontWeight: '600' }}>{u.title}</Text>
            <Text style={{ color: '#666' }}>{new Date(u.due).toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}