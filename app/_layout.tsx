import { Slot } from 'expo-router'
import React from 'react'
import AppProviders from '../src/providers/AppProviders'

export default function Layout() {
  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  )
}