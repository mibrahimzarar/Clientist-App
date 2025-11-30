import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { SPDashboardStats } from '../../../types/serviceProvider'

interface LeadsWidgetProps {
    stats: SPDashboardStats
}

export const LeadsWidget: React.FC<LeadsWidgetProps> = ({ stats }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Leads</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(verticals)/service-provider/leads')}
                    style={styles.viewAllButton}
                >
                    <Text style={styles.viewAllText}>View All</Text>
                    <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={[styles.leadCard, styles.newLeadsCard]}
                    onPress={() => router.push('/(verticals)/service-provider/leads?status=new_lead')}
                    activeOpacity={0.7}
                >
                    <View style={styles.leadIcon}>
                        <Ionicons name="mail-unread" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.leadContent}>
                        <Text style={styles.leadValue}>{stats.new_leads}</Text>
                        <Text style={styles.leadLabel}>New Leads</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.leadCard, styles.hotLeadsCard]}
                    onPress={() => router.push('/(verticals)/service-provider/leads?status=hot_lead')}
                    activeOpacity={0.7}
                >
                    <View style={styles.leadIcon}>
                        <Ionicons name="flame" size={24} color="#EF4444" />
                    </View>
                    <View style={styles.leadContent}>
                        <Text style={styles.leadValue}>{stats.hot_leads}</Text>
                        <Text style={styles.leadLabel}>Hot Leads</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 14,
        color: '#8B5CF6',
        fontWeight: '600',
    },
    content: {
        flexDirection: 'row',
        gap: 12,
    },
    leadCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    newLeadsCard: {
        backgroundColor: '#EFF6FF',
    },
    hotLeadsCard: {
        backgroundColor: '#FEF2F2',
    },
    leadIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    leadContent: {
        flex: 1,
    },
    leadValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    leadLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
})
