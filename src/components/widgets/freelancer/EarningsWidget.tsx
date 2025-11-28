import React, { useState, useMemo } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFreelancerInvoices } from '../../../hooks/useFreelancer'

interface EarningRecord {
    monthYear: string
    month: number
    year: number
    monthlyEarning: number
    yearlyEarning: number
}

export function EarningsWidget() {
    const { data: invoicesData } = useFreelancerInvoices()
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [showYearPicker, setShowYearPicker] = useState(false)

    // Calculate earnings from invoices (paid and sent)
    const earningsData = useMemo(() => {
        if (!invoicesData?.data) return { availableMonths: [], availableYears: [], monthlyEarning: 0, yearlyEarning: 0 }

        const earnedInvoices = invoicesData.data.filter(inv => inv.status === 'paid' || inv.status === 'sent')
        const earningsByMonthYear: { [key: string]: number } = {}
        const yearSet = new Set<number>()
        const monthYearSet = new Set<string>()

        earnedInvoices.forEach(invoice => {
            const date = new Date(invoice.due_date)
            const year = date.getFullYear()
            const month = date.getMonth()
            const monthYearKey = `${year}-${month}`

            earningsByMonthYear[monthYearKey] = (earningsByMonthYear[monthYearKey] || 0) + (invoice.total_amount || 0)
            yearSet.add(year)
            monthYearSet.add(monthYearKey)
        })

        // Get available months for selected year
        const availableMonths = Array.from(monthYearSet)
            .filter(key => key.startsWith(`${selectedYear}-`))
            .map(key => {
                const [year, month] = key.split('-').map(Number)
                return { month, year, monthYear: key }
            })
            .sort((a, b) => b.month - a.month)

        // Calculate monthly earning for selected month
        const currentMonthKey = `${selectedYear}-${selectedMonth}`
        const monthlyEarning = earningsByMonthYear[currentMonthKey] || 0

        // Calculate yearly earning for selected year
        let yearlyEarning = 0
        for (let m = 0; m < 12; m++) {
            const monthKey = `${selectedYear}-${m}`
            yearlyEarning += earningsByMonthYear[monthKey] || 0
        }

        return {
            availableMonths,
            availableYears: Array.from(yearSet).sort((a, b) => b - a),
            monthlyEarning,
            yearlyEarning,
            allMonthsForYear: availableMonths
        }
    }, [invoicesData?.data, selectedYear, selectedMonth])

    const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long' })
    const formattedMonthYear = `${monthName} ${selectedYear}`

    const handleMonthSelect = (month: number) => {
        setSelectedMonth(month)
        setShowMonthPicker(false)
    }

    const handleYearSelect = (year: number) => {
        setSelectedYear(year)
        setShowYearPicker(false)
    }

    const formatEarnings = (amount: number): string => {
        if (amount === 0) return '$0'
        if (amount >= 1000000) {
            return '$' + Math.floor(amount / 1000000) + 'M'
        }
        if (amount >= 1000) {
            return '$' + Math.floor(amount / 1000) + 'k'
        }
        return '$' + amount.toFixed(2)
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.widget}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Earnings</Text>
                        <Text style={styles.subtitle}>From paid invoices</Text>
                    </View>
                    <Ionicons name="trending-up" size={32} color="#fff" />
                </View>

                {/* Month/Year Selectors */}
                <View style={styles.selectors}>
                    <TouchableOpacity
                        style={styles.selector}
                        onPress={() => setShowMonthPicker(true)}
                    >
                        <Text style={styles.selectorText}>{monthName}</Text>
                        <Ionicons name="chevron-down" size={16} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.selector}
                        onPress={() => setShowYearPicker(true)}
                    >
                        <Text style={styles.selectorText}>{selectedYear}</Text>
                        <Ionicons name="chevron-down" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Earnings Display */}
                <View style={styles.earningsContainer}>
                    <View style={styles.earningCard}>
                        <Text style={styles.earningLabel}>Monthly</Text>
                        <Text style={styles.earningAmount}>{formatEarnings(earningsData.monthlyEarning)}</Text>
                        <Text style={styles.earningPeriod}>{monthName} {selectedYear}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.earningCard}>
                        <Text style={styles.earningLabel}>Yearly</Text>
                        <Text style={styles.earningAmount}>{formatEarnings(earningsData.yearlyEarning)}</Text>
                        <Text style={styles.earningPeriod}>{selectedYear}</Text>
                    </View>
                </View>

                {/* Info Text */}
                <Text style={styles.infoText}>
                    Showing earnings from sent and paid invoices
                </Text>
            </LinearGradient>

            {/* Month Picker Modal */}
            <Modal
                visible={showMonthPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowMonthPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Month</Text>
                            <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={Array.from({ length: 12 }, (_, i) => ({ month: i, year: selectedYear }))}
                            keyExtractor={(item) => `${item.year}-${item.month}`}
                            renderItem={({ item }) => {
                                const monthName = new Date(item.year, item.month).toLocaleDateString('en-US', { month: 'long' })
                                const isSelected = item.month === selectedMonth && item.year === selectedYear
                                return (
                                    <TouchableOpacity
                                        style={[styles.monthItem, isSelected && styles.monthItemSelected]}
                                        onPress={() => handleMonthSelect(item.month)}
                                    >
                                        <Text style={[styles.monthItemText, isSelected && styles.monthItemTextSelected]}>
                                            {monthName}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={20} color="#10B981" />
                                        )}
                                    </TouchableOpacity>
                                )
                            }}
                        />
                    </View>
                </View>
            </Modal>

            {/* Year Picker Modal */}
            <Modal
                visible={showYearPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowYearPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Year</Text>
                            <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={earningsData.availableYears}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.yearItem, item === selectedYear && styles.yearItemSelected]}
                                    onPress={() => handleYearSelect(item)}
                                >
                                    <Text style={[styles.yearItemText, item === selectedYear && styles.yearItemTextSelected]}>
                                        {item}
                                    </Text>
                                    {item === selectedYear && (
                                        <Ionicons name="checkmark" size={20} color="#10B981" />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No earning records available</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 0,
    },
    widget: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    selectors: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    selector: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    selectorText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    earningsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 20,
    },
    earningCard: {
        flex: 1,
        alignItems: 'center',
    },
    earningLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    earningAmount: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    earningPeriod: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    divider: {
        width: 1,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    infoText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    monthItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    monthItemSelected: {
        backgroundColor: '#F0FDF4',
    },
    monthItemText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    monthItemTextSelected: {
        color: '#10B981',
        fontWeight: '600',
    },
    yearItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    yearItemSelected: {
        backgroundColor: '#F0FDF4',
    },
    yearItemText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    yearItemTextSelected: {
        color: '#10B981',
        fontWeight: '600',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
})
