import AsyncStorage from '@react-native-async-storage/async-storage'

export async function load<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export async function save<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value))
}