import { supabase } from '../lib/supabase'
import { Reminder } from '../types'
import { load, save } from '../lib/storage'
import { nanoid } from 'nanoid/non-secure'
import * as Notifications from 'expo-notifications'

const KEY = 'clientist_reminders'

export async function listReminders(clientId: string): Promise<Reminder[]> {
  try {
    const { data, error } = await supabase.from('reminders').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Reminder[]
  } catch {
    const all = await load<Reminder[]>(KEY, [])
    return all.filter(r => r.client_id === clientId)
  }
}

export async function createReminder(clientId: string, title: string, atISO: string): Promise<Reminder> {
  const reminder: Reminder = { id: nanoid(), client_id: clientId, title, at: atISO, created_at: new Date().toISOString() }
  try {
    const { error } = await supabase.from('reminders').insert(reminder)
    if (error) throw error
  } catch {
    const all = await load<Reminder[]>(KEY, [])
    const next = [reminder, ...all]
    await save(KEY, next)
  }
  try {
    const date = new Date(atISO)
    await Notifications.scheduleNotificationAsync({ content: { title }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date } })
  } catch {}
  return reminder
}