import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFreelancerReminders, useFreelancerMeetings, useFreelancerLeads } from '../../hooks/useFreelancer'
import { FreelancerReminder, FreelancerMeeting, FreelancerLead } from '../../types/freelancer'

export function SmartRemindersWidget() {
    const { data: remindersData } = useFreelancerReminders()
    const { data: meetingsData } = useFreelancerMeetings()
    const { data: leadsData } = useFreelancerLeads()

    const reminders = remindersData?.data || []
    const meetings = meetingsData?.data || []
    const leads = leadsData?.data || []

    // Combine and sort all items by date
    const allItems = [
        ...reminders.map(r => ({ ...r, itemType: 'reminder' as const, date: r.due_date })),
        ...meetings.map(m => ({ ...m, itemType: 'meeting' as const, date: m.start_time })),
        ...leads.filter(l => l.next_follow_up).map(l => ({ ...l, itemType: 'lead' as const, date: l.next_follow_up! }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5) // Show top 5

    const getIcon = (type: string, itemType: string) => {
        if (itemType === 'meeting') return 'videocam'
        if (itemType === 'lead') return 'person-add'

        switch (type) {
            case 'follow_up': return 'chatbubble-ellipses'
            case 'contract_expiry': return 'document-text'
            case 'payment': return 'card'
            case 'automation_ping': return 'pulse'
            default: return 'alarm'
        }
    }

    const getColor = (type: string, itemType: string) => {
        if (itemType === 'meeting') return '#3B82F6'
        if (itemType === 'lead') return '#F59E0B'

        switch (type) {
            case 'follow_up': return '#8B5CF6'
            case 'contract_expiry': return '#EF4444'
            case 'payment': return '#10B981'
            case 'automation_ping': return '#6366F1'
            default: return '#6B7280'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Tomorrow'
        if (diffDays < 0) return `${Math.abs(diffDays)}d ago`
        return `${diffDays}d left`
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Ionicons name="flash" size={20} color="#F59E0B" />
                        <Text style={styles.title}>Smart Reminders</Text>
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.list}>
                    {allItems.map((item, index) => {
                        const icon = getIcon((item as any).type, item.itemType)
                        const color = getColor((item as any).type, item.itemType)
                        const isOverdue = new Date(item.date) < new Date() && item.date.split('T')[0] !== new Date().toISOString().split('T')[0]

                        return (
                            <TouchableOpacity key={index} style={styles.item}>
                                <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                                    <Ionicons name={icon as any} size={18} color={color} />
                                </View>
                                <View style={styles.content}>
                                    <Text style={styles.itemTitle} numberOfLines={1}>
                                        {(item as any).title || (item as any).full_name}
                                    </Text>
                                    <Text style={styles.itemSubtitle}>
                                        {item.itemType === 'meeting' ? 'Meeting' :
                                            item.itemType === 'lead' ? 'Lead Follow-up' :
                                                ((item as any).type?.replace('_', ' ') || 'Reminder')}
                                    </Text>
                                </View>
                                <View style={[styles.dateBadge, isOverdue && styles.overdueBadge]}>
                                    <Text style={[styles.dateText, isOverdue && styles.overdueText]}>
                                        {formatDate(item.date)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                    {allItems.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No upcoming reminders</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    seeAll: {
        fontSize: 14,
        color: '#8B5CF6',
        fontWeight: '600',
    },
    list: {
        gap: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 4,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    dateBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    overdueBadge: {
        backgroundColor: '#FEF2F2',
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    overdueText: {
        color: '#EF4444',
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
    }
})
