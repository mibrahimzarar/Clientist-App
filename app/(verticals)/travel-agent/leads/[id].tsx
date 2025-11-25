import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLead, useLeadNotes, useCreateLeadNote, useUpdateLead, useConvertLeadToClient, useDeleteLead } from '../../../../src/hooks/useLeads'
import LeadFormModal from '../../../../src/components/leads/LeadFormModal'

export default function LeadDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: leadData, isLoading } = useLead(id!)
  const { data: notesData, refetch: refetchNotes } = useLeadNotes(id!)
  const createNoteMutation = useCreateLeadNote()
  const updateMutation = useUpdateLead()
  const convertMutation = useConvertLeadToClient()
  const deleteMutation = useDeleteLead()

  const [showFormModal, setShowFormModal] = useState(false)
  const [noteInput, setNoteInput] = useState('')

  const lead = leadData?.data
  const notes = notesData?.data || []

  const handleAddNote = async () => {
    if (!noteInput.trim()) return

    try {
      await createNoteMutation.mutateAsync({
        leadId: id!,
        content: noteInput.trim(),
        type: 'general'
      })
      setNoteInput('')
      refetchNotes()
    } catch (error) {
      Alert.alert('Error', 'Failed to add note')
    }
  }

  const handleConvert = async () => {
    Alert.alert(
      'Convert Lead',
      'Are you sure you want to convert this lead to a client?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Convert',
          onPress: async () => {
            try {
              const result = await convertMutation.mutateAsync(id!)
              if (result.success) {
                Alert.alert('Success', 'Lead converted to client successfully!', [
                  {
                    text: 'View Client',
                    onPress: () => router.replace(`/(verticals)/travel-agent/clients/${result.data?.id}`)
                  }
                ])
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to convert lead')
            }
          }
        }
      ]
    )
  }

  const handleDelete = async () => {
    Alert.alert(
      'Delete Lead',
      'Are you sure you want to delete this lead? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(id!)
              router.back()
            } catch (error) {
              Alert.alert('Error', 'Failed to delete lead')
            }
          }
        }
      ]
    )
  }

  const getStatusColor = (status: string): [string, string] => {
    switch (status) {
      case 'potential': return ['#6366F1', '#4F46E5']
      case 'call_later': return ['#F59E0B', '#D97706']
      case 'interested': return ['#10B981', '#059669']
      case 'not_interested': return ['#6B7280', '#4B5563']
      case 'converted': return ['#8B5CF6', '#7C3AED']
      default: return ['#6B7280', '#4B5563']
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'facebook': return 'logo-facebook'
      case 'instagram': return 'logo-instagram'
      case 'whatsapp': return 'logo-whatsapp'
      case 'referral': return 'people'
      case 'walk_in': return 'walk'
      case 'website': return 'globe'
      case 'google': return 'logo-google'
      default: return 'help-circle'
    }
  }

  if (isLoading || !lead) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    )
  }

  const colors = getStatusColor(lead.lead_status)

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={colors} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowFormModal(true)} style={styles.headerButton}>
              <Ionicons name="create" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.headerTitle}>{lead.full_name}</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{lead.lead_status.replace('_', ' ')}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="call" size={20} color="#6366F1" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{lead.phone_number}</Text>
            </View>
          </View>

          {lead.email && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail" size={20} color="#6366F1" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{lead.email}</Text>
              </View>
            </View>
          )}

          {lead.country && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={20} color="#6366F1" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Country</Text>
                <Text style={styles.infoValue}>{lead.country}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Lead Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lead Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Source</Text>
            <View style={styles.detailValue}>
              <Ionicons name={getSourceIcon(lead.lead_source) as any} size={16} color="#6B7280" />
              <Text style={styles.detailText}>{lead.lead_source}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Priority</Text>
            <View style={styles.detailValue}>
              <Ionicons name="flag" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{lead.priority_tag}</Text>
            </View>
          </View>

          {lead.interested_package && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interested Package</Text>
              <Text style={styles.detailText}>{lead.interested_package.replace('_', ' ')}</Text>
            </View>
          )}

          {lead.follow_up_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Follow-up Date</Text>
              <View style={styles.detailValue}>
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text style={styles.detailText}>
                  {new Date(lead.follow_up_date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {lead.tags && lead.tags.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tags</Text>
              <View style={styles.tagsContainer}>
                {lead.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Notes Section */}
        {lead.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Initial Notes</Text>
            <Text style={styles.notesText}>{lead.notes}</Text>
          </View>
        )}

        {/* Timeline Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timeline</Text>
          
          <View style={styles.noteInputContainer}>
            <TextInput
              style={styles.noteInput}
              value={noteInput}
              onChangeText={setNoteInput}
              placeholder="Add a note..."
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <TouchableOpacity
              style={styles.addNoteButton}
              onPress={handleAddNote}
              disabled={!noteInput.trim() || createNoteMutation.isPending}
            >
              {createNoteMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {notes.map((note, index) => (
            <View key={note.id} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              {index !== notes.length - 1 && <View style={styles.timelineLine} />}
              <View style={styles.timelineContent}>
                <Text style={styles.timelineText}>{note.content}</Text>
                <Text style={styles.timelineDate}>
                  {new Date(note.created_at).toLocaleDateString()} at{' '}
                  {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Convert Button */}
        {lead.lead_status !== 'converted' && lead.lead_status !== 'not_interested' && (
          <TouchableOpacity style={styles.convertButton} onPress={handleConvert}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.convertGradient}
            >
              <Ionicons name="arrow-forward-circle" size={24} color="#fff" />
              <Text style={styles.convertButtonText}>Convert to Client</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Lead Form Modal */}
      <LeadFormModal
        visible={showFormModal}
        onClose={() => setShowFormModal(false)}
        lead={lead}
        onSuccess={() => {}}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  notesText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  noteInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addNoteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 30,
    marginBottom: 16,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
  },
  timelineLine: {
    position: 'absolute',
    left: 5.5,
    top: 16,
    width: 1,
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  timelineContent: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
  },
  timelineText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  convertButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  convertGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
  },
  convertButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
})
