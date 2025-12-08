import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Alert
} from 'react-native'
import { Ionicons, Feather } from '@expo/vector-icons'
import { useUserNotifications, useMarkNotificationAsRead, useMarkAllAsRead } from '../../hooks/useNotifications'
import { supabase } from '../../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export default function NotificationCenter() {
    const [visible, setVisible] = useState(false)
    const { data: notificationData, isLoading } = useUserNotifications()
    const { mutate: markAsRead } = useMarkNotificationAsRead()
    const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead()
    const queryClient = useQueryClient()

    const notifications = notificationData?.data || []
    const unreadCount = notifications.filter(n => !n.is_read).length

    const handleNotificationPress = (notification: any) => {
        if (!notification.is_read) {
            markAsRead(notification.id)
        }
    }

    const handleDelete = (notificationId: string) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('user_notifications')
                                .delete()
                                .eq('id', notificationId)

                            if (error) throw error

                            queryClient.invalidateQueries({ queryKey: ['user-notifications'] })
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete notification')
                            console.error(error)
                        }
                    }
                }
            ]
        )
    }

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.notificationItem, !item.is_read && styles.unreadItem]}>
            <TouchableOpacity
                style={styles.notificationTouchable}
                onPress={() => handleNotificationPress(item)}
            >
                <View style={[styles.iconContainer, !item.is_read && styles.unreadIconContainer]}>
                    <Ionicons
                        name="megaphone-outline"
                        size={20}
                        color={!item.is_read ? '#4F46E5' : '#9CA3AF'}
                    />
                </View>
                <View style={styles.notificationContent}>
                    <Text style={[styles.notificationTitle, !item.is_read && styles.unreadTitle]}>
                        {item.title}
                    </Text>
                    <Text style={styles.notificationMessage} numberOfLines={3}>
                        {item.message}
                    </Text>
                    <Text style={styles.timeAgo}>
                        {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                {!item.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}
            >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
        </View>
    )

    return (
        <>
            <TouchableOpacity onPress={() => setVisible(true)} style={styles.bellButton} activeOpacity={0.8}>
                <Feather name="bell" size={22} color="#1F2937" />
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
                statusBarTranslucent
            >
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.header}>
                                    <Text style={styles.headerTitle}>Notifications</Text>
                                    <TouchableOpacity onPress={() => setVisible(false)}>
                                        <Ionicons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                {unreadCount > 0 && (
                                    <TouchableOpacity
                                        style={styles.markAllButton}
                                        onPress={() => markAllAsRead()}
                                        disabled={isMarkingAll}
                                    >
                                        <Text style={styles.markAllText}>Mark all as read</Text>
                                    </TouchableOpacity>
                                )}

                                {isLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator color="#4F46E5" />
                                    </View>
                                ) : (
                                    <FlatList
                                        data={notifications}
                                        renderItem={renderItem}
                                        keyExtractor={item => item.id}
                                        contentContainerStyle={styles.listContent}
                                        ListEmptyComponent={
                                            <View style={styles.emptyContainer}>
                                                <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
                                                <Text style={styles.emptyText}>No notifications yet</Text>
                                            </View>
                                        }
                                    />
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    bellButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#EF4444',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
        paddingTop: 60,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        maxHeight: '80%',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    markAllButton: {
        alignSelf: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    markAllText: {
        fontSize: 14,
        color: '#4F46E5',
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 16,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        alignItems: 'center',
    },
    notificationTouchable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    unreadItem: {
        backgroundColor: '#F5F3FF',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    unreadIconContainer: {
        backgroundColor: '#EEF2FF',
    },
    notificationContent: {
        flex: 1,
        gap: 4,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    unreadTitle: {
        color: '#111827',
    },
    notificationMessage: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    timeAgo: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4F46E5',
        marginTop: 6,
        marginLeft: 8,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        marginLeft: 8,
    },
})
