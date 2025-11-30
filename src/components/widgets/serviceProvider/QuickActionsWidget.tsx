import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export const QuickActionsWidget: React.FC = () => {
    const actions = [
        {
            title: 'New Job',
            icon: 'add-circle' as const,
            color: '#3B82F6',
            route: '/(verticals)/service-provider/jobs/new',
        },
        {
            title: 'Add Client',
            icon: 'person-add' as const,
            color: '#10B981',
            route: '/(verticals)/service-provider/clients/new',
        },
        {
            title: 'Create Invoice',
            icon: 'receipt' as const,
            color: '#F59E0B',
            route: '/(verticals)/service-provider/invoices/new',
        },
        {
            title: 'Add Lead',
            icon: 'star' as const,
            color: '#8B5CF6',
            route: '/(verticals)/service-provider/leads/new',
        },
    ]

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.grid}>
                {actions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.actionButton}
                        onPress={() => router.push(action.route as any)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
                            <Ionicons name={action.icon} size={28} color="#fff" />
                        </View>
                        <Text style={styles.actionTitle}>{action.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        gap: 8,
    },
    actionButton: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
})
