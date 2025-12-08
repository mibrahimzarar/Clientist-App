import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

interface AdminStatsWidgetProps {
    totalUsers: number
    activeUsers: number
    totalRevenue: number
    newUsers: number
}

export default function AdminStatsWidget({
    totalUsers,
    activeUsers,
    totalRevenue,
    newUsers
}: AdminStatsWidgetProps) {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4F46E5', '#3730A3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainCard}
            >
                <View style={styles.topSection}>
                    <View style={styles.mainStats}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="people" size={32} color="#fff" />
                        </View>
                        <View style={styles.mainStatsContent}>
                            <Text style={styles.mainLabel}>Total Users</Text>
                            <Text style={styles.mainNumber}>{totalUsers}</Text>
                        </View>
                    </View>

                    <View style={styles.revenueBadge}>
                        <Ionicons name="trending-up" size={16} color="#fff" />
                        <Text style={styles.revenueText}>{formatCurrency(totalRevenue)}</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <View style={styles.statIconContainer}>
                            <Ionicons name="person-add" size={18} color="#A7F3D0" />
                        </View>
                        <View>
                            <Text style={styles.statNumber}>{newUsers}</Text>
                            <Text style={styles.statLabel}>New Today</Text>
                        </View>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statItem}>
                        <View style={styles.statIconContainer}>
                            <Ionicons name="pulse" size={18} color="#FBCFE8" />
                        </View>
                        <View>
                            <Text style={styles.statNumber}>{activeUsers}</Text>
                            <Text style={styles.statLabel}>Active</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    mainCard: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    mainStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainStatsContent: {
        gap: 4,
    },
    mainLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    mainNumber: {
        color: '#fff',
        fontSize: 40,
        fontWeight: '800',
        lineHeight: 40,
    },
    revenueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.4)'
    },
    revenueText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 16,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingLeft: 8,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statNumber: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 24,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 8,
    }
})
