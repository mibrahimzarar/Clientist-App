import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

interface AdminStatsWidgetProps {
    totalUsers: number
    newUsers: number
}

export default function AdminStatsWidget({
    totalUsers,
    newUsers
}: AdminStatsWidgetProps) {

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#6366F1', '#4F46E5', '#4338CA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainCard}
            >
                {/* Decorative background circles */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />

                {/* Main Stats Section */}
                <View style={styles.mainStats}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                        style={styles.iconContainer}
                    >
                        <Ionicons name="people" size={36} color="#fff" />
                    </LinearGradient>
                    <View style={styles.mainStatsContent}>
                        <Text style={styles.mainLabel}>TOTAL USERS</Text>
                        <Text style={styles.mainNumber}>{totalUsers}</Text>
                        <View style={styles.underline} />
                    </View>
                </View>

                {/* New Today Section */}
                <View style={styles.statsRow}>
                    <LinearGradient
                        colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
                        style={styles.newTodayCard}
                    >
                        <View style={styles.statIconContainer}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.statIconGradient}
                            >
                                <Ionicons name="person-add" size={20} color="#fff" />
                            </LinearGradient>
                        </View>
                        <View style={styles.statContent}>
                            <Text style={styles.statNumber}>+{newUsers}</Text>
                            <Text style={styles.statLabel}>New Today</Text>
                        </View>
                        <Ionicons name="trending-up" size={24} color="rgba(255,255,255,0.3)" style={styles.trendingIcon} />
                    </LinearGradient>
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
        borderRadius: 28,
        padding: 28,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.4,
        shadowRadius: 32,
        elevation: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    mainStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 28,
        zIndex: 1,
    },
    iconContainer: {
        width: 76,
        height: 76,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    mainStatsContent: {
        gap: 6,
        flex: 1,
    },
    mainLabel: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
    },
    mainNumber: {
        color: '#fff',
        fontSize: 48,
        fontWeight: '900',
        lineHeight: 52,
        letterSpacing: -1,
    },
    underline: {
        width: 60,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        marginTop: 4,
    },
    statsRow: {
        zIndex: 1,
    },
    newTodayCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 20,
        padding: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    statIconContainer: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    statIconGradient: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        flex: 1,
    },
    statNumber: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 32,
        letterSpacing: -0.5,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    trendingIcon: {
        opacity: 0.5,
    },
})
