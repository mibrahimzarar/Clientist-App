import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'

interface CalendarEvent {
    id: string
    type: 'task' | 'lead' | 'reminder'
    title: string
    date: string
    route?: string
}

interface CalendarWidgetProps {
    tasks?: Array<{ id: string; title: string; due_date: string; project_id?: string }>
    leads?: Array<{ id: string; full_name: string; next_follow_up: string }>
    reminders?: Array<{ id: string; title: string; due_date: string }>
}

export function CalendarWidget({ tasks = [], leads = [], reminders = [] }: CalendarWidgetProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    // Get current month details
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']

    // Convert all events to a common format
    const events: CalendarEvent[] = [
        ...tasks.filter(t => t.due_date).map(t => ({
            id: t.id,
            type: 'task' as const,
            title: t.title,
            date: t.due_date.split('T')[0],
            route: t.project_id ? `/(verticals)/freelancer/projects/${t.project_id}/tasks` : undefined
        })),
        ...leads.filter(l => l.next_follow_up).map(l => ({
            id: l.id,
            type: 'lead' as const,
            title: l.full_name,
            date: l.next_follow_up.split('T')[0],
            route: `/(verticals)/freelancer/leads/${l.id}`
        })),
        ...reminders.filter(r => r.due_date).map(r => ({
            id: r.id,
            type: 'reminder' as const,
            title: r.title,
            date: r.due_date.split('T')[0],
        }))
    ]

    // Group events by date
    const eventsByDate: Record<string, CalendarEvent[]> = {}
    events.forEach(event => {
        if (!eventsByDate[event.date]) {
            eventsByDate[event.date] = []
        }
        eventsByDate[event.date].push(event)
    })

    const getEventColor = (type: string) => {
        switch (type) {
            case 'task': return '#EC4899'
            case 'lead': return '#F59E0B'
            case 'reminder': return '#8B5CF6'
            default: return '#6B7280'
        }
    }

    const hasEventsOnDate = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return eventsByDate[dateStr]?.length > 0
    }

    const getEventsForDate = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return eventsByDate[dateStr] || []
    }

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const isToday = (day: number) => {
        const today = new Date()
        return today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year
    }

    // Generate calendar grid
    const calendarDays = []
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(<View key={`empty-${i}`} style={styles.dayCell} />)
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEvents = getEventsForDate(day)
        calendarDays.push(
            <TouchableOpacity
                key={day}
                style={[
                    styles.dayCell,
                    isToday(day) && styles.todayCell
                ]}
                onPress={() => {
                    if (dayEvents.length > 0 && dayEvents[0].route) {
                        router.push(dayEvents[0].route as any)
                    }
                }}
            >
                <Text style={[
                    styles.dayText,
                    isToday(day) && styles.todayText
                ]}>
                    {day}
                </Text>
                {hasEventsOnDate(day) && (
                    <View style={styles.eventDots}>
                        {dayEvents.slice(0, 3).map((event, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.eventDot,
                                    { backgroundColor: getEventColor(event.type) }
                                ]}
                            />
                        ))}
                    </View>
                )}
            </TouchableOpacity>
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
                <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {monthNames[month]} {year}
                </Text>
                <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.calendarContainer}>
                {/* Day headers */}
                <View style={styles.weekDays}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <Text key={idx} style={styles.weekDayText}>{day}</Text>
                    ))}
                </View>

                {/* Calendar grid */}
                <View style={styles.daysGrid}>
                    {calendarDays}
                </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
                    <Text style={styles.legendText}>Tasks</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.legendText}>Leads</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                    <Text style={styles.legendText}>Reminders</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    navButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    calendarContainer: {
        padding: 16,
    },
    weekDays: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    todayCell: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    dayText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    todayText: {
        color: '#8B5CF6',
        fontWeight: '700',
    },
    eventDots: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 2,
    },
    eventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        color: '#6B7280',
    },
})
