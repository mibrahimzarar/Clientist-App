import React from 'react'
import { Stack } from 'expo-router'
import AppProviders from '../../src/providers/AppProviders'

export default function AppLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
            title: 'Profile',
          }}
        />
        <Stack.Screen
          name="clients"
          options={{
            headerShown: false
          }}
        />
      </Stack>
    </AppProviders>
  )
}