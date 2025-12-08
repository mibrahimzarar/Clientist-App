import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../../lib/supabase'

interface FeatureSuggestion {
    id: string
    user_email: string
    user_name: string | null
    suggestion_text: string
    status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'implemented'
    created_at: string
}

export function FeatureSuggestionsWidget() {
    const [suggestions, setSuggestions] = useState<FeatureSuggestion[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchSuggestions()
    }, [])

    const fetchSuggestions = async () => {
        try {
            const { data, error } = await supabase
                .from('feature_suggestions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) throw error
            setSuggestions(data || [])
        } catch (error) {
            console.error('Error fetching suggestions:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = () => {
        setRefreshing(true)
        fetchSuggestions()
    }

    const updateStatus = async (id: string, status: 'implemented' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('feature_suggestions')
                .update({ status })
                .eq('id', id)

            if (error) throw error
            fetchSuggestions() // Refresh list
        } catch (error) {
            console.error('Error updating suggestion:', error)
            Alert.alert('Error', 'Failed to update suggestion status')
        }
    }

    const deleteSuggestion = async (id: string) => {
        try {
            const { error } = await supabase
                .from('feature_suggestions')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchSuggestions() // Refresh list
        } catch (error) {
            console.error('Error deleting suggestion:', error)
            Alert.alert('Error', 'Failed to delete suggestion')
        }
    }

    const handleSuggestionPress = (suggestion: FeatureSuggestion) => {
        Alert.alert(
            'Manage Suggestion',
            `From: ${suggestion.user_name || suggestion.user_email}\n\n"${suggestion.suggestion_text}"`,
            [
                {
                    text: 'Mark as Implemented',
                    onPress: () => updateStatus(suggestion.id, 'implemented'),
                },
                {
                    text: 'Reject',
                    onPress: () => updateStatus(suggestion.id, 'rejected'),
                    style: 'destructive',
                },
                {
                    text: 'Delete',
                    onPress: () => {
                        Alert.alert(
                            'Confirm Delete',
                            'Are you sure you want to permanently delete this suggestion?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () => deleteSuggestion(suggestion.id),
                                },
                            ]
                        )
                    },
                    style: 'destructive',
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#F59E0B'
            case 'reviewed': return '#3B82F6'
            case 'approved': return '#10B981'
            case 'implemented': return '#8B5CF6'
            case 'rejected': return '#EF4444'
            default: return '#6B7280'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return 'time-outline'
            case 'reviewed': return 'eye-outline'
            case 'approved': return 'checkmark-circle-outline'
            case 'implemented': return 'rocket-outline'
            case 'rejected': return 'close-circle-outline'
            default: return 'help-circle-outline'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const renderSuggestion = ({ item }: { item: FeatureSuggestion }) => (
        <TouchableOpacity
            style={styles.suggestionCard}
            onPress={() => handleSuggestionPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.suggestionHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(item.user_name || item.user_email).charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{item.user_name || 'Anonymous'}</Text>
                        <Text style={styles.userEmail}>{item.user_email}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                    <Ionicons name={getStatusIcon(item.status) as any} size={14} color={getStatusColor(item.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <Text style={styles.suggestionText} numberOfLines={3}>
                {item.suggestion_text}
            </Text>

            <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
        </TouchableOpacity>
    )

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No suggestions yet</Text>
            <Text style={styles.emptySubtext}>Feature suggestions from users will appear here</Text>
        </View>
    )

    if (loading) {
        return (
            <View style={styles.widget}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="bulb" size={20} color="#F59E0B" />
                        </View>
                        <Text style={styles.title}>Feature Suggestions</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.widget}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="bulb" size={20} color="#F59E0B" />
                    </View>
                    <View>
                        <Text style={styles.title}>Feature Suggestions</Text>
                        <Text style={styles.subtitle}>{suggestions.length} total</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                contentContainerStyle={suggestions.length === 0 ? styles.emptyListContent : undefined}
                scrollEnabled={false}
                style={styles.list}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    widget: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    refreshButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    list: {
        maxHeight: 400,
    },
    suggestionCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    suggestionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    suggestionText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 8,
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    emptyState: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
        textAlign: 'center',
    },
    emptyListContent: {
        flexGrow: 1,
    },
})
