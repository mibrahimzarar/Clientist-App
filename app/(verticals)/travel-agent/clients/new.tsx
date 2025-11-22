import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCreateClient } from '../../../../src/hooks/useTravelAgent'
import { PackageType, LeadSource, ClientStatus, PriorityTag } from '../../../../src/types/travelAgent'

const packageOptions = [
  { value: 'umrah_package', label: 'Umrah Package', icon: 'airplane' },
  { value: 'tourist_visa', label: 'Tourist Visa', icon: 'document-text' },
  { value: 'ticketing', label: 'Ticketing', icon: 'ticket' },
  { value: 'visit_visa', label: 'Visit Visa', icon: 'briefcase' },
]

const leadSourceOptions = [
  { value: 'facebook', label: 'Facebook', icon: 'logo-facebook' },
  { value: 'referral', label: 'Referral', icon: 'people' },
  { value: 'walk_in', label: 'Walk-in', icon: 'walk' },
  { value: 'website', label: 'Website', icon: 'globe' },
]

const priorityOptions = [
  { value: 'normal', label: 'Normal', icon: 'flag-outline', color: '#10B981' },
  { value: 'priority', label: 'Priority', icon: 'flag', color: '#F59E0B' },
  { value: 'urgent', label: 'Urgent', icon: 'warning', color: '#EF4444' },
  { value: 'vip', label: 'VIP', icon: 'star', color: '#8B5CF6' },
]

export default function NewClient() {
  const insets = useSafeAreaInsets()
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    country: '',
    package_type: 'umrah_package' as PackageType,
    lead_source: 'walk_in' as LeadSource,
    status: 'new' as ClientStatus,
    priority_tag: 'normal' as PriorityTag,
    notes: '',
  })

  const createClient = useCreateClient()

  const handleSubmit = async () => {
    if (!formData.full_name.trim() || !formData.phone_number.trim() || !formData.country.trim()) {
      Alert.alert('Required Fields', 'Please fill in all required fields (Name, Phone, Country)')
      return
    }

    try {
      await createClient.mutateAsync(formData)
      Alert.alert('Success', 'Client created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ])
    } catch (error) {
      Alert.alert('Error', 'Failed to create client. Please try again.')
    }
  }

  const completionPercentage = () => {
    const fields = [
      formData.full_name,
      formData.phone_number,
      formData.country,
      formData.email,
      formData.notes,
    ]
    const filled = fields.filter(f => f && f.trim()).length
    return Math.round((filled / fields.length) * 100)
  }

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>New Client</Text>
          <Text style={styles.headerSubtitle}>Add a new client to your portfolio</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${completionPercentage()}%` }]} />
        </View>
        <Text style={styles.progressText}>{completionPercentage()}% Complete</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>

        {/* Basic Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle" size={24} color="#4F46E5" />
            <Text style={styles.cardTitle}>Basic Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                placeholder="Enter client's full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.phone_number}
                onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                placeholder="+1 234 567 8900"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="client@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Country <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.country}
                onChangeText={(text) => setFormData({ ...formData, country: text })}
                placeholder="Enter country"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Package Type Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube" size={24} color="#4F46E5" />
            <Text style={styles.cardTitle}>Package Type</Text>
          </View>

          <View style={styles.optionsGrid}>
            {packageOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  formData.package_type === option.value && styles.optionCardActive
                ]}
                onPress={() => setFormData({ ...formData, package_type: option.value as PackageType })}
              >
                {formData.package_type === option.value && (
                  <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.optionGradient}
                  />
                )}
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={formData.package_type === option.value ? '#fff' : '#6B7280'}
                  style={styles.optionIcon}
                />
                <Text style={[
                  styles.optionText,
                  formData.package_type === option.value && styles.optionTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Lead Source Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={24} color="#4F46E5" />
            <Text style={styles.cardTitle}>Lead Source</Text>
          </View>

          <View style={styles.optionsGrid}>
            {leadSourceOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  formData.lead_source === option.value && styles.optionCardActive
                ]}
                onPress={() => setFormData({ ...formData, lead_source: option.value as LeadSource })}
              >
                {formData.lead_source === option.value && (
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.optionGradient}
                  />
                )}
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={formData.lead_source === option.value ? '#fff' : '#6B7280'}
                  style={styles.optionIcon}
                />
                <Text style={[
                  styles.optionText,
                  formData.lead_source === option.value && styles.optionTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flag" size={24} color="#4F46E5" />
            <Text style={styles.cardTitle}>Priority Level</Text>
          </View>

          <View style={styles.priorityOptions}>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.priorityChip,
                  formData.priority_tag === option.value && { backgroundColor: option.color }
                ]}
                onPress={() => setFormData({ ...formData, priority_tag: option.value as PriorityTag })}
              >
                <Ionicons
                  name={option.icon as any}
                  size={16}
                  color={formData.priority_tag === option.value ? '#fff' : '#6B7280'}
                />
                <Text style={[
                  styles.priorityText,
                  formData.priority_tag === option.value && styles.priorityTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={24} color="#4F46E5" />
            <Text style={styles.cardTitle}>Additional Notes</Text>
          </View>

          <TextInput
            style={styles.textArea}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Add any additional notes about this client..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={createClient.isPending}
        >
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          >
            {createClient.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.submitText}>Create Client</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingVertical: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  progressContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  },
  optionCardActive: {
    borderColor: 'transparent',
  },
  optionGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  optionIcon: {
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  optionTextActive: {
    color: '#fff',
  },
  priorityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  priorityTextActive: {
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
})