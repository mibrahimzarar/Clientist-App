import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { getUpcomingTravels, getPendingTasks } from '../src/api/travelAgent'
import { supabase } from '../src/lib/supabase'

export default function DebugPage() {
    const [travels, setTravels] = useState<any>(null)
    const [tasks, setTasks] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        checkData()
    }, [])

    const checkData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            const travelsRes = await getUpcomingTravels(100)
            setTravels(travelsRes)

            const tasksRes = await getPendingTasks(100)
            setTasks(tasksRes)
        } catch (e: any) {
            setError(e.message)
        }
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Debug Page</Text>

            <Text style={styles.section}>User:</Text>
            <Text style={styles.code}>{JSON.stringify(user, null, 2)}</Text>

            <Text style={styles.section}>Error:</Text>
            <Text style={styles.code}>{error || 'None'}</Text>

            <Text style={styles.section}>Upcoming Travels Response:</Text>
            <Text style={styles.code}>{JSON.stringify(travels, null, 2)}</Text>

            <Text style={styles.section}>Pending Tasks Response:</Text>
            <Text style={styles.code}>{JSON.stringify(tasks, null, 2)}</Text>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    section: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
    code: { fontFamily: 'monospace', fontSize: 12, backgroundColor: '#f0f0f0', padding: 10 }
})
