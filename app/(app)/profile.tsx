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
  Switch,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native'
import { BouncingBallsLoader } from '../../src/components/ui/BouncingBallsLoader'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../src/lib/supabase'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NotificationService, NotificationPreferences } from '../../src/services/NotificationService'
import { getSelectedVertical } from '../../src/lib/verticalStorage'

export default function Profile() {
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [companyName, setCompanyName] = useState<string>('')
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({ trips: true, tasks: true, leads: true })
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [currentVertical, setCurrentVertical] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
    loadVertical()
  }, [])

  const loadVertical = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const vertical = await getSelectedVertical(user.id)
        setCurrentVertical(vertical)
      }
    } catch (error) {
      console.log('Error loading vertical:', error)
    }
  }

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

      // Load notification preferences
      const prefs = await NotificationService.getPreferences()
      setNotificationPrefs(prefs)

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
      onPress: () => setShowNotificationsModal(true),
    },
    {
      icon: 'swap-horizontal-outline',
      title: 'Change Vertical',
      description: 'Switch to a different business vertical',
      onPress: () => router.push('/select-vertical'),
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
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Profile Card */}
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.logoContainer}>
              {companyLogo ? (
                <Image source={{ uri: companyLogo }} style={styles.logo} />
              ) : (
                <LinearGradient
                  colors={['#F3F4F6', '#E5E7EB']}
                  style={styles.logoPlaceholder}
                >
                  <Ionicons name="business" size={40} color="#9CA3AF" />
                </LinearGradient>
              )}
              {saving && (
                <View style={styles.uploadingOverlay}>
                  <BouncingBallsLoader color="#fff" size={8} />
                </View>
              )}
              <View style={styles.editIcon}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.companyNameInput}
              value={companyName}
              onChangeText={setCompanyName}
              onBlur={() => saveProfile()}
              placeholder="Enter Company Name"
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.emailBadge}>
              <Ionicons name="mail" size={14} color="#6B7280" />
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

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowNotificationsModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Notification Settings</Text>
                  <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalSubtitle}>
                  {currentVertical === 'freelancer' 
                    ? 'Receive reminders for upcoming projects and deadlines. Notifications are sent based on your project timeline.'
                    : 'Receive reminders for upcoming events. Notifications are sent 1 day before and on the day of the event.'}
                </Text>

                <View style={styles.togglesContainer}>
                  {currentVertical === 'freelancer' ? (
                    // Freelancer specific notifications
                    <>
                      <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                          <View style={[styles.toggleIcon, { backgroundColor: '#ECFDF5' }]}>
                            <Ionicons name="receipt" size={20} color="#10B981" />
                          </View>
                          <View>
                            <Text style={styles.toggleLabel}>Invoices Due Date</Text>
                            <Text style={styles.toggleDescription}>Payment deadlines</Text>
                          </View>
                        </View>
                        <Switch
                          value={notificationPrefs.trips}
                          onValueChange={(val) => {
                            const newPrefs = { ...notificationPrefs, trips: val }
                            setNotificationPrefs(newPrefs)
                            NotificationService.savePreferences(newPrefs)
                          }}
                          trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                        />
                      </View>

                      <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                          <View style={[styles.toggleIcon, { backgroundColor: '#FDF2F8' }]}>
                            <Ionicons name="checkbox" size={20} color="#BE185D" />
                          </View>
                          <View>
                            <Text style={styles.toggleLabel}>Task Deadlines</Text>
                            <Text style={styles.toggleDescription}>Task deadlines</Text>
                          </View>
                        </View>
                        <Switch
                          value={notificationPrefs.tasks}
                          onValueChange={(val) => {
                            const newPrefs = { ...notificationPrefs, tasks: val }
                            setNotificationPrefs(newPrefs)
                            NotificationService.savePreferences(newPrefs)
                          }}
                          trackColor={{ false: '#E5E7EB', true: '#BE185D' }}
                        />
                      </View>

                      <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                          <View style={[styles.toggleIcon, { backgroundColor: '#FEF3C7' }]}>
                            <Ionicons name="person-add" size={20} color="#D97706" />
                          </View>
                          <View>
                            <Text style={styles.toggleLabel}>Lead Follow-ups</Text>
                            <Text style={styles.toggleDescription}>Follow up with leads</Text>
                          </View>
                        </View>
                        <Switch
                          value={notificationPrefs.leads}
                          onValueChange={(val) => {
                            const newPrefs = { ...notificationPrefs, leads: val }
                            setNotificationPrefs(newPrefs)
                            NotificationService.savePreferences(newPrefs)
                          }}
                          trackColor={{ false: '#E5E7EB', true: '#D97706' }}
                        />
                      </View>
                    </>
                  ) : (
                    // Travel Agent specific notifications
                    <>
                      <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                          <View style={[styles.toggleIcon, { backgroundColor: '#ECFDF5' }]}>
                            <Ionicons name="airplane" size={20} color="#10B981" />
                          </View>
                          <View>
                            <Text style={styles.toggleLabel}>Upcoming Trips</Text>
                            <Text style={styles.toggleDescription}>Reminders for client travel</Text>
                          </View>
                        </View>
                        <Switch
                          value={notificationPrefs.trips}
                          onValueChange={(val) => {
                            const newPrefs = { ...notificationPrefs, trips: val }
                            setNotificationPrefs(newPrefs)
                            NotificationService.savePreferences(newPrefs)
                          }}
                          trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                        />
                      </View>

                      <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                          <View style={[styles.toggleIcon, { backgroundColor: '#FDF2F8' }]}>
                            <Ionicons name="checkbox" size={20} color="#BE185D" />
                          </View>
                          <View>
                            <Text style={styles.toggleLabel}>Pending Tasks</Text>
                            <Text style={styles.toggleDescription}>Reminders for due tasks</Text>
                          </View>
                        </View>
                        <Switch
                          value={notificationPrefs.tasks}
                          onValueChange={(val) => {
                            const newPrefs = { ...notificationPrefs, tasks: val }
                            setNotificationPrefs(newPrefs)
                            NotificationService.savePreferences(newPrefs)
                          }}
                          trackColor={{ false: '#E5E7EB', true: '#BE185D' }}
                        />
                      </View>

                      <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                          <View style={[styles.toggleIcon, { backgroundColor: '#FEF3C7' }]}>
                            <Ionicons name="person-add" size={20} color="#D97706" />
                          </View>
                          <View>
                            <Text style={styles.toggleLabel}>Lead Follow-ups</Text>
                            <Text style={styles.toggleDescription}>Reminders to contact leads</Text>
                          </View>
                        </View>
                        <Switch
                          value={notificationPrefs.leads}
                          onValueChange={(val) => {
                            const newPrefs = { ...notificationPrefs, leads: val }
                            setNotificationPrefs(newPrefs)
                            NotificationService.savePreferences(newPrefs)
                          }}
                          trackColor={{ false: '#E5E7EB', true: '#D97706' }}
                        />
                      </View>
                    </>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    paddingTop: 60,
    paddingBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    padding: 2,
    backgroundColor: '#fff',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 58,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  profileInfo: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  companyNameInput: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 200,
    borderBottomWidth: 2,
    borderBottomColor: '#F3F4F6',
    flexWrap: 'wrap',
    maxWidth: '90%',
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emailText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemFirst: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  menuItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    marginBottom: 4,
  },
  menuTitleDestructive: {
    color: '#EF4444',
  },
  menuDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  togglesContainer: {
    gap: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  toggleDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
})