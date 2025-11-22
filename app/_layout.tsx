import { Slot } from 'expo-router'
import React from 'react'
import { StatusBar } from 'react-native'
import AppProviders from '../src/providers/AppProviders'

export default function Layout() {
  return (
    <AppProviders>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Slot />
    </AppProviders>
  )
}