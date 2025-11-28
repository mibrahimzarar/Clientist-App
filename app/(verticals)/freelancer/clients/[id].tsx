import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { useFreelancerClient, useDeleteClient } from '../../../../src/hooks/useFreelancer'
import { FreelancerClientStatus } from '../../../../src/types/freelancer'

export default function FreelancerClientDetails() {
  const { id } = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const { data, isLoading, isError } = useFreelancerClient(id as string)
  const deleteClientMutation = useDeleteClient()

  const client = data?.data

  const handleDelete = () => {
    Alert.alert(
      'Delete Client',
      'Are you sure you want to delete this client? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClientMutation.mutateAsync(id as string)
              router.back()
            } catch (error) {
              Alert.alert('Error', 'Failed to delete client')
            }
          }
        }
      ]
    )
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <BouncingBallsLoader size={12} color="#8B5CF6" />
      </View>
    )
  }

  if (isError || !client) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Client not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const getStatusColor = (status: FreelancerClientStatus): [string, string] => {
    switch (status) {
      case 'active': return ['#10B981', '#059669']
      case 'inactive': return ['#9CA3AF', '#6B7280']
      case 'lead': return ['#F59E0B', '#D97706']
      case 'archived': return ['#6366F1', '#4F46E5']
      default: return ['#6B7280', '#4B5563']
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Background */}
        <LinearGradient
          colors={getStatusColor(client.status)}
          style={[styles.headerBackground, { paddingTop: insets.top }]}
        >
          <View style={styles.headerNav}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/(verticals)/freelancer/clients/${id}/edit` as any)}
              >
                <Ionicons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: 'rgba(239,68,68,0.2)', marginLeft: 8 }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.profileHeader}>
            <Image
              source={{
                uri: client.profile_picture_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(client.full_name)}&background=random`
              }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{client.full_name}</Text>
            <Text style={styles.profileRole}>{client.role} {client.company_name && `at ${client.company_name}`}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{client.status}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => { /* TODO: Call */ }}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="call" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.quickActionText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => { /* TODO: Email */ }}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="mail" size={24} color="#10B981" />
            </View>
            <Text style={styles.quickActionText}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => { /* TODO: WhatsApp */ }}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.quickActionText}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{client.email || 'No email provided'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{client.phone_number || 'No phone provided'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>{client.country || 'No location provided'}</Text>
            </View>
          </View>
        </View>

        {/* Tags */}
        {client.tags && client.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {client.tags.map((tag: string, index: number) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        {client.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{client.notes}</Text>
            </View>
          </View>
        )}

      </ScrollView>
      {deleteClientMutation.isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
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
  headerBackground: {
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: -35,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  tagText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  notesCard: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  notesText: {
    color: '#92400E',
    fontSize: 15,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  }
})