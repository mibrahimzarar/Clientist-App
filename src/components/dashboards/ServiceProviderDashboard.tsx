import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { router, Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ServiceProviderDashboard() {
    const insets = useSafeAreaInsets()

    const signOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await supabase.auth.signOut()
                    },
                },
            ]
        )
    }

    const menuItems = [
        {
            title: 'Services',
            description: 'Manage your services',
            icon: 'construct' as const,
            href: '/(verticals)/service-provider/services',
            color: '#10B981'
        },
        {
            title: 'Bookings',
            description: 'View and manage bookings',
            icon: 'calendar' as const,
            href: '/(verticals)/service-provider/bookings',
            color: '#8B5CF6'
        },
        {
            title: 'Clients',
            description: 'Manage your clients',
            icon: 'people' as const,
            href: '/(verticals)/service-provider/clients',
            color: '#F59E0B'
        },
    ]

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Service Provider</Text>
                    <Text style={styles.subtitle}>Dashboard</Text>
                </View>
                <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
                    <Ionicons name="log-out" size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.menuGrid}>
                    {menuItems.map((item, index) => (
                        <Link key={index} href={item.href} asChild>
                            <TouchableOpacity style={[styles.menuItem, { borderLeftColor: item.color }]}>
                                <View style={styles.menuIconContainer}>
                                    <Ionicons name={item.icon} size={24} color={item.color} />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                    <Text style={styles.menuDescription}>{item.description}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </Link>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => router.push('/(app)/profile')}
                >
                    <Ionicons name="settings-outline" size={20} color="#6B7280" />
                    <Text style={styles.settingsText}>Settings</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    signOutButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    menuGrid: {
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    menuDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    settingsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
    },
    settingsText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
})
