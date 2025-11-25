import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'

interface DayData {
    date: Date
    hasTrip: boolean
    hasTask: boolean
    isToday: boolean
}

export function CalendarWidget() {
    const [daysData, setDaysData] = useState<DayData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCalendarData()
    }, [])

    const fetchCalendarData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get next 30 days
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const endDate = new Date(today)
            endDate.setDate(endDate.getDate() + 30)

            // Fetch trips
            const { data: trips } = await supabase
                .from('travel_trips')
                .select('departure_date, destination_date')
                .eq('created_by', user.id)
                .gte('departure_date', today.toISOString())
                .lte('departure_date', endDate.toISOString())

            // Fetch tasks
            const { data: tasks } = await supabase
                .from('client_tasks')
                .select('due_date')
                .eq('created_by', user.id)
                .eq('status', 'pending')
                .gte('due_date', today.toISOString())
                .lte('due_date', endDate.toISOString())

            // Create trip dates set
            const tripDates = new Set<string>()
            trips?.forEach(trip => {
                if (trip.departure_date) {
                    const date = new Date(trip.departure_date)
                    date.setHours(0, 0, 0, 0)
                    tripDates.add(date.toDateString())
                }
                if (trip.destination_date) {
                    const date = new Date(trip.destination_date)
                    date.setHours(0, 0, 0, 0)
                    tripDates.add(date.toDateString())
                }
            })

            // Create task dates set
            const taskDates = new Set<string>()
            tasks?.forEach(task => {
                if (task.due_date) {
                    const date = new Date(task.due_date)
                    date.setHours(0, 0, 0, 0)
                    taskDates.add(date.toDateString())
                }
            })

            // Build days array
            const days: DayData[] = []
            const todayStr = today.toDateString()

            for (let i = 0; i < 30; i++) {
                const date = new Date(today)
                date.setDate(date.getDate() + i)
                const dateStr = date.toDateString()

                days.push({
                    date,
                    hasTrip: tripDates.has(dateStr),
                    hasTask: taskDates.has(dateStr),
                    isToday: dateStr === todayStr,
                })
            }

            setDaysData(days)
        } catch (error) {
            console.error('Error fetching calendar data:', error)
        } finally {
            setLoading(false)
        }
    }

    const renderRow = (rowDays: DayData[]) => {
        return (
            <View style={styles.weekRow}>
                {rowDays.map((day, index) => {
                    const dayNum = day.date.getDate()
                    const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' })

                    return (
                        <View key={index} style={styles.dayCell}>
                            {day.isToday ? (
                                <LinearGradient
                                    colors={['#4F46E5', '#7C3AED']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.dayCardGradient}
                                >
                                    <Text style={styles.dayNameToday}>{dayName}</Text>
                                    <Text style={styles.dayNumberToday}>{dayNum}</Text>
                                    {(day.hasTrip || day.hasTask) && (
                                        <View style={styles.indicators}>
                                            {day.hasTrip && (
                                                <Ionicons name="airplane" size={8} color="#fff" />
                                            )}
                                            {day.hasTask && (
                                                <Ionicons name="checkbox" size={8} color="#fff" />
                                            )}
                                        </View>
                                    )}
                                </LinearGradient>
                            ) : (
                                <View style={styles.dayCard}>
                                    <Text style={styles.dayName}>{dayName}</Text>
                                    <Text style={styles.dayNumber}>{dayNum}</Text>
                                    {(day.hasTrip || day.hasTask) && (
                                        <View style={styles.indicators}>
                                            {day.hasTrip && (
                                                <Ionicons name="airplane" size={8} color="#10B981" />
                                            )}
                                            {day.hasTask && (
                                                <Ionicons name="checkbox" size={8} color="#ba509eff" />
                                            )}
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    )
                })}
            </View>
        )
    }

    if (loading) {
        return (
            <View style={styles.wrapper}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Ionicons name="calendar" size={20} color="#4F46E5" />
                        <Text style={styles.title}>Upcoming 30 Days</Text>
                    </View>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading calendar...</Text>
                    </View>
                </View>
            </View>
        )
    }

    // Group days into rows (5 days each for 6 rows)
    const rows: DayData[][] = []
    for (let i = 0; i < daysData.length; i += 5) {
        rows.push(daysData.slice(i, i + 5))
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="calendar" size={20} color="#4F46E5" />
                    <Text style={styles.title}>Upcoming 30 Days</Text>
                </View>

                {/* Calendar Grid */}
                <View style={styles.calendarGrid}>
                    {rows.map((row, rowIndex) => (
                        <View key={rowIndex}>
                            {renderRow(row)}
                        </View>
                    ))}
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <Ionicons name="airplane" size={12} color="#10B981" />
                        <Text style={styles.legendText}>Trip</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <Ionicons name="checkbox" size={12} color="#ba509eff" />
                        <Text style={styles.legendText}>Task</Text>
                    </View>
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
        borderWidth: 2,
        borderColor: '#E0E7FF',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
    },
    calendarGrid: {
        gap: 8,
    },
    weekRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 2,
    },
    dayCell: {
        flex: 1,
        aspectRatio: 1,
    },
    dayCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        padding: 4,
    },
    dayCardGradient: {
        flex: 1,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
    },
    dayName: {
        fontSize: 9,
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    dayNameToday: {
        fontSize: 9,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    dayNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    dayNumberToday: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    indicators: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 2,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
})
