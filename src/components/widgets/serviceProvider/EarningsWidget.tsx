import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { SPDashboardStats } from '../../../types/serviceProvider'

interface EarningsWidgetProps {
    stats: SPDashboardStats
}

export const EarningsWidget: React.FC<EarningsWidgetProps> = ({ stats }) => {
    const formatCurrency = (amount: number) => {
        return `₨${amount.toLocaleString()}`
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1F7A4D', '#15623D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.label}>Monthly Earnings</Text>
                        <Text style={styles.amount}>{formatCurrency(stats.monthly_earnings)}</Text>
                    </View>
                    <View style={styles.iconContainer}>
                        <Ionicons name="trending-up" size={28} color="#fff" />
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Ionicons name="wallet-outline" size={20} color="rgba(255,255,255,0.9)" />
                        <View style={styles.statContent}>
                            <Text style={styles.statLabel}>Total Earnings</Text>
                            <Text style={styles.statValue}>{formatCurrency(stats.total_earnings)}</Text>
                        </View>
                    </View>

                    <View style={styles.statItem}>
                        <Ionicons name="alert-circle-outline" size={20} color="rgba(255,255,255,0.9)" />
                        <View style={styles.statContent}>
                            <Text style={styles.statLabel}>Outstanding</Text>
                            <Text style={styles.statValue}>{formatCurrency(stats.outstanding_payments)}</Text>
                        </View>
                    </View>

                    <View style={styles.statItem}>
                        <Ionicons name="document-text-outline" size={20} color="rgba(255,255,255,0.9)" />
                        <View style={styles.statContent}>
                            <Text style={styles.statLabel}>Pending Invoices</Text>
                            <Text style={styles.statValue}>{stats.outstanding_payments_count}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        marginBottom: 40,
    },
    gradient: {
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
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
        marginBottom: 4,
    },
    amount: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginBottom: 16,
    },
    stats: {
        gap: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '700',
    },
})
