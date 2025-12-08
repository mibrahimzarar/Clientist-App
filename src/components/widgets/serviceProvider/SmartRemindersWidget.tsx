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
import { useSPJobs, useSPLeads, useSPInvoices } from '../../../hooks/useServiceProvider'

export function SmartRemindersWidget() {
    const { data: jobsData } = useSPJobs()
    const { data: leadsData } = useSPLeads()
    const { data: invoicesData } = useSPInvoices()

    const jobs = jobsData?.data || []
    const leads = leadsData?.data || []
    const invoices = invoicesData?.data || []

    // Combine and sort all items by date
    const allItems = [
        ...jobs.filter(j => j.status === 'in_progress' || j.status === 'pending_payment').map(j => ({ ...j, itemType: 'job' as const, date: j.scheduled_date || j.created_at, title: j.title })),
        ...leads.filter(l => l.next_follow_up).map(l => ({ ...l, itemType: 'lead' as const, date: l.next_follow_up!, title: l.full_name })),
        ...invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').map(i => ({ ...i, itemType: 'invoice' as const, date: i.due_date, title: `Invoice #${i.invoice_number}` }))
    ].filter((item): item is any => {
        if (!item || !item.date) return false
        // Always show invoices (unpaid/overdue) as they are critical
        if (item.itemType === 'invoice') return true
        
        const date = new Date(item.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date >= today
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5) // Show top 5

    const getIcon = (itemType: string) => {
        if (itemType === 'job') return 'hammer'
        if (itemType === 'lead') return 'person-add'
        if (itemType === 'invoice') return 'receipt'
        return 'alarm'
    }

    const getColor = (itemType: string) => {
        if (itemType === 'job') return '#3B82F6'
        if (itemType === 'lead') return '#F59E0B'
        if (itemType === 'invoice') return '#EF4444'
        return '#6B7280'
    }

    const getLabel = (itemType: string) => {
        if (itemType === 'job') return 'Upcoming Job'
        if (itemType === 'lead') return 'Lead Follow-up'
        if (itemType === 'invoice') return 'Payment Due'
        return 'Reminder'
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
                </View>

                <View style={styles.list}>
                    {allItems.map((item, index) => {
                        const icon = getIcon(item.itemType)
                        const color = getColor(item.itemType)
                        const dateStr = item.date || ''
                        const isOverdue = dateStr && new Date(dateStr) < new Date() && dateStr.split('T')[0] !== new Date().toISOString().split('T')[0]

                        return (
                            <TouchableOpacity key={index} style={styles.item}>
                                <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                                    <Ionicons name={icon as any} size={18} color={color} />
                                </View>
                                <View style={styles.content}>
                                    <Text style={styles.itemTitle} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.itemSubtitle}>
                                        {getLabel(item.itemType)}
                                    </Text>
                                </View>
                                <View style={[styles.dateBadge, isOverdue && styles.overdueBadge]}>
                                    <Text style={[styles.dateText, isOverdue && styles.overdueText]}>
                                        {formatDate(dateStr)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                    {allItems.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No upcoming items</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 24,
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
    },
})
