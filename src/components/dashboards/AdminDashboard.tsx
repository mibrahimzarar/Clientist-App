import React from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function AdminDashboard() {
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable onPress={() => router.push('/(app)/profile')} style={styles.signOutButton}>
                <Ionicons name="person-circle-outline" size={24} color="#4B5563" />
            </Pressable>
            <Pressable onPress={signOut} style={styles.signOutButton}>
                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>System Overview</Text>
          <Text style={styles.cardText}>Welcome to the Admin Panel.</Text>
          <Text style={styles.cardText}>Here you can manage users and system settings.</Text>
        </View>

        {/* Placeholder for user management */}
        <View style={styles.grid}>
          <View style={styles.gridItem}>
             <Ionicons name="people" size={32} color="#4F46E5" />
             <Text style={styles.gridLabel}>Users</Text>
             <Text style={styles.gridValue}>--</Text>
          </View>
          <View style={styles.gridItem}>
             <Ionicons name="stats-chart" size={32} color="#10B981" />
             <Text style={styles.gridLabel}>Activity</Text>
             <Text style={styles.gridValue}>--</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  signOutButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gridLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  gridValue: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
})
