import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSPJobs, useSPLeads, useSPInvoices } from '../../../hooks/useServiceProvider'

interface DayData {
    date: Date
    hasJob: boolean
    hasLead: boolean
    hasInvoice: boolean
    isToday: boolean
}

export function ServiceProviderCalendarWidget() {
    const [daysData, setDaysData] = useState<DayData[]>([])
    const [loading, setLoading] = useState(true)

    const { data: jobsData } = useSPJobs()
    const { data: leadsData } = useSPLeads()
    const { data: invoicesData } = useSPInvoices()

    useEffect(() => {
        if (jobsData && leadsData && invoicesData) {
            processCalendarData()
        }
    }, [jobsData, leadsData, invoicesData])

    const processCalendarData = () => {
        try {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // Create job dates set (scheduled dates)
            const jobDates = new Set<string>()
            jobsData?.data?.forEach(job => {
                if (job.scheduled_date) {
                    const date = new Date(job.scheduled_date)
                    date.setHours(0, 0, 0, 0)
                    jobDates.add(date.toDateString())
                }
            })

            // Create lead dates set (follow ups)
            const leadDates = new Set<string>()
            leadsData?.data?.forEach(lead => {
                if (lead.next_follow_up) {
                    const date = new Date(lead.next_follow_up)
                    date.setHours(0, 0, 0, 0)
                    leadDates.add(date.toDateString())
                }
            })

            // Create invoice dates set (due dates)
            const invoiceDates = new Set<string>()
            invoicesData?.data?.forEach(invoice => {
                if (invoice.due_date) {
                    const date = new Date(invoice.due_date)
                    date.setHours(0, 0, 0, 0)
                    invoiceDates.add(date.toDateString())
                }
            })

            // Build days array for next 30 days
            const days: DayData[] = []
            const todayStr = today.toDateString()

            for (let i = 0; i < 30; i++) {
                const date = new Date(today)
                date.setDate(date.getDate() + i)
                const dateStr = date.toDateString()

                days.push({
                    date,
                    hasJob: jobDates.has(dateStr),
                    hasLead: leadDates.has(dateStr),
                    hasInvoice: invoiceDates.has(dateStr),
                    isToday: dateStr === todayStr,
                })
            }

            setDaysData(days)
        } catch (error) {
            console.error('Error processing calendar data:', error)
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

                    // Determine border color based on what's scheduled
                    let borderColor = '#E5E7EB' // default
                    let borderColors: [string, string] = ['#E5E7EB', '#E5E7EB']
                    let hasMultiple = false

                    const activeItems = [day.hasJob, day.hasLead, day.hasInvoice].filter(Boolean).length

                    if (activeItems > 1) {
                        hasMultiple = true
                        // Simple gradient logic for multiples
                        if (day.hasJob) borderColors = ['#3B82F6', '#F59E0B']
                        else if (day.hasLead) borderColors = ['#F59E0B', '#10B981']
                    } else if (day.hasJob) {
                        borderColor = '#3B82F6' // Blue for job
                    } else if (day.hasLead) {
                        borderColor = '#F59E0B' // Orange for lead
                    } else if (day.hasInvoice) {
                        borderColor = '#10B981' // Green for invoice
                    }

                    const hasActivity = activeItems > 0

                    return (
                        <View key={index} style={styles.dayCell}>
                            {day.isToday ? (
                                <LinearGradient
                                    colors={['#8B5CF6', '#7C3AED']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.dayCardGradient}
                                >
                                    <Text style={styles.dayNameToday}>{dayName}</Text>
                                    <Text style={styles.dayNumberToday}>{dayNum}</Text>
                                    {hasActivity && (
                                        <View style={styles.indicators}>
                                            {day.hasJob && <Ionicons name="hammer" size={8} color="#fff" />}
                                            {day.hasLead && <Ionicons name="person-add" size={8} color="#fff" />}
                                            {day.hasInvoice && <Ionicons name="receipt" size={8} color="#fff" />}
                                        </View>
                                    )}
                                </LinearGradient>
                            ) : (
                                <View style={styles.dayCell}>
                                    {hasMultiple ? (
                                        <LinearGradient
                                            colors={borderColors}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.gradientBorder}
                                        >
                                            <View style={styles.dayCardInner}>
                                                <Text style={styles.dayName}>{dayName}</Text>
                                                <Text style={styles.dayNumber}>{dayNum}</Text>
                                                <View style={styles.indicators}>
                                                    {day.hasJob && <Ionicons name="hammer" size={7} color="#3B82F6" />}
                                                    {day.hasLead && <Ionicons name="person-add" size={7} color="#F59E0B" />}
                                                    {day.hasInvoice && <Ionicons name="receipt" size={7} color="#10B981" />}
                                                </View>
                                            </View>
                                        </LinearGradient>
                                    ) : (
                                        <View style={[styles.dayCard,
                                        hasActivity && {
                                            borderColor: borderColor,
                                            borderWidth: 2,
                                            shadowColor: borderColor,
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.4,
                                            shadowRadius: 4,
                                            elevation: 3,
                                        }
                                        ]}>
                                            <Text style={styles.dayName}>{dayName}</Text>
                                            <Text style={styles.dayNumber}>{dayNum}</Text>
                                            {hasActivity && (
                                                <View style={styles.indicators}>
                                                    {day.hasJob && <Ionicons name="hammer" size={7} color="#3B82F6" />}
                                                    {day.hasLead && <Ionicons name="person-add" size={7} color="#F59E0B" />}
                                                    {day.hasInvoice && <Ionicons name="receipt" size={7} color="#10B981" />}
                                                </View>
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
                        <Ionicons name="calendar" size={20} color="#3B82F6" />
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
                    <Ionicons name="calendar" size={20} color="#3B82F6" />
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
                        <Ionicons name="hammer" size={12} color="#3B82F6" />
                        <Text style={styles.legendText}>Job</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <Ionicons name="person-add" size={12} color="#F59E0B" />
                        <Text style={styles.legendText}>Lead</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <Ionicons name="receipt" size={12} color="#10B981" />
                        <Text style={styles.legendText}>Invoice</Text>
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
        borderColor: '#DBEAFE',
        shadowColor: '#3B82F6',
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
        padding: 4,
    },
    gradientBorder: {
        flex: 1,
        borderRadius: 10,
        padding: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    dayCardInner: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
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
        marginTop: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
