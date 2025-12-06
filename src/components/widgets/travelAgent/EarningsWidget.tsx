import React, { useState, useMemo, useEffect } from 'react'
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
import { useClients } from '../../../hooks/useTravelAgent'
import { supabase } from '../../../lib/supabase'

export function EarningsWidget() {
    const { data: clientsData, refetch } = useClients(1, 1000) // Fetch all clients to get earnings
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [showYearPicker, setShowYearPicker] = useState(false)
    const [currencySymbol, setCurrencySymbol] = useState('$')

    // Refetch clients when component mounts or dashboard is focused
    React.useEffect(() => {
        refetch()
        fetchCurrency()
    }, [])

    const fetchCurrency = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('profiles')
                .select('currency')
                .eq('id', user.id)
                .single()

            if (data?.currency) {
                const currencies = [
                    { code: 'USD', symbol: '$' },
                    { code: 'EUR', symbol: '€' },
                    { code: 'GBP', symbol: '£' },
                    { code: 'INR', symbol: '₹' },
                    { code: 'AUD', symbol: '£' },
                    { code: 'CAD', symbol: '$' },
                    { code: 'SGD', symbol: '$' },
                    { code: 'JPY', symbol: '$' },
                    { code: 'CNY', symbol: '¥' },
                    { code: 'PKR', symbol: 'Rs' },
                ]
                const found = currencies.find(c => c.code === data.currency)
                if (found) setCurrencySymbol(found.symbol)
            }
        } catch (error) {
            console.log('Error fetching currency:', error)
        }
    }

    // Calculate earnings from completed clients
    const earningsData = useMemo(() => {
        if (!clientsData?.data?.data) return { availableYears: [], monthlyEarning: 0, yearlyEarning: 0 }

        const clients = clientsData.data.data
        const earningsByMonthYear: { [key: string]: number } = {}
        const yearSet = new Set<number>()

        clients.forEach(client => {
            if (client.status === 'completed' && client.client_earnings && client.client_earnings.length > 0) {
                client.client_earnings.forEach(earning => {
                    // Parse date string (e.g., "2025-11-28") properly
                    const dateStr = earning.earned_date
                    const [year, month, day] = dateStr.split('-').map(Number)
                    const monthYearKey = `${year}-${month - 1}` // month is 0-indexed

                    earningsByMonthYear[monthYearKey] = (earningsByMonthYear[monthYearKey] || 0) + earning.amount
                    yearSet.add(year)
                })
            }
        })

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
            availableYears: Array.from(yearSet).sort((a, b) => b - a),
            monthlyEarning,
            yearlyEarning,
        }
    }, [clientsData?.data?.data, selectedYear, selectedMonth])

    const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long' })

    const handleMonthSelect = (month: number) => {
        setSelectedMonth(month)
        setShowMonthPicker(false)
    }

    const handleYearSelect = (year: number) => {
        setSelectedYear(year)
        setShowYearPicker(false)
    }

    const formatEarnings = (amount: number): string => {
        if (amount === 0) return `${currencySymbol}0`
        if (amount >= 1000000) {
            return `${currencySymbol}` + Math.floor(amount / 1000000) + 'M'
        }
        if (amount >= 1000) {
            return `${currencySymbol}` + Math.floor(amount / 1000) + 'k'
        }
        return `${currencySymbol}` + amount.toFixed(0)
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
                        <Text style={styles.subtitle}>From completed clients</Text>
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
                    Showing earnings from completed clients
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
                            data={earningsData.availableYears.length > 0 ? earningsData.availableYears : [new Date().getFullYear()]}
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
        marginTop: 32,
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
