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
import { useSPInvoices } from '../../../hooks/useServiceProvider'

export function EarningsWidget() {
    const { data: invoicesData } = useSPInvoices()
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [showYearPicker, setShowYearPicker] = useState(false)

    // Calculate earnings from invoices (paid and sent)
    const earningsData = useMemo(() => {
        if (!invoicesData?.data) return { availableMonths: [], availableYears: [], monthlyEarning: 0, yearlyEarning: 0 }

        const earnedInvoices = invoicesData.data.filter(inv => inv.status === 'paid')
        const earningsByMonthYear: { [key: string]: number } = {}
        const yearSet = new Set<number>()
        const monthYearSet = new Set<string>()

        earnedInvoices.forEach(invoice => {
            const date = invoice.due_date ? new Date(invoice.due_date) : new Date()
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
        if (amount === 0) return '0'
        if (amount >= 1000000) {
            return '' + Math.floor(amount / 1000000) + 'M'
        }
        if (amount >= 1000) {
            return '' + Math.floor(amount / 1000) + 'k'
        }
        return '' + amount.toFixed(2)
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1F7A4D', '#15623D']}
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
                            data={earningsData.availableYears.length > 0 ? earningsData.availableYears : [selectedYear]}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => {
                                const isSelected = item === selectedYear
                                return (
                                    <TouchableOpacity
                                        style={[styles.monthItem, isSelected && styles.monthItemSelected]}
                                        onPress={() => handleYearSelect(item)}
                                    >
                                        <Text style={[styles.monthItemText, isSelected && styles.monthItemTextSelected]}>
                                            {item}
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
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    widget: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#1F7A4D',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    selectors: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    selectorText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    earningsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    earningCard: {
        flex: 1,
    },
    earningLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
        fontWeight: '500',
    },
    earningAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    earningPeriod: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 20,
    },
    infoText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
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
        padding: 24,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    monthItemSelected: {
        backgroundColor: '#ECFDF5',
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    monthItemText: {
        fontSize: 16,
        color: '#374151',
    },
    monthItemTextSelected: {
        color: '#10B981',
        fontWeight: '600',
    },
})
