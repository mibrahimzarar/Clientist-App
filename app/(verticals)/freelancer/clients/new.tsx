import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import { useCreateClient } from '../../../../src/hooks/useFreelancer'
import { FreelancerClientStatus } from '../../../../src/types/freelancer'
import { freelancerService } from '../../../../src/services/freelancerService'

export default function NewClientPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    role: '',
    email: '',
    phone_number: '',
    country: '',
    profile_picture_url: '',
    status: 'active' as FreelancerClientStatus,
    tags: '',
    notes: '',
  })
  const [uploading, setUploading] = useState(false)

  const createClientMutation = useCreateClient()

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled) {
        // Just set the temp URI - we'll save it locally when creating the client
        setFormData({ ...formData, profile_picture_url: result.assets[0].uri })
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image')
    }
  }

  const handleSubmit = async () => {
    if (!formData.full_name) {
      Alert.alert('Error', 'Full Name is required')
      return
    }

    try {
      // Create client first
      const newClient = await createClientMutation.mutateAsync({
        ...formData,
        profile_picture_url: '', // Will update after saving image
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      })

      // Save image locally if one was selected
      if (formData.profile_picture_url && newClient?.id) {
        setUploading(true)
        try {
          const { saveClientImage } = await import('../../../../src/utils/localImageStorage')
          const localUri = await saveClientImage(newClient.id, formData.profile_picture_url)

          // Update client with local URI
          const { supabase } = await import('../../../../src/lib/supabase')
          await supabase
            .from('freelancer_clients')
            .update({ profile_picture_url: localUri })
            .eq('id', newClient.id)
        } catch (error) {
          console.error('Image save error:', error)
          // Continue even if image save fails
        } finally {
          setUploading(false)
        }
      }

      Alert.alert('Success', 'Client created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ])
    } catch (error) {
      Alert.alert('Error', 'Failed to create client')
      console.error(error)
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Client</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          {/* Image Picker */}
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {formData.profile_picture_url ? (
                <Image source={{ uri: formData.profile_picture_url }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="camera" size={32} color="#9CA3AF" />
                  <Text style={styles.placeholderText}>Add Photo</Text>
                </View>
              )}
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              placeholder="e.g. John Doe"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.input}
              value={formData.company_name}
              onChangeText={(text) => setFormData({ ...formData, company_name: text })}
              placeholder="e.g. Acme Corp"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Role</Text>
            <TextInput
              style={styles.input}
              value={formData.role}
              onChangeText={(text) => setFormData({ ...formData, role: text })}
              placeholder="e.g. CEO"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="e.g. john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone_number}
              onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
              placeholder="e.g. +1 234 567 890"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(text) => setFormData({ ...formData, country: text })}
              placeholder="e.g. USA"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={formData.tags}
              onChangeText={(text) => setFormData({ ...formData, tags: text })}
              placeholder="e.g. VIP, Referral"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Add notes..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={createClientMutation.isPending || uploading}
        >
          {createClientMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Client</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
})