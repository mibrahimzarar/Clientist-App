import React, { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import * as Notifications from 'expo-notifications'
import { supabase } from '../lib/supabase'
import { initRealtime } from '../lib/realtime'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ThemeProvider } from '../context/ThemeContext'

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false, shouldShowList: false, shouldShowBanner: true })
})

export default function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const run = async () => {
      await Notifications.requestPermissionsAsync()
      const { data } = await supabase.auth.getUser()
      const userId = data.user?.id
      if (userId) {
        initRealtime(queryClient, userId)
        try {
          const token = await Notifications.getExpoPushTokenAsync()
          await supabase.from('profiles').upsert({ id: userId, expo_push_token: (token as any)?.data })
        } catch {}
        const lastRun = await AsyncStorage.getItem('clientist_last_stale_check')
        const now = Date.now()
        if (!lastRun || now - Number(lastRun) > 24 * 60 * 60 * 1000) {
          try {
            const { data: clients } = await supabase.from('clients').select('*').eq('user_id', userId)
            const stale = (clients || []).filter((c: any) => {
              const la = c.last_activity_at ? new Date(c.last_activity_at).getTime() : 0
              return Date.now() - la > 7 * 24 * 60 * 60 * 1000
            })
            for (const c of stale) {
              await Notifications.scheduleNotificationAsync({ content: { title: `Follow up: ${c.name}` }, trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 } })
            }
            await AsyncStorage.setItem('clientist_last_stale_check', String(Date.now()))
          } catch {}
        }
      }
    }
    run()
  }, [])
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  )
}