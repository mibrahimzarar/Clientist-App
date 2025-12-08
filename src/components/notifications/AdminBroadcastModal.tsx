import React, { useState } from 'react'
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    TouchableWithoutFeedback,
    FlatList,
    Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useCreateAnnouncement, useAnnouncements } from '../../hooks/useNotifications'

interface AdminBroadcastModalProps {
    visible: boolean
    onClose: () => void
}

export default function AdminBroadcastModal({ visible, onClose }: AdminBroadcastModalProps) {
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [targetAudience, setTargetAudience] = useState('all') // 'all', 'freelancer', etc.

    const { mutate: sendAnnouncement, isPending: isSending } = useCreateAnnouncement()
    const { data: historyData, isLoading: isLoadingHistory } = useAnnouncements()

    const handleSend = () => {
        if (!title.trim() || !message.trim()) {
            Alert.alert('Error', 'Please enter both title and message')
            return
        }

        sendAnnouncement(
            { title, message, target_audience: targetAudience },
            {
                onSuccess: () => {
                    Alert.alert('Success', 'Announcement sent successfully')
                    setTitle('')
                    setMessage('')
                    onClose()
                },
                onError: (error) => {
                    Alert.alert('Error', 'Failed to send announcement')
                    console.error(error)
                }
            }
        )
    }

    const renderHistoryItem = ({ item }: { item: any }) => (
        <View style={styles.historyItem}>
            <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.historyDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
            <Text style={styles.historyMessage} numberOfLines={2}>{item.message}</Text>
            <View style={styles.audienceBadge}>
                <Text style={styles.audienceText}>{item.target_audience}</Text>
            </View>
        </View>
    )

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Broadcast Message</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Announcement Title"
                                value={title}
                                onChangeText={setTitle}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Message</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Type your message here..."
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Audience Selector (Simplified) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Target Audience</Text>
                            <View style={styles.audienceRow}>
                                {['all', 'admins'].map(audience => (
                                    <TouchableOpacity
                                        key={audience}
                                        style={[styles.audienceOption, targetAudience === audience && styles.audienceOptionSelected]}
                                        onPress={() => setTargetAudience(audience)}
                                    >
                                        <Text style={[styles.audienceOptionText, targetAudience === audience && styles.audienceOptionTextSelected]}>
                                            {audience.charAt(0).toUpperCase() + audience.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSend}
                            disabled={isSending}
                        >
                            <LinearGradient
                                colors={['#4F46E5', '#3730A3']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                {isSending ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="paper-plane" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.sendButtonText}>Send Announcement</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* History */}
                    <View style={styles.historySection}>
                        <Text style={styles.sectionTitle}>Recent Announcements</Text>
                        {isLoadingHistory ? (
                            <ActivityIndicator color="#4F46E5" />
                        ) : (
                            <FlatList
                                data={historyData?.data || []}
                                renderItem={renderHistoryItem}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.historyList}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>No announcements sent yet</Text>
                                }
                            />
                        )}
                    </View>

                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '90%',
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    form: {
        gap: 16,
        marginBottom: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#111827',
    },
    textArea: {
        minHeight: 100,
    },
    audienceRow: {
        flexDirection: 'row',
        gap: 12,
    },
    audienceOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    audienceOptionSelected: {
        backgroundColor: '#EEF2FF',
        borderColor: '#4F46E5',
    },
    audienceOptionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    audienceOptionTextSelected: {
        color: '#4F46E5',
    },
    sendButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    historySection: {
        flex: 1,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    historyList: {
        gap: 12,
        paddingBottom: 24,
    },
    historyItem: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    historyDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    historyMessage: {
        fontSize: 12,
        color: '#4B5563',
        lineHeight: 18,
        marginBottom: 8,
    },
    audienceBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    audienceText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#4F46E5',
        textTransform: 'uppercase',
    },
    emptyText: {
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 20
    }
})
