import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AppProviders from '../../src/providers/AppProviders'

export default function AppLayout() {
  return (
    <AppProviders>
      <Tabs>
        <Tabs.Screen 
          name="dashboard" 
          options={{ 
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }} 
        />
        <Tabs.Screen 
          name="clients" 
          options={{ 
            title: 'Clients',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }} 
        />
        <Tabs.Screen 
          name="settings" 
          options={{ 
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }} 
        />
      </Tabs>
    </AppProviders>
  )
}