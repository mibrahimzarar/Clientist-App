import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AdminUser } from '../../../types/admin'
import { useUsers, useUpdateUserStatus } from '../../../hooks/useAdmin'

export default function AdminUsersWidget() {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const { data, isLoading, refetch } = useUsers(1, 10, { search_term: debouncedSearch })
    const { mutate: updateUserStatus } = useUpdateUserStatus()

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const handleRefresh = async () => {
        setRefreshing(true)
        await refetch()
        setRefreshing(false)
    }



    const users = data?.data?.data || []
    const apiError = data?.error



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>All Users</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={handleRefresh}
                        style={[styles.iconButton, refreshing && styles.iconButtonActive]}
                        disabled={refreshing}
                    >
                        <Ionicons
                            name="refresh"
                            size={20}
                            color={refreshing ? "#8B5CF6" : "#4F46E5"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            {apiError ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={24} color="#EF4444" />
                    <Text style={styles.errorText}>Error: {apiError}</Text>
                    <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#4F46E5" />
                </View>
            ) : (
                <ScrollView
                    style={styles.list}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                >
                    {users.map((user) => {
                        // Prioritize company name/logo as those are what users set in profile
                        const displayName = user.company_name || user.full_name || user.email?.split('@')[0] || 'Unknown User'
                        const avatarUrl = user.company_logo || user.avatar_url

                        const avatarSource = avatarUrl
                            ? { uri: avatarUrl }
                            : { uri: `https://ui-avatars.com/api/?name=${displayName}&background=random&color=fff&size=128` }

                        return (
                            <View key={user.id} style={styles.userCard}>
                                <View style={styles.userInfo}>
                                    <Image
                                        source={avatarSource}
                                        style={styles.avatar}
                                    />
                                    <View>
                                        <Text style={styles.userName}>{displayName}</Text>
                                        <Text style={styles.userEmail}>{user.email}</Text>
                                    </View>
                                </View>
                            </View>
                        )
                    })}

                    {users.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No users found</Text>
                            <Text style={styles.debugText}>(Table: profiles)</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
    },
    iconButtonActive: {
        backgroundColor: '#DDD6FE',
    },
    errorContainer: {
        padding: 20,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
        fontSize: 14,
    },
    retryButton: {
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    retryText: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '600',
    },
    debugText: {
        fontSize: 10,
        color: '#D1D5DB',
        marginTop: 4
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: '#111827',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    list: {
        maxHeight: 360, // ~4 user cards (each ~90px height)
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    userEmail: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
    }
})
