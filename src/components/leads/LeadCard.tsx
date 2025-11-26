import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Lead, LeadStatus } from '../../types/travelAgent'

interface LeadCardProps {
  lead: Lead
  onPress: () => void
  onConvert?: () => void
}

export default function LeadCard({ lead, onPress, onConvert }: LeadCardProps) {
  const getStatusColor = (status: LeadStatus): [string, string] => {
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

  const formatFollowUpDate = (date?: string) => {
    if (!date) return null
    const followUpDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (followUpDate < today) {
      return { text: 'Overdue', color: '#EF4444' }
    } else if (followUpDate.toDateString() === today.toDateString()) {
      return { text: 'Today', color: '#F59E0B' }
    } else if (followUpDate.toDateString() === tomorrow.toDateString()) {
      return { text: 'Tomorrow', color: '#10B981' }
    } else {
      return { text: followUpDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), color: '#6B7280' }
    }
  }

  const followUpInfo = formatFollowUpDate(lead.follow_up_date)
  const colors = getStatusColor(lead.lead_status)
  const priorityColors = {
    vip: '#8B5CF6',
    urgent: '#EF4444',
    priority: '#F59E0B',
    normal: '#6B7280'
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statusBar}
      />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColors[lead.priority_tag] }]}>
              <Ionicons name="flag" size={10} color="#fff" />
            </View>
            <Text style={styles.name} numberOfLines={1}>{lead.full_name}</Text>
          </View>
          <View style={[styles.sourceIcon, { backgroundColor: `${colors[0]}20` }]}>
            <Ionicons name={getSourceIcon(lead.lead_source) as any} size={16} color={colors[0]} />
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactRow}>
          <Ionicons name="call" size={14} color="#6B7280" />
          <Text style={styles.contactText}>{lead.phone_number}</Text>
        </View>

        {lead.email && (
          <View style={styles.contactRow}>
            <Ionicons name="mail" size={14} color="#6B7280" />
            <Text style={styles.contactText} numberOfLines={1}>{lead.email}</Text>
          </View>
        )}

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {lead.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {lead.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{lead.tags.length - 3}</Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={[styles.statusBadge, { backgroundColor: `${colors[0]}20` }]}>
              <Text style={[styles.statusText, { color: colors[0] }]}>
                {lead.lead_status.replace('_', ' ')}
              </Text>
            </View>

            {followUpInfo && (
              <View style={[styles.followUpBadge, { backgroundColor: `${followUpInfo.color}20` }]}>
                <Ionicons name="calendar" size={12} color={followUpInfo.color} />
                <Text style={[styles.followUpText, { color: followUpInfo.color }]}>
                  {followUpInfo.text}
                </Text>
              </View>
            )}
          </View>

          {lead.lead_status === 'interested' && onConvert && (
            <TouchableOpacity
              style={styles.convertButton}
              onPress={(e) => {
                e.stopPropagation()
                onConvert()
              }}
            >
              <Ionicons name="arrow-forward-circle" size={20} color="#10B981" />
              <Text style={styles.convertText}>Convert</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  statusBar: {
    height: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  priorityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  sourceIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#9CA3AF',
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  followUpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  followUpText: {
    fontSize: 11,
    fontWeight: '600',
  },
  convertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  convertText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
})
