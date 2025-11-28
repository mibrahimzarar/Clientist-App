import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useUpcomingTravels, usePendingTasks } from '../../../hooks/useTravelAgent'
import { useUpcomingFollowUps } from '../../../hooks/useLeads'

export function SmartRemindersWidget() {
    const { data: travelsData } = useUpcomingTravels(100)
    const { data: tasksData } = usePendingTasks(100)
    const { data: leadsData } = useUpcomingFollowUps(100)

    const travels = travelsData?.data || []
    const tasks = tasksData?.data || []
    const leads = leadsData?.data || []

    // Combine and sort all items by date
    const allItems = [
        ...travels.map(t => ({ ...t, itemType: 'trip' as const, date: t.departure_date, title: t.full_name })),
        ...tasks.map(t => ({ ...t, itemType: 'task' as const, date: t.due_date, title: t.title })),
        ...leads.filter(l => l.follow_up_date).map(l => ({ ...l, itemType: 'lead' as const, date: l.follow_up_date!, title: l.full_name }))
    ].filter((item): item is any => item && item.date != null).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5) // Show top 5

    const getIcon = (itemType: string) => {
        if (itemType === 'trip') return 'airplane'
        if (itemType === 'task') return 'checkbox'
        if (itemType === 'lead') return 'person-add'
        return 'alarm'
    }

    const getColor = (itemType: string) => {
        if (itemType === 'trip') return '#10B981'
        if (itemType === 'task') return '#ba509eff'
        if (itemType === 'lead') return '#F59E0B'
        return '#6B7280'
    }

    const getLabel = (itemType: string) => {
        if (itemType === 'trip') return 'Trip'
        if (itemType === 'task') return 'Task'
        if (itemType === 'lead') return 'Lead Follow-up'
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
