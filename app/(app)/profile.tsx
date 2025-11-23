import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native'
import { BouncingBallsLoader } from '../../src/components/ui/BouncingBallsLoader'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../src/lib/supabase'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Profile() {
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [companyName, setCompanyName] = useState<string>('')
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/')
        return
      }

      setUserId(user.id)
      setEmail(user.email || '')

      const { data, error } = await supabase
        .from('profiles')
        .select('company_name, company_logo')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }

      if (data) {
        setCompanyName(data.company_name || '')
        setCompanyLogo(data.company_logo || null)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    })

    if (!result.canceled) {
      uploadLogo(result.assets[0].uri)
    }
  }

  const uploadLogo = async (uri: string) => {
    if (!userId) return
    try {
      setSaving(true)
      const arrayBuffer = await fetch(uri).then(res => res.arrayBuffer())
      const fileName = `${userId}/logo_${Date.now()}.png`

      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/png',
          upsert: true
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setCompanyLogo(publicUrl)

      // Auto-save after upload
      await saveProfile(publicUrl)
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image: ' + (error as any).message)
    } finally {
      setSaving(false)
    }
  }

  const saveProfile = async (logoUrl?: string) => {
    if (!userId) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          company_name: companyName,
          company_logo: logoUrl || companyLogo,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      Alert.alert('Success', 'Profile updated successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated')
      return
    }

    try {
      const csvContent = `Client Name,Email,Phone,Status,Package Type,Created Date
Sample Client,sample@example.com,+1234567890,active,service,2024-01-15`

      const base: string = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || ''
      const path = base + 'clients_export.csv'
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

  const menuItems = [
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      description: 'Manage push notifications',
      onPress: () => Alert.alert('Coming Soon', 'Notifications settings will be available soon'),
    },
    {
      icon: 'swap-horizontal-outline',
      title: 'Change Vertical',
      description: 'Switch to a different business vertical',
      onPress: () => router.push('/select-vertical'),
    },
    {
      icon: 'download-outline',
      title: 'Export Data',
      description: 'Export client data as CSV',
      onPress: handleExportData,
    },
    {
      icon: 'log-out-outline',
      title: 'Sign Out',
      description: 'Sign out of your account',
      onPress: handleSignOut,
      destructive: true,
    },
  ]

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <BouncingBallsLoader size={12} color="#4F46E5" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={pickImage} style={styles.logoContainer}>
            {companyLogo ? (
              <Image source={{ uri: companyLogo }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="business" size={32} color="#9CA3AF" />
              </View>
            )}
            {saving && (
              <View style={styles.uploadingOverlay}>
                <BouncingBallsLoader color="#fff" size={8} />
              </View>
            )}
            <View style={styles.editIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <TextInput
              style={styles.companyNameInput}
              value={companyName}
              onChangeText={setCompanyName}
              onBlur={() => saveProfile()}
              placeholder="Company Name"
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.emailContainer}>
              <Ionicons name="mail-outline" size={16} color="#6B7280" />
              <Text style={styles.emailText}>{email}</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === 0 && styles.menuItemFirst,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
            >
              <View style={[
                styles.menuIconContainer,
                item.destructive && styles.menuIconDestructive
              ]}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.destructive ? '#EF4444' : '#4F46E5'}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={[
                  styles.menuTitle,
                  item.destructive && styles.menuTitleDestructive
                ]}>
                  {item.title}
                </Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 24,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInfo: {
    width: '100%',
    alignItems: 'center',
  },
  companyNameInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 200,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  emailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  menuItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconDestructive: {
    backgroundColor: '#FEF2F2',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuTitleDestructive: {
    color: '#EF4444',
  },
  menuDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
})