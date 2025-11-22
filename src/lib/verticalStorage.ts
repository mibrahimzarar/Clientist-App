import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabase'

const keyFor = (userId: string) => `clientist_vertical_${userId}`

export async function getSelectedVertical(userId: string) {
  const v = await AsyncStorage.getItem(keyFor(userId))
  return v || null
}

export async function setSelectedVertical(userId: string, verticalId: string) {
  await AsyncStorage.setItem(keyFor(userId), verticalId)
  try {
    await supabase.from('profiles').upsert({ id: userId, vertical: verticalId })
  } catch {}
}