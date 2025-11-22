import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../src/lib/supabase'
import { useTheme } from '../../src/context/ThemeContext'

export default function Settings() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id || null)
      setUserEmail(data.user?.email || null)
    }
    run()
  }, [])

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut()
            router.replace('/')
          },
        },
      ]
    )
  }

  const handleExportData = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated')
      return
    }

    try {
      // For now, we'll create a simple CSV with basic data
      // In a real app, you'd fetch this from your API
      const csvContent = `Client Name,Email,Phone,Status,Package Type,Created Date
John Doe,john@example.com,+1234567890,new,umrah_package,2024-01-15
Jane Smith,jane@example.com,+0987654321,in_process,tourist_visa,2024-01-16`

      const base: string = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || ''
      const path = base + 'travel_clients_export.csv'
      await FileSystem.writeAsStringAsync(path, csvContent)
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path)
      } else {
        Alert.alert('Success', 'Data exported successfully')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data')
    }
  }

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          title: 'Profile',
          description: userEmail || 'Manage your account',
          icon: 'person' as const,
          onPress: () => {},
        },
        {
          title: 'Sign Out',
          description: 'Sign out of your account',
          icon: 'log-out' as const,
          onPress: handleSignOut,
          destructive: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          title: 'Theme',
          description: `Current: ${theme}`,
          icon: 'moon' as const,
          onPress: toggle,
        },
        {
          title: 'Notifications',
          description: 'Manage push notifications',
          icon: 'notifications' as const,
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          title: 'Export Data',
          description: 'Export client data as CSV',
          icon: 'download' as const,
          onPress: handleExportData,
        },
        {
          title: 'Change Vertical',
          description: 'Switch to a different business vertical',
          icon: 'swap-horizontal' as const,
          onPress: () => router.push('/select-vertical'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help Center',
          description: 'Get help and support',
          icon: 'help-circle' as const,
          onPress: () => {},
        },
        {
          title: 'About',
          description: 'App version and information',
          icon: 'information-circle' as const,
          onPress: () => {},
        },
      ],
    },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your preferences</Text>
      </View>

      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.item,
                  itemIndex === 0 && styles.itemFirst,
                  itemIndex === section.items.length - 1 && styles.itemLast,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.itemLeft}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={'destructive' in item && item.destructive ? '#EF4444' : '#6B7280'}
                    style={styles.itemIcon}
                  />
                  <View style={styles.itemText}>
                    <Text style={[styles.itemTitle, 'destructive' in item && item.destructive && styles.itemTitleDestructive]}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginHorizontal: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  itemTitleDestructive: {
    color: '#EF4444',
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
})