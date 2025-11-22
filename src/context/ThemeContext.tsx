import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Theme = 'light' | 'dark'
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  useEffect(() => {
    const run = async () => {
      const saved = await AsyncStorage.getItem('clientist_theme')
      if (saved === 'dark' || saved === 'light') setTheme(saved)
    }
    run()
  }, [])
  const toggle = async () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    await AsyncStorage.setItem('clientist_theme', next)
  }
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}