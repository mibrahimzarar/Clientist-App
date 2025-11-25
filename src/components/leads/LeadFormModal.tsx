import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Lead, LeadFormData, LeadStatus, LeadSource, PriorityTag, PackageType } from '../../types/travelAgent'
import { useCreateLead, useUpdateLead } from '../../hooks/useLeads'

interface LeadFormModalProps {
  visible: boolean
  onClose: () => void
  lead?: Lead
  onSuccess?: () => void
}

export default function LeadFormModal({ visible, onClose, lead, onSuccess }: LeadFormModalProps) {
  const createMutation = useCreateLead()
  const updateMutation = useUpdateLead()

  const [formData, setFormData] = useState<LeadFormData>({
    full_name: '',
    phone_number: '',
    email: '',
    country: '',
    lead_status: 'potential',
    lead_source: 'facebook',
    follow_up_date: '',
    notes: '',
    tags: [],
    priority_tag: 'normal',
    interested_package: undefined,
  })

  const [tagInput, setTagInput] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    if (lead) {
      setFormData({
        full_name: lead.full_name,
        phone_number: lead.phone_number,
        email: lead.email || '',
        country: lead.country || '',
        lead_status: lead.lead_status,
        lead_source: lead.lead_source,
        follow_up_date: lead.follow_up_date || '',
        notes: lead.notes || '',
        tags: lead.tags || [],
        priority_tag: lead.priority_tag,
        interested_package: lead.interested_package,
      })
      if (lead.follow_up_date) {
        setSelectedDate(new Date(lead.follow_up_date))
      }
    } else {
      resetForm()
    }
  }, [lead, visible])

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone_number: '',
      email: '',
      country: '',
      lead_status: 'potential',
      lead_source: 'facebook',
      follow_up_date: '',
      notes: '',
      tags: [],
      priority_tag: 'normal',
      interested_package: undefined,
    })
    setTagInput('')
    setSelectedDate(new Date())
    setShowDatePicker(false)
  }

  const handleSubmit = async () => {
    if (!formData.full_name.trim() || !formData.phone_number.trim()) {
      Alert.alert('Error', 'Please fill in required fields (Name and Phone)')
      return
    }

    try {
      if (lead) {
        await updateMutation.mutateAsync({ id: lead.id, data: formData })
      } else {
        await createMutation.mutateAsync(formData)
      }
      onSuccess?.()
      onClose()
      resetForm()
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save lead')
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || []
    })
  }

  const handleDateChange = (event: any, date?: Date) => {
    // On Android, picker closes automatically
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
      if (event.type === 'set' && date) {
        setSelectedDate(date)
        const formattedDate = date.toISOString().split('T')[0]
        setFormData({ ...formData, follow_up_date: formattedDate })
      }
    } else {
      // On iOS, keep picker open and update selection
      if (date) {
        setSelectedDate(date)
        const formattedDate = date.toISOString().split('T')[0]
        setFormData({ ...formData, follow_up_date: formattedDate })
      }
    }
  }

  const closeDatePicker = () => {
    setShowDatePicker(false)
  }

  const openDatePicker = () => {
    setShowDatePicker(true)
  }

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return 'Select date'
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const leadStatuses: { value: LeadStatus; label: string; color: string }[] = [
    { value: 'potential', label: 'Potential', color: '#6366F1' },
    { value: 'call_later', label: 'Call Later', color: '#F59E0B' },
    { value: 'interested', label: 'Interested', color: '#10B981' },
    { value: 'not_interested', label: 'Not Interested', color: '#6B7280' },
  ]

  const leadSources: { value: LeadSource; label: string; icon: string }[] = [
    { value: 'facebook', label: 'Facebook', icon: 'logo-facebook' },
    { value: 'instagram', label: 'Instagram', icon: 'logo-instagram' },
    { value: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' },
    { value: 'referral', label: 'Referral', icon: 'people' },
    { value: 'walk_in', label: 'Walk-in', icon: 'walk' },
    { value: 'website', label: 'Website', icon: 'globe' },
    { value: 'google', label: 'Google', icon: 'logo-google' },
    { value: 'other', label: 'Other', icon: 'help-circle' },
  ]

  const priorityTags: { value: PriorityTag; label: string; color: string }[] = [
    { value: 'normal', label: 'Normal', color: '#6B7280' },
    { value: 'priority', label: 'Priority', color: '#F59E0B' },
    { value: 'urgent', label: 'Urgent', color: '#EF4444' },
    { value: 'vip', label: 'VIP', color: '#8B5CF6' },
  ]

  const packages: { value: PackageType; label: string }[] = [
    { value: 'umrah_package', label: 'Umrah Package' },
    { value: 'tourist_visa', label: 'Tourist Visa' },
    { value: 'ticketing', label: 'Ticketing' },
    { value: 'visit_visa', label: 'Visit Visa' },
  ]

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>{lead ? 'Edit Lead' : 'Add New Lead'}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView 
            style={styles.formContainer} 
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.full_name}
                  onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                  placeholder="Enter full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone_number}
                  onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                  placeholder="Enter phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  value={formData.country}
                  onChangeText={(text) => setFormData({ ...formData, country: text })}
                  placeholder="Enter country"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lead Status</Text>
              <View style={styles.optionsGrid}>
                {leadStatuses.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.optionButton,
                      formData.lead_status === status.value && styles.optionButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, lead_status: status.value })}
                  >
                    <View style={[styles.optionDot, { backgroundColor: status.color }]} />
                    <Text style={[
                      styles.optionText,
                      formData.lead_status === status.value && styles.optionTextActive
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Source */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lead Source</Text>
              <View style={styles.optionsGrid}>
                {leadSources.map((source) => (
                  <TouchableOpacity
                    key={source.value}
                    style={[
                      styles.sourceButton,
                      formData.lead_source === source.value && styles.sourceButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, lead_source: source.value })}
                  >
                    <Ionicons
                      name={source.icon as any}
                      size={20}
                      color={formData.lead_source === source.value ? '#6366F1' : '#6B7280'}
                    />
                    <Text style={[
                      styles.sourceText,
                      formData.lead_source === source.value && styles.sourceTextActive
                    ]}>
                      {source.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Priority</Text>
              <View style={styles.optionsGrid}>
                {priorityTags.map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    style={[
                      styles.optionButton,
                      formData.priority_tag === priority.value && styles.optionButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, priority_tag: priority.value })}
                  >
                    <Ionicons
                      name="flag"
                      size={14}
                      color={priority.color}
                    />
                    <Text style={[
                      styles.optionText,
                      formData.priority_tag === priority.value && styles.optionTextActive
                    ]}>
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Interested Package */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interested Package</Text>
              <View style={styles.optionsGrid}>
                {packages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.value}
                    style={[
                      styles.optionButton,
                      formData.interested_package === pkg.value && styles.optionButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, interested_package: pkg.value })}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.interested_package === pkg.value && styles.optionTextActive
                    ]}>
                      {pkg.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Follow-up Date */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Follow-up Date</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={openDatePicker}
              >
                <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                <Text style={[
                  styles.datePickerText,
                  !formData.follow_up_date && styles.datePickerPlaceholder
                ]}>
                  {formatDisplayDate(formData.follow_up_date)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              {formData.follow_up_date && (
                <TouchableOpacity 
                  style={styles.clearDateButton}
                  onPress={() => setFormData({ ...formData, follow_up_date: '' })}
                >
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                  <Text style={styles.clearDateText}>Clear date</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tags */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Add tag"
                  placeholderTextColor="#9CA3AF"
                  onSubmitEditing={addTag}
                />
                <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              {formData.tags && formData.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {formData.tags.map((tag, index) => (
                    <View key={index} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{tag}</Text>
                      <TouchableOpacity onPress={() => removeTag(tag)}>
                        <Ionicons name="close-circle" size={16} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Add notes about this lead..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>{lead ? 'Update' : 'Create'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Date Picker Modal for iOS */}
        {showDatePicker && Platform.OS === 'ios' && (
          <View style={styles.datePickerModalOverlay}>
            <TouchableOpacity 
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={closeDatePicker}
            />
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={closeDatePicker}>
                  <Text style={styles.datePickerDoneButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                textColor="#111827"
              />
            </View>
          </View>
        )}
        
        {/* Date Picker for Android */}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
  },
  modalHeader: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 100,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sourceButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  sourceText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  sourceTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addTagButton: {
    backgroundColor: '#6366F1',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagChipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  datePickerText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  datePickerPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  clearDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  clearDateText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
  datePickerModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  datePickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  datePickerDoneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
})
